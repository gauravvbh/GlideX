import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { RideData } from '@/types/type'
import { icons } from '@/constants/data'
import { useRouter } from 'expo-router'
import { formatDate, formatTime } from '@/lib/utils'
import Constants from 'expo-constants';

const googleMapsApiKey = Constants.expoConfig?.extra?.googleMapsApiKey;


const RideCard = ({ ride }: { ride: RideData }) => {

  const router = useRouter();

  const {
    origin_address,
    destination_address,
    destination_latitude,
    destination_longitude,
    created_at,
    payment_status,
    driver,
    ride_id
  } = ride;


  return (
    <TouchableOpacity onPress={() => router.push(`/(main)/(customer)/show-ride/${ride_id}`)}>
      <View className='flex flex-row items-center justify-center rounded-lg shadow-sm shadow-neutral-300'>
        <View className='flex flex-col items-center justify-center p-3'>
          <View className='flex flex-row items-center justify-between bg-red-50'>
            <Image
              source={{
                uri: `https://maps.googleapis.com/maps/api/staticmap?center=${destination_latitude},${destination_longitude}&zoom=15&size=200x200&maptype=roadmap&key=${googleMapsApiKey}`
              }}
              className='w-[80px] h-[90px] rounded-lg'

            />
            <View className='flex flex-col mx-5 gap-y-5 flex-1'>
              <View className='flex flex-row items-center gap-x-2'>
                <Image
                  source={icons.to}
                  className='w-5 h-5'
                />
                <Text className='text-md font-JakartaMedium' numberOfLines={1}>{origin_address}</Text>
              </View>

              <View className='flex flex-row items-center gap-x-2'>
                <Image
                  source={icons.point}
                  className='w-5 h-5'
                />
                <Text className='text-md font-JakartaMedium' numberOfLines={1}>{destination_address}</Text>
              </View>
            </View>
          </View>

          <View className='flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center'>
            <View className='flex flex-row items-center w-full justify-between mb-5'>
              <Text className='text-md font-JakartaMedium text-gray-500'>
                Ride Date
              </Text>
              <Text className='text-md font-JakartaMedium text-gray-500'>
                {formatDate(created_at)}
              </Text>
            </View>

            <View className='flex flex-row items-center w-full justify-between mb-5'>
              <Text className='text-md font-JakartaMedium text-gray-500'>
                Driver
              </Text>
              <Text className='text-md font-JakartaMedium text-gray-500'>
                {driver.full_name}
              </Text>
            </View>

            <View className='flex flex-row items-center w-full justify-between mb-5'>
              <Text className='text-md font-JakartaMedium text-gray-500'>
                Car Seats
              </Text>
              <Text className='text-md font-JakartaMedium text-gray-500'>
                {driver.car_seats}
              </Text>
            </View>

            <View className='flex flex-row items-center w-full justify-between mb-5'>
              <Text className='text-md font-JakartaMedium text-gray-500'>
                Payment Status
              </Text>
              <Text className={`text-md font-JakartaMedium capitalize ${payment_status === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>
                {payment_status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default RideCard