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
      <View className="bg-gradient-to-br from-[#1e1e1e] to-[#121212] rounded-2xl mb-6 p-[1.5px] shadow-md shadow-gray-300/30">
        <View className="bg-neutral-900 rounded-2xl p-3">
          <View className="flex flex-col items-center justify-center w-full">

            {/* Top Map + Route Info */}
            <View className="flex flex-row items-center justify-between">
              <Image
                source={{
                  uri: `https://maps.googleapis.com/maps/api/staticmap?center=${destination_latitude},${destination_longitude}&zoom=15&size=200x200&maptype=roadmap&key=${googleMapsApiKey}`
                }}
                className="w-[80px] h-[90px] rounded-lg"
              />
              <View className="flex flex-col mx-5 gap-y-4 flex-1">
                <View className="flex flex-row items-center gap-x-2">
                  <Image source={icons.to} className="w-5 h-5 tint-white/80" />
                  <Text className="text-md font-JakartaMedium text-white/90" numberOfLines={1}>
                    {origin_address}
                  </Text>
                </View>

                <View className="flex flex-row items-center gap-x-2">
                  <Image source={icons.point} className="w-5 h-5 tint-white/80" />
                  <Text className="text-md font-JakartaMedium text-white/90" numberOfLines={1}>
                    {destination_address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Info Section – DO NOT TOUCH */}
            <View className="flex flex-col w-full mt-4 bg-neutral-800 rounded-lg p-4 border border-neutral-700">
              <View className="flex flex-row justify-between mb-3">
                <Text className="text-sm text-white/60 font-JakartaMedium">Ride Date</Text>
                <Text className="text-sm text-white/80 font-JakartaMedium">{formatDate(created_at)}</Text>
              </View>

              <View className="flex flex-row justify-between mb-3">
                <Text className="text-sm text-white/60 font-JakartaMedium">Driver</Text>
                <Text className="text-sm text-white/80 font-JakartaMedium">{driver.full_name}</Text>
              </View>

              <View className="flex flex-row justify-between mb-3">
                <Text className="text-sm text-white/60 font-JakartaMedium">Car Seats</Text>
                <Text className="text-sm text-white/80 font-JakartaMedium">{driver.car_seats}</Text>
              </View>

              <View className="flex flex-row justify-between">
                <Text className="text-sm text-white/60 font-JakartaMedium">Payment Status</Text>
                <Text
                  className={`text-sm font-JakartaMedium capitalize ${payment_status === 'Paid' ? 'text-green-400' : 'text-red-400'}`}
                >
                  {payment_status}
                </Text>
              </View>
            </View>

          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default RideCard