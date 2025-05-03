import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import RideLayout from '@/components/RideLayout';
import GoogleTextInput from '@/components/GoogleTextInput';
import { icons } from '@/constants/data';
import CustomButton from '@/components/CustomButton';
import { useRouter } from 'expo-router';
import { useCustomer } from '@/store';
import { useUser } from '@clerk/clerk-expo';


const FindRidePage = () => {

    const {
        userAddress,
        destinationAddress,
        destinationLatitude,
        destinationLongitude,
        setUserLocation,
        setDestinationLocation
    } = useCustomer();


    const router = useRouter();

    return (
        <RideLayout title='Ride'>
            <View className=''>
                <Text className='text-lg font-JakartaSemiBold mb-3'>From</Text>
                <GoogleTextInput
                    icon={icons.target}
                    initialLocation={userAddress!}
                    containerStyle='bg-neutral-100'
                    textInputBackgroundColor='#f5f5f5'
                    handlePress={(location) => setUserLocation(location)}
                />
            </View>

            <View className=''>
                <Text className='text-lg font-JakartaSemiBold mb-3'>To</Text>
                <GoogleTextInput
                    icon={icons.map}
                    initialLocation={destinationAddress || 'Enter Destination'}
                    containerStyle='bg-neutral-100'
                    textInputBackgroundColor='transparent'
                    handlePress={(location) => setDestinationLocation(location)}
                />
            </View>
            <CustomButton
                title='Find now'
                onPress={() => router.push('/(main)/book-ride' as never)}
                className='mt-5 w-full'
            />
        </RideLayout>
    )
}

export default FindRidePage