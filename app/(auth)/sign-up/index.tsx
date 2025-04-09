import { View, Text, Image, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { icons, images } from '@/constants/data'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import OAuth from '@/components/OAuth'
import { useSignUp } from '@clerk/clerk-expo'
import { ReactNativeModal } from "react-native-modal";
import api from '@/lib/api'


const SignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp()

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    })

    const [verification, setVerification] = useState({
        state: 'default',
        error: '',
        code: ''
    })

    const onSignUpPress = async () => {
        console.log(isLoaded)
        if (!isLoaded) return

        try {
            await signUp.create({
                firstName: form.firstName,
                lastName: form.lastName,
                emailAddress: form.email,
                password: form.password,
            })

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            setVerification((prev) => ({
                ...prev,
                state: 'pending'
            }))
        } catch (err: any) {
            Alert.alert('Error', err.errors[0].longMessage)
            console.error(JSON.stringify(err, null, 2))
        }
    }

    const onVerifyPress = async () => {
        if (!isLoaded) {
            console.log('Clerk not loaded yet')
            return
        }
        try {
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code: verification.code,
            })


            if (signUpAttempt.status === 'complete') {
                const fullName = `${form.firstName} ${form.lastName}`
                try {
                    const result = await api.post(`/(api)/user`, {
                        name: fullName,
                        email: form.email,
                        clerk_id: signUpAttempt.createdUserId
                    })
                } catch (error) {
                    console.log('errororororo', error)
                }
                await setActive({ session: signUpAttempt.createdSessionId })

                setVerification((prev) => ({
                    ...prev,
                    state: 'success'
                }))
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2))
                setVerification((prev) => ({
                    ...prev,
                    state: 'failed',
                    error: 'Verification failed'
                }))
            }
        } catch (err: any) {
            setVerification((prev) => ({
                ...prev,
                state: 'failed',
                error: err.errors[0].longMessage
            }))
            console.error(JSON.stringify(err, null, 2))
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
                        Create Your Account
                    </Text>
                </View>
            </View>
            <View className='p-5 '>
                <InputField
                    label="First Name"
                    placeholder="Enter your first name"
                    icon={icons.person}
                    value={form.firstName}
                    onChangeText={(value) => {
                        setForm({
                            ...form,
                            firstName: value
                        })
                    }}
                />
                <InputField
                    label="Last Name"
                    placeholder="Enter your last name"
                    icon={icons.person}
                    value={form.lastName}
                    onChangeText={(value) => {
                        setForm({
                            ...form,
                            lastName: value
                        })
                    }}
                />


                <InputField
                    label="Email"
                    placeholder="Enter your email"
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
                    label="Password"
                    placeholder="Enter your password"
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
                    title='Sign Up'
                    onPress={onSignUpPress}
                    className='mt-6'
                />

                <OAuth />

                <Link href={"/sign-in"} className='text-lg text-center text-general-200 mt-10'>
                    <Text className='text-white'>Already have an account? </Text>
                    <Text className='text-primary-500'>Log In</Text>
                </Link>
            </View>

            <ReactNativeModal isVisible={verification.state === 'pending'} onModalHide={() => {
                setVerification((prev) => ({
                    ...prev,
                    state: 'success'
                }))
            }}>
                <View className='bg-black px-7 py-9 border border-neutral-700 rounded-2xl min-h-[300px]'>
                    <Text className='text-white text-2xl font-JakartaExtraBold mb-2'>
                        Verification
                    </Text>
                    <Text className='text-gray-400 font-Jakarta mb-5'>
                        We've sent a verification code to {form.email}
                    </Text>
                    <InputField
                        label='Code'
                        icon={icons.lock}
                        placeholder='12345'
                        value={verification.code}
                        keyboardType='numeric'
                        onChangeText={(code) => {
                            setVerification((prev) => ({
                                ...prev,
                                code
                            }))
                        }}
                    />
                    {verification.error && (
                        <Text className='text-red-500 text-sm mt-1'>
                            {verification.error}
                        </Text>
                    )}
                    <CustomButton
                        title='Verify Email'
                        onPress={onVerifyPress}
                        className='mt-5 bg-success-500'
                    />
                </View>
            </ReactNativeModal>

            <ReactNativeModal isVisible={verification.state === 'success'}>
                <View className='bg-black border border-neutral-700 px-7 py-9 rounded-2xl min-h-[300px]'>
                    <Image
                        source={images.check}
                        className='w-[110px] h-[110px] mx-auto my-5'
                    />
                    <Text className='text-3xl font-JakartaBold text-center'>
                        Verified
                    </Text>
                    <Text className='text-base text-gray-400 font-Jakarta text-center mt-2'>
                        You have successfully verified your account.
                    </Text>
                    <CustomButton
                        title='Browse Home'
                        onPress={() => {
                            router.replace('/(main)/(tabs)/home' as never)
                        }}
                        className='mt-5'
                    />
                </View>
            </ReactNativeModal>

        </ScrollView>
    )
}

export default SignUp