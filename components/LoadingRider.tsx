import { View, Text, Image, ActivityIndicator } from 'react-native'
import { icons } from '@/constants/data'

const LoadingRider = () => {
    return (
        <View className='flex-row'>
            <View className='h-20  w-20'>
                <Image
                    source={icons.cab}
                    className='w-full h-full'
                    resizeMode='contain'
                />
            </View>
            <View className='w-3/6 pl-5 m-auto'>
                <Text className='font-Jakarta text-lg'>Looking for your</Text>
                <Text className='font-Jakarta text-lg'>Cab Driver</Text>
            </View>
            <View className='m-auto flex-row gap-x-2'>
                <Text className='text-lg font-Jakarta'>
                    Loading
                </Text>
                <ActivityIndicator />
            </View>
        </View>
    )
}

export default LoadingRider