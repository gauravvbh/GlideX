import { View, Text, Image } from 'react-native';
import React from 'react';
import { icons } from '@/constants/data';
import CustomButton from './CustomButton';
import { useRouter } from 'expo-router';

const ErrorFindDriver = () => {

    const router = useRouter()
    return (
        <View className="flex-1 justify-center items-center px-6 py-10 bg-white">
            <View className="w-24 h-24 mb-6">
                <Image
                    source={icons.cab}
                    className="w-full h-full"
                    resizeMode="contain"
                />
            </View>

            <View className="flex-row items-center mb-4 space-x-3">
                <Image
                    source={icons.userNotFound}
                    className="w-12 h-12"
                    resizeMode="contain"
                />
                <Text className="font-Jakarta text-2xl text-red-600 font-bold">
                    No Drivers Found
                </Text>
            </View>

            <Text className="font-Jakarta text-center text-base text-gray-700 mb-4">
                We couldn’t find any available drivers for your ride request at the moment.
                This might be due to high demand or network issues.
            </Text>

            <Text className="font-Jakarta text-center text-sm text-gray-500">
                Please try again in a few minutes or return to the home screen to explore other options.
            </Text>

            <CustomButton
                title='Find Other'
                className='w-7/12 mt-10'
                bgVariant='secondary'
                onPress={() => router.replace('/(main)/book-ride')}
            />
        </View>
    );
};

export default ErrorFindDriver;
