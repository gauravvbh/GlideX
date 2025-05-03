import { View, Text, Image, TouchableOpacity, ImageBackground, TouchableOpacityProps } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { useUserStore } from '@/store';
import { images } from '@/constants/data';

const RolePage = () => {
    const { setRole } = useUserStore()


    const handleCustomerPress = () => {
        setRole({ role: 'customer' })
        router.push({ pathname: '(auth)/sign-up' as any, params: { role: 'customer' } });
    };

    const handleDriverPress = () => {
        setRole({ role: 'rider' })
        router.push({ pathname: '(auth)/sign-up' as any, params: { role: 'rider' } });
    };

    const RoleCard = ({ onPress, image, title, description }: { onPress: () => void, image: any, title: string, description: string }) => (
        <TouchableOpacity onPress={onPress} className="w-10/12 self-center mt-8  mb-10">
            <View className="rounded-2xl overflow-hidden h-60 shadow-lg">
                <ImageBackground
                    source={image}
                    resizeMode="cover"
                    className="w-full h-full justify-end"
                >
                    <View className="bg-white bg-opacity-80 p-4">
                        <Text className="text-black text-xl font-semibold">{title}</Text>
                        <Text className="text-gray-600 text-sm mt-1">{description}</Text>
                    </View>
                </ImageBackground>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-black">
            <Image
                source={images.icon}
                className="h-40 mt-12 mb-10 w-full"
                resizeMode="contain"
            />

            <Text className="text-white font-semibold text-2xl text-center mb-5">
                Choose your user type
            </Text>

            <RoleCard
                onPress={handleCustomerPress}
                image={images.customer}
                title="Customer"
                description="Are you a customer? Order rides and deliveries easily."
            />

            <RoleCard
                onPress={handleDriverPress}
                image={images.rider}
                title="Rider"
                description="Are you a Rider? Join us to drive and deliver."
            />
        </View>
    );
};

export default RolePage;
