import { View, Text, Image } from 'react-native'
import { icons } from '@/constants/data'

const OnWay = ({ number }: { number: string }) => {
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
                <Text className='font-Jakarta text-lg'>Driver On its Way!!</Text>
                <Text className='font-JakartaSemiBold text-2xl'>The Driver will arrived to you soon!!</Text>
            </View>
            <View className='m-auto'>
                <Text className='text-lg font-Jakarta'>+91 {number}</Text>
            </View>
        </View>
    )
}

export default OnWay