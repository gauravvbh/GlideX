import { View, Text, Image, TouchableOpacity, Linking, Dimensions, ScrollView } from 'react-native';
import React, { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useRidesStore } from '@/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '@/constants/data';
import Constants from 'expo-constants';

const googleMapsApiKey = Constants.expoConfig?.extra?.googleMapsApiKey;

const ShowRide = () => {
    const { rideId } = useLocalSearchParams();
    const { setSelectedRide, selectedRide } = useRidesStore();

    useEffect(() => {
        if (typeof rideId === 'string') {
            setSelectedRide(rideId);
        }
    }, [rideId]);

    // console.log(selectedRide);
    if (!selectedRide) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <Text className="text-white text-2xl">Loading...</Text>
            </View>
        );
    }

    const {
        destination_address,
        origin_address,
        destination_latitude,
        destination_longitude,
        origin_latitude,
        origin_longitude,
        driver,
        fare_price,
        payment_status
    } = selectedRide;

    return (
        <SafeAreaView className="flex-1 bg-gray-900">

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-900">
                <View className="flex-1 justify-between">
                    {/* Header */}
                    <View className="p-6">
                        <Text className="text-white text-5xl font-extrabold text-center">Ride Details</Text>
                        <View className='absolute z-10 top-6 left-5'>
                            <TouchableOpacity
                                onPress={() => router.back()}
                            >
                                <View className='w-10 h-10 bg-white rounded-full items-center justify-center'>
                                    <Image
                                        source={icons.backArrow}
                                        className='w-6 h-6'
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Driver Info */}
                    <View className="flex-row items-center justify-center mb-8 p-6 bg-gray-800 rounded-lg shadow-xl mx-6">
                        <Image
                            source={{ uri: driver.profile_image_url || 'default-image-url' }}
                            className="w-24 h-24 rounded-full border-4 border-gray-700 shadow-lg mr-6"
                        />
                        <View className="flex-1">
                            <Text className="text-white text-3xl font-bold">{driver.full_name}</Text>
                            <Text className="text-gray-400 text-xl">Rating: {driver.rating} ★</Text>
                            <Text className="text-gray-400 text-xl">Seats: {driver.car_seats}</Text>
                        </View>
                    </View>

                    {/* Car Image */}
                    <View className='flex-row items-center mb-8 p-6 bg-gray-800 rounded-lg mx-6 justify-around'>
                        <Text className='text-white font-JakartaSemiBold text-2xl'>Travelled by:</Text>
                        <View className='bg-gray-500 p-1 rounded-full'>
                            <Image
                                source={{ uri: driver.car_image_url || 'default-car-image-url' }}
                                className="w-24 h-24 rounded-full"
                            />
                        </View>
                    </View>

                    {/* Map */}
                    <View className="mb-8 mx-6">
                        <Text className="text-white text-3xl font-semibold mb-4">Route Map</Text>
                        <Image
                            source={{
                                // uri: `https://maps.googleapis.com/maps/api/staticmap?center=${origin_latitude},${origin_longitude}&zoom=10&size=250x250&markers=color:red%7Clabel:O%7C${origin_latitude},${origin_longitude}&markers=color:blue%7Clabel:D%7C${destination_latitude},${destination_longitude}&key=${googleMapsApiKey}`

                                uri: `https:maps.googleapis.com/maps/api/staticmap?center=${destination_latitude},${destination_longitude}&zoom=12&size=250x250&maptype=roadmap&key=${googleMapsApiKey}`
                            }}
                            className="w-full h-56 rounded-xl shadow-xl"
                        />
                    </View>

                    {/* Ride Info */}
                    <View className="bg-gray-800 p-6 mx-6 rounded-lg shadow-xl mb-8">
                        <Text className="text-white text-2xl font-semibold mb-4">Ride Information</Text>
                        <Text className="text-gray-300 text-lg mb-4">Origin: {origin_address}</Text>
                        <Text className="text-gray-300 text-lg mb-4">Destination: {destination_address}</Text>
                        <Text className="text-gray-300 text-lg mb-4">Fare: ${fare_price}</Text>
                        {/* <Text className="text-gray-300 text-lg mb-4">Time: {ride_time} mins</Text> */}
                        <Text className="text-gray-300 text-lg mb-4">Payment: {payment_status}</Text>
                    </View>

                    {/* Optional Call Button */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ShowRide;
