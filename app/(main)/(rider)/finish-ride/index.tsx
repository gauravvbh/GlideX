// ReachCustomer.tsx

import { View, Text, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import SlideButton from '@/components/SlideButton';
import Map from '@/components/Map';
import { useDriver, useRideOfferStore, useWSStore } from '@/store';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import { useUser } from '@clerk/clerk-expo';
import ReactNativeModal from 'react-native-modal';
import CustomButton from '@/components/CustomButton';
import { Linking } from 'react-native';
import Constants from 'expo-constants';
import RideLayout from '@/components/RideLayout';
import { icons } from '@/constants/data';

const WEBSOCKET_API_URL = Constants.expoConfig?.extra?.webSocketServerUrl;



const ReachCustomer = () => {
    const router = useRouter();
    const { user } = useUser();

    const { userAddress, setUserLocation: setDriverLocation, setId: setDriverId, setRole: setDriverRole, setFullName: setDriverFullName } = useDriver();

    const { activeRideId, giveRideDetails, removeRideOffer } = useRideOfferStore(state => state);
    const { ws, setWebSocket } = useWSStore();
    const [showModal, setShowModal] = useState<boolean>(false)
    const [verifyReached, setVerifyReached] = useState<boolean>(false)
    const [verifyReachedStage, setVerifyReachedStage] = useState<'waiting' | 'alert'>('waiting');
    const [lastLocation, setLastLocation] = useState<Location.LocationObject | null>(null);




    useEffect(() => {
        let socket: WebSocket;

        // Either create a new one or use existing one
        if (!ws) {
            const newWs = new WebSocket(WEBSOCKET_API_URL);

            newWs.onopen = () => {
                console.log('WebSocket connected');
            };

            newWs.onerror = (err) => {
                console.log('WebSocket error:', err);
            };

            setWebSocket(newWs);
            socket = newWs;
        } else {
            socket = ws;
        }


        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("📝 Received WS message:", message);

            if (message.type === 'reachedVerified') {
                if (activeRideId) {
                    const rideDetails = giveRideDetails(activeRideId)
                    setVerifyReached(false)
                    setVerifyReachedStage('waiting');
                    setShowModal(true)
                }
            }

            if (message.type === 'customerDidNotVerify') {
                // Trigger emergency alert UI
                setVerifyReachedStage('alert');
            }
        }
    }, [ws]);



    const calculateDistance = (location1: LocationObject, location2: LocationObject) => {
        const lat1 = location1.coords.latitude;
        const lon1 = location1.coords.longitude;
        const lat2 = location2.coords.latitude;
        const lon2 = location2.coords.longitude;

        const toRad = (value: number) => (value * Math.PI) / 180;

        const R = 6371; // Radius of the Earth in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c * 1000; // Distance in meters
    };



    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        const startWatching = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 10000,
                    distanceInterval: 2, // in meters
                },
                async (location) => {
                    console.log('📍 Watched location:', location);

                    // Check if the location has changed significantly
                    if (lastLocation) {
                        const distance = calculateDistance(lastLocation, location);

                        // If distance exceeds 5 meters, send the location update
                        if (distance >= 5) {
                            const address = await Location.reverseGeocodeAsync({
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            });

                            if (ws && ws.readyState === WebSocket.OPEN) {
                                ws.send(
                                    JSON.stringify({
                                        type: 'riderLocationUpdate',
                                        role: 'rider',
                                        driverId: user?.id,
                                        location: {
                                            latitude: location.coords.latitude,
                                            longitude: location.coords.longitude,
                                            address: address[0]?.formattedAddress,
                                        },
                                    })
                                );
                            }
                            setDriverLocation({
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                                address: address[0]?.formattedAddress!,
                            })
                            // Update the last known location
                            setLastLocation(location);
                        }
                    } else {
                        // Set the initial location
                        setLastLocation(location);
                    }

                    // Update the driver location in the store
                    setDriverLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        address: (await Location.reverseGeocodeAsync({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }))[0]?.formattedAddress ?? '',
                    });
                }
            );
        };

        if (user) {
            startWatching();
        }

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
                locationSubscription = null;
            }
        };
    }, [user, lastLocation]);



    const handleSlideComplete = () => {
        if (activeRideId) {
            const rideDetails = giveRideDetails(activeRideId)
            console.log('rideDetails')
            console.log(rideDetails)
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'journeyEnds',
                    role: 'rider',
                    customer_id: rideDetails?.customer_id,
                    id: rideDetails?.id,
                }))
            }
            setVerifyReached(true);
        }
    };

    const handleCallCustomer = () => {
        console.log('❤️')
        console.log(activeRideId)
        if (activeRideId) {
            const rideDetails = giveRideDetails(activeRideId)

            console.log('❤️')
            console.log(rideDetails)

            const customerPhoneNumber = `+91${rideDetails?.customerDetails.number}`;

            const url = `tel:${customerPhoneNumber}`;
            Linking.openURL(url).catch(() => {
                Alert.alert('Error', 'Unable to place call to customer.');
            });
        }

    };

    const handleCallSupport = () => {
        const supportPhoneNumber = '+916290547258'; // Replace with your support number
        const url = `tel:${supportPhoneNumber}`;
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Unable to place call to support.');
        });
    };

    const handleGoHome = () => {
        setVerifyReached(false);
        setVerifyReachedStage("waiting");
        if (activeRideId) {
            const rideDetails = giveRideDetails(activeRideId)
            removeRideOffer(rideDetails?.id!)
        }
        router.replace('/(main)/(rider)/home');
    }

    const rideDetails = giveRideDetails(activeRideId!);
    const customerName = rideDetails?.customerDetails.full_name || 'Customer';
    const customerPhone = rideDetails?.customerDetails.number || '';
    const rideDuration = rideDetails?.duration || '0 mins';
    const rideFare = rideDetails?.fare || '0';
    const rideDistance = rideDetails?.distance || '0 km';
    const pickupAddress = rideDetails?.pickupDetails.pickupAddress || 'Pickup location';
    const destinationAddress = rideDetails?.dropoffDetails.dropoffAddress || 'Destination not set';


    return (
        <RideLayout disabled={true} title="">
            <View className="justify-between bg-white">
                {/* Top: Ride Info */}
                <View>
                    <Text className="text-xl font-JakartaBold mb-6 text-black">Ride Details</Text>

                    {/* Pickup Location */}
                    <View className="flex-row items-start mb-4">
                        <Image
                            source={icons.origin}
                            className="h-6 w-6 mt-1"
                            resizeMode="contain"
                        />
                        <Text className="ml-3 text-base text-black flex-1 leading-6">
                            {pickupAddress || 'Pickup location'}
                        </Text>
                    </View>

                    {/* Destination */}
                    <View className="flex-row items-start">
                        <Image
                            source={icons.destination}
                            className="h-6 w-6 mt-1"
                            resizeMode="contain"
                        />
                        <Text className="ml-3 text-base text-black flex-1 leading-6">
                            {destinationAddress || 'Dropoff location'}
                        </Text>
                    </View>
                </View>

                {/* Call Customer */}
                {customerPhone && (
                    <View className="mt-8 flex-row items-center justify-between bg-neutral-100 p-4 rounded-lg border border-neutral-300">
                        <View>
                            <Text className="text-base font-JakartaMedium text-neutral-700">Need Help?</Text>
                            <Text className="text-sm text-neutral-500">Call the customer</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleCallCustomer}
                            className="bg-black px-4 py-2 rounded-full"
                        >
                            <Text className="text-white font-JakartaSemiBold text-base">Call</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Slide Button */}
                <View className="mt-10">
                    <Text className="text-center text-neutral-600 text-sm mb-3">
                        Slide to confirm once you've reached the dropoff location
                    </Text>
                    <SlideButton
                        title="Slide to Confirm Drop-off"
                        onComplete={handleSlideComplete}
                        bgColor="#0F9D58"
                        textColor="#fff"
                    />
                </View>
            </View>

            {/* Dropoff Confirmed Modal */}
            <ReactNativeModal isVisible={showModal}>
                <View className="bg-white p-6 rounded-2xl border border-neutral-200 w-11/12 self-center">
                    {/* Header */}
                    <View className="items-center mb-4">
                        <Text className="text-xl font-JakartaBold text-black text-center mb-1">
                            Ride Completed ✅
                        </Text>
                        <Text className="text-sm font-JakartaLight text-neutral-600 text-center">
                            You've successfully dropped off the customer.
                        </Text>
                    </View>

                    {/* Fare Summary */}
                    <View className="my-4 bg-neutral-100 rounded-lg p-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm font-JakartaMedium text-neutral-700">Total Fare</Text>
                            <Text className="text-base font-JakartaSemiBold text-black">${rideFare}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-neutral-500">Distance</Text>
                            <Text className="text-sm text-neutral-500">{rideDistance}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-sm text-neutral-500">Duration</Text>
                            <Text className="text-sm text-neutral-500">{rideDuration}</Text>
                        </View>
                    </View>

                    {/* Payment Method Section */}
                    <View className="mt-2 mb-4">
                        <Text className="text-base font-JakartaMedium text-neutral-800 mb-3">
                            Collect Payment From Customer
                        </Text>
                    </View>

                    {/* Action Button */}
                    <CustomButton title="Browse Home" className="w-full mt-4" onPress={handleGoHome} />
                </View>
            </ReactNativeModal>


            {/* Waiting or Alert Modal */}
            <ReactNativeModal isVisible={verifyReached}>
                <View className="bg-white border border-gray-300 p-6 rounded-lg items-center w-11/12 self-center">
                    {verifyReachedStage === 'waiting' ? (
                        <>
                            <Text className="text-xl font-JakartaBold text-center mb-2 text-black">
                                Waiting for Customer Confirmation
                            </Text>
                            <Text className="text-center text-gray-600 mb-5">
                                Request sent to customer. Awaiting their drop-off confirmation.
                            </Text>
                            <ActivityIndicator size="small" color="#64B5F6" />
                        </>
                    ) : (
                        <>
                            <Text className="text-xl font-JakartaBold text-center mb-2 text-red-600">
                                ⚠️ No Response from Customer
                            </Text>
                            <Text className="text-center text-gray-600 mb-6">
                                Customer hasn't confirmed. Please check their safety or report the situation.
                            </Text>

                            <View className="flex-row items-center mb-5 gap-x-2">
                                <CustomButton
                                    title="Call Customer"
                                    className="w-1/2 mb-3"
                                    onPress={handleCallCustomer}
                                />
                                <CustomButton
                                    title="Call Support"
                                    bgVariant="danger"
                                    textVariant="primary"
                                    className="w-1/2 mb-3"
                                    onPress={handleCallSupport}
                                />
                            </View>

                            <CustomButton
                                title="Browse Home"
                                bgVariant="secondary"
                                textVariant="secondary"
                                className="w-full"
                                onPress={handleGoHome}
                            />
                        </>
                    )}
                </View>
            </ReactNativeModal>
        </RideLayout>

    );
};

export default ReachCustomer;
