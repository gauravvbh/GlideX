import { View, Text, Image } from 'react-native'
import { icons } from '@/constants/data'

const Middle = () => {
    return (
        <View className='flex-row gap-x-5'>
            <View className='h-20  w-20'>
                <Image
                    source={icons.cab}
                    className='w-full h-full'
                    resizeMode='contain'
                />
            </View>
            <View className='flex-1 justify-center'>
                <Text className='font-Jakarta text-base text-gray-600'>Enjoy your ride</Text>
                <Text className='font-JakartaSemiBold text-xl text-black'>Happy Journey</Text>
            </View>
        </View>
    )
}

export default Middle