import { View, Text, Image } from 'react-native'
import { icons } from '@/constants/data'

const End = ({ number }: { number: string }) => {
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
                <Text className='font-Jakarta text-lg'>Congratss!!</Text>
                <Text className='font-JakartaSemiBold text-2xl'>🎊</Text>
            </View>
            <View className='m-auto'>
                <Text className='text-lg font-Jakarta'>+91 {number}</Text>
            </View>
        </View>
    )
}

export default End