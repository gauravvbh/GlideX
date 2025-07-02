import { View, Text, Image } from 'react-native'
import { icons } from '@/constants/data'

const OnWay = () => {
    return (
        <View className='flex-row gap-x-5 mr-10'>
            <View className='h-20 w-20'>
                <Image
                    source={icons.cab}
                    className='w-full h-full'
                    resizeMode='contain'
                />
            </View>
            <View className='flex-1 justify-center'>
                <Text className='font-Jakarta text-lg'>
                    Driver On its Way!!
                </Text>
                <Text className='font-JakartaSemiBold text-2xl'>
                    The Driver will arrive to you soon!!
                </Text>
            </View>
        </View>
    )
}

export default OnWay