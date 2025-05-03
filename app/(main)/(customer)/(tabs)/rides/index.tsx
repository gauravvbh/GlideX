import { View, Text, FlatList, Image } from 'react-native'
import React from 'react'
import RideCard from '@/components/RideCard'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRidesStore } from '@/store'
import { images } from '@/constants/data'

const Rides = () => {

  const { Rides } = useRidesStore();

  return (
    <SafeAreaView className='bg-gray-500 text-white flex-1'>
      <FlatList
        data={Rides}
        renderItem={({ item }) => <RideCard ride={item} />}
        className='px-5'
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View className='flex flex-col items-center justify-center'>
            <>
              <Image source={images.noResult} className='w-40 h-40' alt='No recent rides found ' resizeMode='contain' />
              <Text className='text-sm'>No recent rides found</Text>
            </>
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <Text className='font-JakartaSemiBold text-3xl mt-5'>History of Rides</Text>
            <Text className='font-JakartaLight text-xl mb-10 mt-1 text-gray-700'>Click to see the details</Text>
          </>
        )}
      />
    </SafeAreaView>
  )
}

export default Rides