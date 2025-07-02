import { useAuth, useUser } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.serverUrl;


type Role = 'Customer' | 'Rider';

const RegisterScreen: React.FC = () => {
    const [number, setNumber] = useState<string>('');
    const [role, setRole] = useState<Role | ''>('');
    const [error, setError] = useState<string>('');
    const [otpModalVisible, setOtpModalVisible] = useState<boolean>(false);
    const [otpValue, setOtpValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false)

    const { user } = useUser();
    const { isLoaded, isSignedIn } = useAuth();


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

                //send otp to user
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false)
        }
    };

    const handleOTPSubmit = () => {
        Alert.alert('OTP Submitted', `Code entered: ${otpValue}`);
        setOtpModalVisible(false);


        //clerk-role

        //const safeRole=role==='Customer'?'customer:'rider
        // await fetch('https://your-api.com/check-phone', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ number, role:safeRole }),
        // });
    };

    if (user && Object.keys(user.publicMetadata).length !== 0) {
        return <Redirect href={`/(main)/${user?.publicMetadata.role === 'customer' ? '(customer)' : '(rider)'}/(tabs)/home`} />
    }

    if (!isLoaded) {
        return <ActivityIndicator size='large' color='black' />; // or loading page
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

                        <OtpInput
                            numberOfDigits={6}
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
                                    marginBottom: 24,
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

                        <TouchableOpacity
                            onPress={handleOTPSubmit}
                            className="mt-3 bg-black py-3 rounded-xl"
                        >
                            <Text className="text-white text-center font-JakartaBold">
                                Verify
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default RegisterScreen;
