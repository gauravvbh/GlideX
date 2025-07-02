import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import Animated, { FadeInLeft, FadeOutRight } from 'react-native-reanimated';
import { icons } from '@/constants/data';
import { AntDesign } from '@expo/vector-icons';
import { RideOfferDetails } from '@/types/type';

const { width } = Dimensions.get('window');

const RiderRidesItem = ({ item, removeIt, acceptRide }: { item: RideOfferDetails, removeIt: (id: string) => void, acceptRide: (id: string) => void }) => {


    const [timer, setTimer] = useState(11);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timer === 0) {
            removeIt(item.id);
            return;
        }

        // Set interval only once when the timer starts
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }

        // Clean up the interval on unmount or when timer reaches 0
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [timer, item.id, removeIt]);

    return (
        <Animated.View
            entering={FadeInLeft.duration(500)}
            exiting={FadeOutRight.duration(500)}
            className="bg-white rounded-2xl p-6 my-3 self-center shadow-md"
            style={{ width: width - 32 }}
        >
            {/* Header */}
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-x-2">
                    <Image source={icons.cab} className="w-9 h-9" resizeMode="contain" />
                    <Text className="text-[22px] font-bold text-[#111]">Car</Text>
                </View>
                <Text className="text-base text-gray-500 font-medium">
                    #{item?.id?.slice(0, 10).toUpperCase() ?? 'RID12345'}
                </Text>
            </View>

            {/* Pickup & Dropoff */}
            <View className="mt-6">
                {/* Pickup */}
                <View className="flex-row gap-x-3 mb-4">
                    <View className="w-3 h-3 rounded-full bg-green-600 mt-2" />
                    <View>
                        <Text className="text-lg text-[#111] font-JakartaBold">{item.pickupDetails.pickup}</Text>
                        <Text className="text-sm text-gray-500 mt-1 font-JakartaMedium">
                            {item.pickupDetails.pickupAddress ?? 'Pickup address'}
                        </Text>
                    </View>
                </View>

                {/* Dropoff */}
                <View className="flex-row gap-x-3">
                    <View className="w-3 h-3 rounded-full bg-red-500 mt-2" />
                    <View>
                        <Text className="text-lg font-semibold text-[#111] font-JakartaBold">{item.dropoffDetails.dropoff}</Text>
                        <Text className="text-sm text-gray-500 mt-1 font-JakartaMedium">
                            {item.dropoffDetails.dropoffAddress ?? 'Dropoff address'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Customer Details */}
            <View className="justify-between mt-7">
                <Text className="font-JakartaSemiBold">Customer Details:</Text>
                <View className="border border-gray-400 p-2 mt-3 rounded-xl">
                    <Text>Name: {item.customerDetails.full_name}</Text>
                    <Text>Email: {item.customerDetails.email}</Text>
                    <Text>Number: {item.customerDetails.number}</Text>
                </View>
            </View>

            {/* Ride Info */}
            <View className="mt-6">
                <Text className="font-JakartaSemiBold">Ride Information:</Text>
                <View className="border border-gray-400 p-2 mt-3 rounded-xl">
                    <Text>Duration: {item.duration}</Text>
                    <Text>Fare: ${item.fare}</Text>
                    <Text>Status: {item.status}</Text>
                </View>
            </View>

            {/* Footer */}
            <View className="flex-row justify-between items-center mt-7">
                <View className="flex-row space-x-7">
                    <View>
                        <Text className="text-base text-gray-500">Pickup</Text>
                        <Text className="text-lg font-bold text-[#111]">{item.pickupDetails.pickupDistance} km</Text>
                    </View>
                </View>

                <View className="flex-row gap-3 items-center justify-center">
                    <View className="bg-red-600 rounded-full p-2">
                        <TouchableOpacity onPress={() => removeIt(item.id)}>
                            <AntDesign name="close" size={25} color="white" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => acceptRide(item.id)}
                        className="bg-yellow-400 px-7 py-2.5 rounded-full flex-row items-center space-x-2.5"
                    >
                        <View className="flex-row gap-x-2">
                            <Text className="font-bold text-lg text-[#111]">Accept</Text>
                            <View className="bg-white rounded-full w-7 h-7 items-center justify-center">
                                <Text className="font-bold text-sm">{timer}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

export default RiderRidesItem;
