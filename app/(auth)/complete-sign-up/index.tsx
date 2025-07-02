import { useAuth, useUser } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
    Image,
    Platform
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { images } from '@/constants/data';
import CustomButton from '@/components/CustomButton';

let LottieView: any = () => null;

if (Platform.OS !== 'web') {
    try {
        LottieView = require('lottie-react-native').default;
    } catch (err) {
        console.warn('LottieView native import failed:', err);
        LottieView = () => null;
    }
}

const API_URL = Constants.expoConfig?.extra?.serverUrl;


type Role = 'Customer' | 'Rider';

const RegisterScreen: React.FC = () => {
    const [number, setNumber] = useState<string>('');
    const [role, setRole] = useState<Role | ''>('');
    const [error, setError] = useState<string>('');
    const [otpModalVisible, setOtpModalVisible] = useState<boolean>(false);
    const [otpValue, setOtpValue] = useState<string>('');
    const [constOtpValue, setConstOtpValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)

    const { user } = useUser();
    const { isLoaded, isSignedIn } = useAuth();


    const generateOtp = () => {
        const randomOtp = Math.floor(1000 + Math.random() * 9000);
        return randomOtp.toString();
    };

    const handleContinue = async () => {
        setLoading(true)
        setError('');

        if (!number || !role) {
            setError('Please fill in both number and role.');
            setLoading(false)
            return;
        }

        try {
            const url = `${API_URL}/api/unique-number?number=${number}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            if (!data.unique) {
                setError('Phone number already registered.');
            } else {
                setOtpModalVisible(true);


                const generatedOTP = generateOtp();
                setConstOtpValue(generatedOTP)
                console.log(generateOtp)
                //send otp to user

                fetch("https://utils-server-for-glidex.onrender.com/api/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: user?.primaryEmailAddress?.emailAddress,
                        subject: 'Verification for GlideX Account',
                        html: `OTP:- ${generatedOTP} will be used to verify the GlideX account.`,
                    })
                }).catch(err => console.log("❌ Email send error", err));
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false)
        }
    };

    const handleOTPSubmit = async () => {
        setError('')

        if (otpValue !== constOtpValue) {
            setError('Otp Entered Wrong')
            return;
        }

        setLoading(true)
        //clerk-role

        try {
            const safeRole = role === 'Customer' ? 'customer' : 'rider';
            const fullName = `${user?.firstName} ${user?.lastName}`

            const result = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: fullName,
                    email: user?.primaryEmailAddress?.emailAddress,
                    phone: number,
                    clerk_id: user?.id,
                    role: safeRole
                })
            });

            setOtpModalVisible(false);
            setShowSuccessModal(true)
        } catch (error: any) {
            console.log(error);
            setError(error.message ?? "/api/register failed")
        } finally {
            setLoading(false)
        }
    };

    const handleResendPhoneOTP = async () => {
        const generatedOTP = generateOtp();
        setConstOtpValue(generatedOTP)
        console.log(generateOtp)
        //send otp to user

        fetch("https://utils-server-for-glidex.onrender.com/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: user?.primaryEmailAddress?.emailAddress,
                subject: 'Verification for GlideX Account',
                html: `OTP:- ${generatedOTP} will be used to verify the GlideX account.`,
            })
        }).catch(err => console.log("❌ Email send error", err));
    }

    const handleBrowseHome = () => {
        if (role === 'Customer') {
            router.replace('/(main)/(customer)/(tabs)/home')
        }
        if (role === 'Rider') {
            router.replace('/(main)/(rider)/home')
        }
    }

    if (!user || !isLoaded) {
        return (
            <SafeAreaView className="flex-1 bg-neutral-900 justify-center items-center px-6">
                <LottieView
                    source={require('@/assets/animations/loading.json')}
                    autoPlay
                    loop
                    style={{ width: 300, height: 300 }}
                />
            </SafeAreaView>
        );
    }


    if (user && Object.keys(user.publicMetadata).length !== 0) {
        return <Redirect href={`/(main)/${user?.publicMetadata.role === 'customer' ? '(customer)' : '(rider)'}/(tabs)/home`} />
    }


    return (
        <SafeAreaView className="flex-1 px-6 pt-10 bg-neutral-900">
            <View className=" mb-10">
                <Text className="text-3xl font-JakartaBold text-white text-center">
                    Complete Your Registration
                </Text>
                <Text className="text-base text-gray-400 text-center mt-2">
                    Enter your phone number and select your role to continue.
                </Text>
            </View>

            {/* Phone Input */}
            <View className="mb-8">
                <Text className="text-white text-base mb-3">Phone Number</Text>
                <View className="flex-row items-center bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 gap-x-3">
                    <Feather name="phone" size={15} color="white" />
                    <TextInput
                        keyboardType="phone-pad"
                        placeholder="Enter your phone number"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 text-white text-base"
                        value={number}
                        onChangeText={setNumber}
                    />
                </View>
                {error ? <Text className="text-red-400 mt-2">{error}</Text> : null}
            </View>

            {/* Role Picker */}
            <View className="mb-10">
                <Text className="text-white text-base mb-3">Select Your Role</Text>
                <View className="flex-row gap-4">
                    {(['Customer', 'Rider'] as Role[]).map((item) => {
                        const isSelected = role === item;
                        return (
                            <TouchableOpacity
                                key={item}
                                onPress={() => setRole(item)}
                                className={`flex-1 px-4 py-4 rounded-xl border items-center ${isSelected
                                    ? 'bg-white border-white'
                                    : 'bg-neutral-800 border-neutral-700'
                                    }`}
                            >
                                <Text
                                    className={`font-JakartaMedium text-base ${isSelected ? 'text-black' : 'text-white/90'
                                        }`}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                onPress={handleContinue}
                className={`bg-white py-4 rounded-xl shadow-md shadow-white/10 ${loading && 'opacity-60'}`}
                disabled={loading}
            >
                <Text className="text-black font-JakartaSemiBold text-center text-lg">
                    Continue
                </Text>
            </TouchableOpacity>

            {/* OTP Modal */}
            <Modal visible={otpModalVisible} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/70 px-6">
                    <View className="bg-white w-full rounded-2xl p-6">
                        <Text className="text-black text-xl font-JakartaBold text-center mb-5">
                            Enter OTP
                        </Text>

                        <Text className='text-red-500 font-Jakarta mb-5 text-center'>
                            [DEVELOPMENT] We've sent the verification code for {number} to {user?.primaryEmailAddress?.emailAddress}
                        </Text>


                        <OtpInput
                            numberOfDigits={4}
                            autoFocus
                            focusColor="black"
                            placeholder="*"
                            type="numeric"
                            onTextChange={setOtpValue}
                            theme={{
                                containerStyle: {
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    flexDirection: 'row',
                                    marginBottom: 14,
                                },
                                pinCodeContainerStyle: {
                                    borderWidth: 1,
                                    borderColor: '#D1D5DB',
                                    borderRadius: 8,
                                    paddingVertical: 12,
                                    width: 60,
                                    height: 60,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                },
                                pinCodeTextStyle: {
                                    fontSize: 18,
                                    textAlign: 'center',
                                },
                                focusedPinCodeContainerStyle: {
                                    borderColor: 'black',
                                },
                                filledPinCodeContainerStyle: {
                                    borderColor: '#4B5563',
                                },
                                placeholderTextStyle: {
                                    color: '#9CA3AF',
                                },
                            }}
                        />

                        {error && (
                            <Text className="text-red-500 mt-1 text-center">{error}</Text>
                        )}

                        <TouchableOpacity
                            className='py-2'
                            onPress={handleResendPhoneOTP}
                        >
                            <Text className='text-blue-400 mb-3'>Resend OTP</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleOTPSubmit}
                            className="mt-3 bg-black py-3 rounded-xl"
                        >
                            <Text className={`text-white text-center font-JakartaBold ${loading && 'opacity-60'}`} >
                                Verify
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* success modal */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/70 px-6">
                    <View className='bg-black border border-neutral-700 px-7 py-9 rounded-2xl w-full min-h-[300px]'>
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
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default RegisterScreen;
