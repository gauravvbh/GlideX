// ReachCustomer.tsx

import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import SlideButton from '@/components/SlideButton';
import Map from '@/components/Map';
import { useDriver, useRideOfferStore, useWSStore } from '@/store';
import { useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import RideLayout from '@/components/RideLayout';
import { icons } from '@/constants/data';

const WEBSOCKET_API_URL = Constants.expoConfig?.extra?.webSocketServerUrl;


const ReachCustomer = () => {
    const router = useRouter();

    const { userAddress, setUserLocation: setDriverLocation, setId: setDriverId, setRole: setDriverRole, setFullName: setDriverFullName } = useDriver.getState();

    const { ws, setWebSocket } = useWSStore();

    const { activeRideId, giveRideDetails } = useRideOfferStore();

    const { user } = useUser();
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
        const details = giveRideDetails(activeRideId!);

        if (ws && ws.readyState === WebSocket.OPEN && details !== undefined) {
            ws.send(JSON.stringify({
                type: 'reached',
                role: 'rider',
                id: activeRideId,
                driver_id: user?.id,
                customer_id: details.customer_id
            }))
        }
        router.replace('/(main)/(rider)/enter-otp');
    };

    const rideDetails = giveRideDetails(activeRideId!);
    const customerName = rideDetails?.customerDetails.full_name || 'Customer';
    const customerPhone = rideDetails?.customerDetails.number || '';
    const pickupAddress = rideDetails?.pickupDetails.pickupAddress || 'Pickup location';
    const destinationAddress = rideDetails?.dropoffDetails.dropoffAddress || 'Destination not set';


    const callCustomer = () => {
        if (customerPhone) {
            Linking.openURL(`tel:${customerPhone}`);
        } else {
            alert('Phone number not available');
        }
    };


    return (
        <RideLayout disabled={true} title="">
            <View className="justify-between bg-white">
                {/* Heading */}
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
                            {pickupAddress}
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
                            {destinationAddress}
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
                            onPress={callCustomer}
                            className="bg-black px-4 py-2 rounded-full"
                        >
                            <Text className="text-white font-JakartaSemiBold text-base">Call</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Slide Button */}
                <View className="mt-10">
                    <Text className="text-center text-neutral-600 text-sm mb-3">
                        Slide to confirm once you've reached the pickup location
                    </Text>
                    <SlideButton
                        title="Slide to Confirm Arrival"
                        onComplete={handleSlideComplete}
                        bgColor="#0F9D58"
                        textColor="#fff"
                    />
                </View>
            </View>
        </RideLayout>
    );
};

export default ReachCustomer;
