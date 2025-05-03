import { Text, Pressable, View, Image } from 'react-native'
import React, { useRef, useState } from 'react'
import { useRouter } from 'expo-router';
import Swiper from 'react-native-swiper'
import { onboarding } from '@/constants/data';
import CustomButton from '@/components/CustomButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomePage = () => {
    const router = useRouter();
    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const isLastSlide = activeIndex === onboarding.length - 1;

    return (
        <SafeAreaView className='flex h-full items-center justify-between bg-black'>
            <Pressable
                onPress={() => router.replace('/(auth)/role' as never)}
                className='w-full flex justify-end items-end p-5'
            >
                <Text className='text-white text-md font-JakartaBold'>Skip</Text>
            </Pressable>
            <Swiper
                ref={swiperRef}
                loop={false}
                dot={<View className='w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full' />}
                activeDot={<View className='w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full' />}
                onIndexChanged={(index) => setActiveIndex(index)}
                index={activeIndex}
            >
                {
                    onboarding.map(item => (
                        <View key={item.id} className='flex items-center justify-center'>
                            <Image
                                source={item.image}
                                className='w-full h-[300px]'
                                resizeMode='contain'
                            />
                            <Text className='text-white text-3xl font-medium mx-9 mt-16'>{item.title}</Text>
                            <Text className='text-lg font-JakartaSemiBold text-center text-[#858585] mx-10 mt-5'>{item.description}</Text>
                        </View>
                    ))
                }
            </Swiper>
            <CustomButton
                title={isLastSlide ? "Get Started" : "Next"}
                className="w-11/12 mt-10 mb-5 text-white "
                onPress={() =>
                    isLastSlide ?
                        router.replace('/(auth)/role' as never) :
                        swiperRef.current?.scrollBy(1) //setActiveIndex(prev => prev + 1)
                }
            />
        </SafeAreaView >
    )
}

export default WelcomePage