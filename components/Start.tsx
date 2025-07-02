import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { icons } from '@/constants/data'


const Start = ({ otp }: { otp: string }) => {

    return (
        <View className='flex-row gap-x-5'>
            <View className='h-20  w-20'>
                <Image
                    source={icons.cab}
                    className='w-full h-full'
                    resizeMode='contain'
                />
            </View>
            <View className='justify-center'>
                <Text className='font-Jakarta text-lg'>Ride near me</Text>
                <Text className='font-JakartaSemiBold text-2xl'>OTP - {otp}</Text>
            </View>
        </View>
    )
}

export default Start