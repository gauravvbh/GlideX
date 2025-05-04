import { View, Text, FlatList, Image, ActivityIndicator, Platform } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import RiderHeader from '@/components/RiderHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import CustomButton from '@/components/CustomButton'
import ReactNativeModal from 'react-native-modal'
import { router } from 'expo-router'
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import { useDriver, useDriverDetails, useRideOfferStore, useUserStore, useWSStore } from '@/store'
import { AntDesign } from '@expo/vector-icons'
import RiderRidesItem from '@/components/RiderRidesItem'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'



const RideHome = () => {

    const [loading, setLoading] = useState<boolean>(true);
    const [hasPermissions, setHasPermissions] = useState<boolean>(false)
    const { user, isLoaded } = useUser();
    const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const locationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [lastLocation, setLastLocation] = useState<Location.LocationObject | null>(null);
    const [todayEarnings, setTodayEarnings] = useState('')



    const { userAddress, setUserLocation: setDriverLocation, setId: setDriverId, setRole: setDriverRole, setFullName: setDriverFullName } = useDriver();


    const { ws, setWebSocket } = useWSStore(state => state)

    const {
        addRideOffer,
        removeRideOffer,
        rideOffer,
        giveRideDetails,
        setActiveRideId
    } = useRideOfferStore()

    const {
        isVerified,
        setIsVerified,
        onDuty
    } = useDriverDetails()

    const { role } = useUserStore();
    const data = user?.publicMetadata;


    // useEffect(() => {
    //     const addRole = async () => {
    //         try {
    //             const result = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/(api)/clerk-role`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({
    //                     clerk_id: user?.id,
    //                     role: 'rider',
    //                     email: user?.primaryEmailAddress?.emailAddress
    //                 })
    //             });
    //             const data = await result.json();

    //         } catch (error) {
    //             console.log(error)
    //         }
    //     }

    //     if (user) {
    //         addRole();
    //     }
    // }, [user])




    const sendLocationToWebSocket = async () => {

        if (isVerified && onDuty) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                let location = await Location.getCurrentPositionAsync();
                const address = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                ws.send(JSON.stringify({
                    type: 'riderLocationUpdate',
                    role: 'rider',
                    driverId: user!.id,
                    location: {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        address: address[0]?.formattedAddress
                    }
                }));
            }
        }
    };



    useEffect(() => {
        if (isVerified) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                if (!onDuty) {
                    ws.send(JSON.stringify({
                        type: 'offDuty',
                        role: 'rider',
                        driverId: user?.id
                    }))
                }
                else {
                    // 🚀 When toggled ON duty, tell the websocket
                    ws.send(JSON.stringify({
                        type: 'onDuty',
                        role: 'rider',
                        driverId: user?.id,
                    }));

                    // Optionally send latest location immediately
                    sendLocationToWebSocket();
                }
            }
        }
    }, [onDuty])


    console.log(onDuty)
    //delete
    const removeRide = (id: string) => {

        const details = giveRideDetails(id)
        removeRideOffer(id);
        if (ws && ws.readyState === WebSocket.OPEN && details !== undefined) {
            ws.send(JSON.stringify({
                type: 'rejectRideOffer',
                role: 'rider',
                id,
                driver_id: user?.id,
                customer_id: details.customer_id
            }))
        }
    }

    const acceptRide = (id: string) => {
        const details = giveRideDetails(id)
        setActiveRideId(id);
        if (ws && ws.readyState === WebSocket.OPEN && details !== undefined) {
            ws.send(JSON.stringify({
                type: 'acceptRideOffer',
                role: 'rider',
                id,
                driver_id: user?.id,
                customer_id: details.customer_id
            }))
        }
        router.replace('/(main)/(rider)/find-customer')
    }


    useEffect(() => {
        if (!user) return;

        let socket: WebSocket;
        if (!ws) {
            const newWs = new WebSocket('wss://websocket-server-for-glidex.onrender.com');

            newWs.onopen = () => {
                newWs.send(JSON.stringify({
                    type: 'register',
                    id: user.id,
                    role: 'rider',
                }));
                console.log("WebSocket connected");
            };

            newWs.onerror = () => {
                console.log('An error occurred while connecting to the server.');
            };

            newWs.onclose = () => {
                console.log("WebSocket closed");
            };
            setWebSocket(newWs);
            socket = newWs;
        } else {
            socket = ws;
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Message received from WebSocket:', message);
            if (message.type === 'newRideOffer') {
                addRideOffer(message.rideDetails);
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: "🚗 New Ride Offer!",
                        body: `Pickup at ${message.rideDetails.pickupAddress}`,
                        data: { rideId: message.rideDetails.id },
                    },
                    trigger: null

                });
            }
        };

    }, [ws]);

    console.log("WebSocket instance in RideHome", ws);


    const registerForPushNotificationsAsync = async () => {
        let token;

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            })).data;
            console.log('Expo Push Token:', token);
        } else {
            alert('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    };

    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);





    useEffect(() => {
        setLoading(true)
        const getDriverData = async () => {
            try {
                const res = await fetch(`/(api)/driver/get?clerk_id=${user?.id}`);
                const data = await res.json();

                const isDataPresent = !!data[0].car_image_url;
                // console.log(isDataPresent)
                if (data.length === 0 || !data[0].car_image_url) {
                    setIsVerified(false);
                    return;
                }
                setIsVerified(true);
            } catch (error) {
                console.log('API fetch error:', error);
            } finally {
                setLoading(false)
            }
        };

        if (user?.id) {
            getDriverData();
        }
    }, [user]);


    useEffect(() => {
        setLoading(true)
        const getDriverData = async () => {
            try {
                const res = await fetch(`/(api)/driver/calculate-price?clerk_id=${user?.id}`);
                const data = await res.json();

                setTodayEarnings(data.totalEarnings)
            } catch (error) {
                console.log('API fetch error:', error);
            } finally {
                setLoading(false)
            }
        };

        if (user?.id) {
            getDriverData();
        }
    }, [user]);




    useEffect(() => {
        if (!isLoaded) return;
        if (loading) return;

        if (!isVerified) {
            setShowVerifyModal(true);

            // Set up interval only once
            if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                    setShowVerifyModal(true);
                }, 6000); // 6 seconds
            }
        } else {
            // ✅ Clear modal and interval if verified
            setShowVerifyModal(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isLoaded, isVerified, loading]);



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

        if (user && onDuty) {
            startWatching();
        }

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
                locationSubscription = null;
            }
        };
    }, [user, onDuty, lastLocation]);




    useEffect(() => {
        const requestLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                return;
            }
            let location = await Location.getCurrentPositionAsync();
            const address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
            console.log(address)
            setHasPermissions(true)

            // Send initial location to WebSocket when permissions are granted
            if (ws && ws.readyState === WebSocket.OPEN) {
                console.log('sending driver location to the websocket')
                sendLocationToWebSocket();
            }

            if ((role ?? data?.role) === 'rider') {
                setDriverLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    address: address[0]?.formattedAddress ?? ''
                });

                if (role) setDriverRole({ role });
                if (user) {
                    setDriverId({ customerId: user.id });
                    setDriverFullName({ full_name: user.fullName ?? '' });
                }
            }
        };
        console.log("Interval running: onDuty=", onDuty, "isVerified=", isVerified);

        if (user && onDuty) {
            requestLocation();
            // Set up polling to continuously update location every 50 seconds
            if (locationUpdateIntervalRef.current) {
                clearInterval(locationUpdateIntervalRef.current);
            }
            locationUpdateIntervalRef.current = setInterval(() => {
                sendLocationToWebSocket();
            }, 50000); // Update every 50 seconds
        }

        // Clear interval on unmount
        return () => {
            if (locationUpdateIntervalRef.current) {
                clearInterval(locationUpdateIntervalRef.current);
                locationUpdateIntervalRef.current = null;
            }
        };
    }, [user, userAddress, onDuty]);



    // Interval handling for location updates
    useEffect(() => {
        if (!user || !onDuty) return;

        const locationUpdateInterval = setInterval(() => {
            sendLocationToWebSocket();
        }, 50000);

        return () => clearInterval(locationUpdateInterval); // Clean up interval when onDuty status changes
    }, [user, onDuty]);



    const handleDismissModal = () => {
        setShowVerifyModal(false);
    };

    const handleStartVerification = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setShowVerifyModal(false);
        router.push('/(main)/(rider)/verification');
    };

    return (
        <SafeAreaView className='flex-1'>
            {
                loading ? (
                    <View className='flex-1 justify-center items-center gap-y-10'>
                        <Text className='text-white font-JakartaSemiBold text-3xl mx-20 text-center'>
                            Loading the rider details...
                        </Text>
                        <ActivityIndicator size={100} color='white' />
                    </View>
                ) : (
                    <>
                        <RiderHeader hasPermissions={hasPermissions} todayEarnings={todayEarnings} />
                        {/* <CustomButton title="Refresh Location" onPress={sendLocationToWebSocket} /> */}

                        {
                            isVerified ? (
                                <FlatList
                                    data={!onDuty ? [] : rideOffer}
                                    renderItem={({ item, index }) => (
                                        <RiderRidesItem removeIt={() => removeRide(item.id)} item={item} acceptRide={() => acceptRide(item.id)} />
                                    )}
                                    keyExtractor={(item) => item?.id || Math.random().toString()}
                                    contentContainerStyle={{
                                        padding: 16,
                                        flexGrow: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                    ListEmptyComponent={
                                        <View className="flex-1 justify-center items-center">
                                            {
                                                onDuty ? (
                                                    <Image
                                                        source={require('@/assets/icons/ride.jpg')}
                                                        className="w-40 h-40 mt-10 scale-x-[-1]"
                                                        resizeMode='contain'
                                                    />
                                                ) : (
                                                    <AntDesign name='poweroff' size={100} color='white' />
                                                )
                                            }
                                            <Text className='text-center text-2xl my-10 mx-20 text-white'>
                                                {onDuty ? "There are no available rides, stay active!!!" : "You're currently OFF duty please go ON duty to start earning"}
                                            </Text>
                                        </View>
                                    }
                                />
                            ) : (
                                <View className='flex-1 h-full justify-center items-center'>
                                    <Text className="text-xl font-JakartaBold text-center mb-3 text-white">
                                        Verification Required
                                    </Text>
                                    <Text className="text-gray-500 font-JakartaLight text-center mb-5">
                                        Please verify your details to start earning.
                                    </Text>
                                    <CustomButton title="Verify Now" className='w-4/6' onPress={handleStartVerification} />
                                </View>
                            )
                        }
                        <ReactNativeModal isVisible={showVerifyModal}>
                            <View className="bg-white p-5 rounded-lg items-center">
                                <Text className="text-xl font-JakartaBold text-center mb-3 text-black">
                                    Verification Required
                                </Text>
                                <Text className="text-gray-700 font-JakartaLight text-center mb-5">
                                    Please verify your details to start earning.
                                </Text>
                                <CustomButton title="Verify Now" className='w-4/6' onPress={handleStartVerification} />
                                <CustomButton
                                    title="Later"
                                    className="mt-3 bg-gray-300 w-1/3"
                                    onPress={handleDismissModal}
                                />
                            </View>
                        </ReactNativeModal>
                    </>
                )
            }
        </SafeAreaView>

    )
}

export default RideHome