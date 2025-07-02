import { View, Text, Image, ScrollView, Alert, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { icons, images } from '@/constants/data'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import OAuth from '@/components/OAuth'
import { useSignUp } from '@clerk/clerk-expo'
import ReactNativeModal from 'react-native-modal'
import { useUserStore } from '@/store'
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.serverUrl;
console.log(API_URL)

const SignUp = () => {
    const { role } = useUserStore();
    const { isLoaded, signUp, setActive } = useSignUp()

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
    })

    const [verification, setVerification] = useState({
        state: 'default',
        error: '',
        code: ''
    })

    const [phoneVerification, setPhoneVerification] = useState({
        state: 'default',
        error: '',
        constCode: '',
        code: ''
    })

    const [loading, setLoading] = useState<boolean>(false)

    const onPhoneVerifiedPress = async () => {
        if (!isLoaded) return

        if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.')
            return
        }
        setLoading(true)

        try {
            await signUp.create({
                firstName: form.firstName,
                lastName: form.lastName,
                emailAddress: form.email,
                password: form.password,
            })

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            //send a api call to check phone which user entered already present or not

            setVerification((prev) => ({
                ...prev,
                state: 'pending',
                error: ''
            }))
        } catch (err: any) {
            const errorMsg = err?.errors?.[0]?.longMessage || 'Something went wrong'
            Alert.alert('Error', errorMsg)
            console.error(JSON.stringify(err, null, 2))
        }
        finally {
            setLoading(false)
        }
    }

    const onVerifyPress = async () => {
        if (!isLoaded) return

        setLoading(true)
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({ code: verification.code })

            const isEmailVerified = signUpAttempt?.verifications?.emailAddress?.status === 'verified'
            console.log('isEmailVerified')
            console.log(isEmailVerified)
            if (isEmailVerified) {
                await setActive!({ session: signUpAttempt.createdSessionId })
                const fullName = `${form.firstName} ${form.lastName}`

                console.log('id')
                console.log(signUpAttempt.createdUserId)
                const result = await fetch(`${API_URL}/api/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: fullName,
                        email: form.email,
                        phone: form.phone,
                        clerk_id: signUpAttempt.createdUserId,
                        role: role
                    })
                });
                const data = await result.json();
                console.log('⚠️👌');
                console.log(data);

                setVerification((prev) => ({
                    ...prev,
                    state: 'success',
                    error: ''
                }))
            } else {
                setVerification((prev) => ({
                    ...prev,
                    state: 'failed',
                    error: 'Verification failed'
                }))
            }
        } catch (err: any) {
            console.log("❌ Verification error", err);
            const errorMsg = err?.errors?.[0]?.longMessage || 'Email verification failed'
            setVerification((prev) => ({
                ...prev,
                state: 'failed',
                error: errorMsg
            }))
        } finally {
            setLoading(false)
        }
    }
    const onSignUpPress = async () => {

        setVerification((prev) => ({
            ...prev,
            error: ''
        }))

        setPhoneVerification((prev) => ({
            ...prev,
            error: ''
        }))

        setLoading(true)

        try {
            const urlForEmail = `${API_URL}/api/unique-email?email=${form.email}`;

            const responsee = await fetch(urlForEmail, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const { isUnique } = await responsee.json();

            if (!isUnique) {
                setVerification((prev) => ({
                    ...prev,
                    error: 'Email Adress Must Be Unique'
                }))
                return;
            }

            setPhoneVerification((prev) => ({
                ...prev,
                error: ''
            }))

            //fetch api for unique number
            const url = `${API_URL}/api/unique-number?number=${form.phone}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const { unique } = await response.json();

            if (!unique) {
                setPhoneVerification((prev) => ({
                    ...prev,
                    error: 'Phone Number Must Be Unique'
                }))
                return;
            }

            setPhoneVerification((prev) => ({
                ...prev,
                error: ''
            }))



            setPhoneVerification((prev) => ({
                ...prev,
                state: 'pending'
            }))


            console.log(phoneVerification.constCode)

            fetch("https://utils-server-for-glidex.onrender.com/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: form.email,
                    subject: 'Verification for GlideX Account',
                    html: `OTP:- ${phoneVerification.constCode} will be used to verify the GlideX account.`,
                })
            }).catch(err => console.log("❌ Email send error", err));
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setPhoneVerification((prev) => (
            {
                ...prev,
                constCode: generateOtp()
            }
        ));
    }, [])


    const onPhoneVerifyPress = async () => {
        setLoading(true)
        try {
            if (phoneVerification.code === phoneVerification.constCode) {
                await onPhoneVerifiedPress()
            } else {
                setPhoneVerification((prev) => ({
                    ...prev,
                    error: 'Wrong OTP Entered!'
                }))
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleResendPhoneOTP = async () => {
        setPhoneVerification((prev) => (
            {
                ...prev,
                constCode: generateOtp()
            }
        ));
        console.log(phoneVerification.constCode)

        fetch("https://utils-server-for-glidex.onrender.com/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: form.email,
                subject: 'Verification for GlideX Account',
                html: `OTP:- ${phoneVerification.constCode} will be used to verify the GlideX account.`,
            })
        }).catch(err => console.log("❌ Email send error", err));
    }


    const generateOtp = () => {
        const randomOtp = Math.floor(1000 + Math.random() * 9000);
        return randomOtp.toString();
    };


    const handleBrowseHome = () => {
        if (role === 'customer') {
            router.replace('/(main)/(customer)/(tabs)/home')
        }
        if (role === 'rider') {
            router.replace('/(main)/(rider)/home')
        }
    }

    return (
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
                <InputField label="First Name" placeholder="Enter your first name" icon={icons.person}
                    value={form.firstName} onChangeText={(value) => setForm({ ...form, firstName: value })} />

                <InputField label="Last Name" placeholder="Enter your last name" icon={icons.person}
                    value={form.lastName} onChangeText={(value) => setForm({ ...form, lastName: value })} />

                <InputField label="Email" placeholder="Enter your email" icon={icons.email}
                    value={form.email} onChangeText={(value) => setForm({ ...form, email: value })} />

                {verification.error && <Text className="text-red-500 mt-1">{verification.error}</Text>}
                <InputField label="Phone Number" placeholder="Enter your phone number" keyboardType="phone-pad"
                    value={form.phone} onChangeText={(value) => setForm({ ...form, phone: value })} />

                {phoneVerification.error && <Text className="text-red-500 mt-1">{phoneVerification.error}</Text>}
                <InputField label="Password" placeholder="Enter your password" icon={icons.lock}
                    value={form.password} secureTextEntry onChangeText={(value) => setForm({ ...form, password: value })} />


                <CustomButton title='Sign Up' disabled={loading} onPress={onSignUpPress} className={`mt-6 w-full ${loading && 'opacity-60'}`} />

                {/* <OAuth role={safeRole} /> */}
                <OAuth />

                <Link
                    onPress={() => router.push('/(auth)/sign-in')}
                    href={"/(auth)/sign-in"}
                    className='text-lg text-center text-general-200 mt-10'
                >
                    <Text className='text-white'>Already have an account? </Text>
                    <Text className='text-primary-500'>Sign In</Text>
                </Link>
            </View>

            {/* Email Verification Modal */}
            <ReactNativeModal isVisible={verification.state === 'pending'}>
                <View className='bg-black px-7 py-9 border border-neutral-700 rounded-2xl min-h-[300px]'>
                    <Text className='text-white text-2xl font-JakartaExtraBold mb-2'>Verification</Text>
                    <Text className='text-gray-400 font-Jakarta mb-5'>
                        We've sent a verification code to {form.email}
                    </Text>
                    <InputField
                        label='Code'
                        icon={icons.lock}
                        placeholder='123456'
                        value={verification.code}
                        keyboardType='numeric'
                        onChangeText={(code) => setVerification((prev) => ({ ...prev, code }))}
                    />
                    {verification.error && <Text className='text-red-500 text-sm mt-1'>{verification.error}</Text>}
                    <CustomButton title='Verify Email' disabled={loading} onPress={onVerifyPress} className={`mt-5 w-full bg-success-500 ${loading && 'opacity-60'}`} />
                </View>
            </ReactNativeModal>

            {/* Phone Verification Modal */}
            <ReactNativeModal isVisible={phoneVerification.state === 'pending'}>
                <View className='bg-black px-7 py-9 border border-neutral-700 rounded-2xl min-h-[300px]'>
                    <Text className='text-white text-2xl font-JakartaExtraBold mb-2'>Verify Phone Number</Text>
                    <Text className='text-gray-400 font-Jakarta mb-3'>
                        We've sent a verification code to {form.phone}
                    </Text>
                    <Text className='text-red-500 font-Jakarta mb-5'>
                        [DEVELOPMENT] We've sent the verification code for {form.phone} to {form.email}
                    </Text>
                    <InputField
                        label='Code'
                        icon={icons.lock}
                        placeholder='1234'
                        keyboardType='numeric'
                        value={phoneVerification.code}
                        onChangeText={(code) => setPhoneVerification((prev) => ({ ...prev, code }))}
                    />
                    {phoneVerification.error && <Text className='text-red-500 text-sm mt-1'>{phoneVerification.error}</Text>}
                    <TouchableOpacity
                        className='py-2'
                        onPress={handleResendPhoneOTP}
                    >
                        <Text className='text-blue-400'>Resend OTP</Text>
                    </TouchableOpacity>
                    <CustomButton title='Verify Phone' disabled={loading} onPress={onPhoneVerifyPress} className={`w-full mt-5 bg-success-500 ${loading && 'opacity-60'}`} />
                </View>
            </ReactNativeModal>

            {/* Final Success Modal */}
            <ReactNativeModal isVisible={verification.state === 'success'}>
                <View className='bg-black border border-neutral-700 px-7 py-9 rounded-2xl min-h-[300px]'>
                    <Image source={images.check} className='w-[110px] h-[110px] mx-auto my-5' />
                    <Text className='text-3xl font-JakartaBold text-center'>Verified</Text>
                    <Text className='text-base text-gray-400 font-Jakarta text-center mt-2'>
                        You have successfully verified your account.
                    </Text>
                    <CustomButton
                        title='Browse Home'
                        onPress={handleBrowseHome}
                        disabled={loading}
                        className={`mt-5 ${loading && 'opacity-60'}`}
                    />
                </View>
            </ReactNativeModal>
        </ScrollView >
    )
}

export default SignUp
