// ReachCustomer.tsx

import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import SlideButton from '@/components/SlideButton';
import Map from '@/components/Map';
import { useDriver, useRideOfferStore, useWSStore } from '@/store';
import { useUser } from '@clerk/clerk-expo';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import Constants from 'expo-constants';

const WEBSOCKET_API_URL = Constants.expoConfig?.extra?.webSocketServerUrl;


const ReachCustomer = () => {
    const router = useRouter();

    const { userAddress, setUserLocation: setDriverLocation, setId: setDriverId, setRole: setDriverRole, setFullName: setDriverFullName } = useDriver();

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


    return (
        <View className='flex-1'>
            <View className='h-2/3'>
                <Map />
            </View>
            <View className='flex-1 justify-center items-center px-6 bg-white'>
                <View className="flex-1 justify-center items-center px-6 bg-white">
                    <Text className="text-2xl font-bold mb-4 text-black">
                        Reach the Customer's Location
                    </Text>
                    <Text className="text-center text-gray-600 mb-10">
                        Slide the button below once you’ve arrived at the pickup point.
                    </Text>

                    <SlideButton
                        title="Slide to Confirm Arrival"
                        onComplete={handleSlideComplete}
                        bgColor="#0F9D58"
                        textColor="#fff"
                    />
                </View>
            </View>
        </View>
    );
};

export default ReachCustomer;
