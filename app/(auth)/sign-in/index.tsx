import { View, Text, Image, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { icons, images } from '@/constants/data'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import OAuth from '@/components/OAuth'
import { useAuth, useSignIn, useUser } from '@clerk/clerk-expo'
import { useUserStore } from '@/store'
import Constants from 'expo-constants';


const API_URL = Constants.expoConfig?.extra?.serverUrl;

const SignIn = () => {
    const { signIn, setActive, isLoaded } = useSignIn();
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        email: '',
        password: '',
        phone: ''
    })

    const onSignInPress = async () => {
        if (!isLoaded) return
        setLoading(true)

        try {
            const signInAttempt = await signIn.create({
                identifier: form.email,
                password: form.password,
            })
            console.log(signInAttempt.id)
            if (signInAttempt.status === 'complete' && signInAttempt.createdSessionId) {
                await setActive({ session: signInAttempt.createdSessionId })

                const result = await fetch(`${API_URL}/(api)/sign-in`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: form.email,
                        phone: form.phone,
                    })
                });
                const { data } = await result.json()

                await fetch(`${API_URL}/(api)/clerk-role`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        clerk_id: data?.clerk_id,
                        role: data.role,
                        email: data.email
                    })
                });

                if (data.role === 'customer') {
                    router.replace('/(customer)/(tabs)/home' as never)
                }
                if (data.role === 'rider') {
                    router.replace('/(rider)/home' as never)
                }
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (err: any) {
            Alert.alert('Error', err.errors[0].longMessage)
            console.error(JSON.stringify(err, null, 2))
        }
        finally {
            setLoading(false)
        }
    }

    return (
        //ScrollView
        <ScrollView className='flex-1'>
            <View className='flex-1'>
                <View className='relative w-full h-[250px] bg-gray-100'>
                    <Image
                        source={images.signUpCar}
                        className='z-0 w-full h-[250px]'
                    />
                    <Text className='text-white text-2xl font-JakartaSemiBold absolute bottom-5 left-5'>
                        Welcome👋
                    </Text>
                </View>
            </View>
            <View className='p-5 '>
                <InputField
                    label="Email"
                    placeholder="Enter Your email"
                    icon={icons.email}
                    value={form.email}
                    onChangeText={(value) => {
                        setForm({
                            ...form,
                            email: value

                        })
                    }}
                />
                <InputField
                    label="Number"
                    placeholder="Enter Your phone number"
                    value={form.phone}
                    keyboardType="phone-pad"
                    onChangeText={(value) => {
                        setForm({
                            ...form,
                            phone: value

                        })
                    }}
                />
                <InputField
                    label="Password"
                    placeholder="Enter Your password"
                    icon={icons.lock}
                    value={form.password}
                    secureTextEntry={true}
                    onChangeText={(value) => {
                        setForm({
                            ...form,
                            password: value

                        })
                    }}
                />
                <CustomButton
                    title='Sign In'
                    disabled={loading}
                    onPress={onSignInPress}
                    className='mt-6 w-full'
                />

                <OAuth />

                <Link href={"/(auth)/role"} className='text-lg text-center text-general-200 mt-10'>
                    <Text className='text-white'>Don't have an account? </Text>
                    <Text className='text-primary-500'>Sign Up</Text>
                </Link>
            </View>

        </ScrollView>
    )
}

export default SignIn