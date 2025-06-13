import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
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
        <SafeAreaView className="flex-1 bg-[#0F0F0F]">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-[#0F0F0F]">
                <View className="flex-1 justify-between">

                    {/* Header */}
                    <View className="p-6 relative">
                        <Text className="text-white text-4xl font-JakartaBold text-center">Ride Details</Text>
                        <View className="absolute top-6 left-5 z-10">
                            <TouchableOpacity onPress={() => router.back()}>
                                <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                                    <Image source={icons.backArrow} className="w-5 h-5 tint-white" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Driver Info */}
                    <View className="flex-row items-center justify-center mb-6 p-4 bg-zinc-900 rounded-2xl mx-5 border border-zinc-800">
                        <Image
                            source={{ uri: driver.profile_image_url || 'default-image-url' }}
                            className="w-20 h-20 rounded-full border-2 border-zinc-700 mr-4"
                        />
                        <View className="flex-1">
                            <Text className="text-white text-2xl font-JakartaSemiBold">{driver.full_name}</Text>
                            <Text className="text-zinc-400 text-base">Rating: {driver.rating} ★</Text>
                            <Text className="text-zinc-400 text-base">Seats: {driver.car_seats}</Text>
                        </View>
                    </View>

                    {/* Car Image */}
                    <View className="flex-row items-center mb-6 p-4 bg-zinc-900 rounded-2xl mx-5 justify-between border border-zinc-800">
                        <Text className="text-white font-JakartaSemiBold text-xl">Travelled by:</Text>
                        <View className="bg-zinc-700 p-1 rounded-full">
                            <Image
                                source={{ uri: driver.car_image_url || 'default-car-image-url' }}
                                className="w-20 h-20 rounded-full"
                            />
                        </View>
                    </View>

                    {/* Map */}
                    <View className="mb-6 mx-5">
                        <Text className="text-white text-2xl font-JakartaSemiBold mb-3">Route Map</Text>
                        <Image
                            source={{
                                uri: `https://maps.googleapis.com/maps/api/staticmap?center=${destination_latitude},${destination_longitude}&zoom=12&size=250x250&maptype=roadmap&key=${googleMapsApiKey}`
                            }}
                            className="w-full h-56 rounded-xl border border-zinc-800"
                        />
                    </View>

                    {/* Ride Info */}
                    <View className="bg-zinc-900 p-5 mx-5 rounded-2xl border border-zinc-800 mb-8">
                        <Text className="text-white text-2xl font-JakartaBold mb-4">Ride Information</Text>
                        <Text className="text-zinc-300 text-base mb-2">Origin: {origin_address}</Text>
                        <Text className="text-zinc-300 text-base mb-2">Destination: {destination_address}</Text>
                        <Text className="text-zinc-300 text-base mb-2">Fare: ${fare_price}</Text>
                        <Text className="text-zinc-300 text-base">Payment: {payment_status}</Text>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ShowRide;
