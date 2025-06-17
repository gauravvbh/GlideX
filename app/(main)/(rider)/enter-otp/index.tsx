import { View, Text, TextInput, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomButton from '@/components/CustomButton';
import { useRideOfferStore, useWSStore } from '@/store';
import { router } from 'expo-router';
import { OtpInput } from "react-native-otp-entry";
import Constants from 'expo-constants';

const WEBSOCKET_API_URL = Constants.expoConfig?.extra?.webSocketServerUrl;


const EnterOtp = () => {
    const [riderOTP, setRiderOTP] = useState('');
    const [customerOTP, setCustomerOTP] = useState('');
    const { ws, setWebSocket } = useWSStore();
    const { activeRideId, giveRideDetails, changeStatus, removeRideOffer } = useRideOfferStore();
    const [error, setError] = useState('')


    console.log(customerOTP)
    console.log(customerOTP)


    useEffect(() => {
        let socket: WebSocket;

        // Either create a new one or use existing one
        if (!ws) {
            const newWs = new WebSocket(WEBSOCKET_API_URL);

            newWs.onopen = () => {
                console.log('WebSocket connected');
            };

            newWs.onerror = (err) => {
                console.log('WebSocket error:', err);
            };

            setWebSocket(newWs);
            socket = newWs;
        } else {
            socket = ws;
        }

        // Attach onmessage regardless
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('message received')
            console.log(message.otp)
            console.log(message.otp)
            if (message.type === 'OTP') {
                if (activeRideId === message.id) {
                    setCustomerOTP(message.otp)
                }
            }
        };
    }, [ws]);


    console.log("WebSocket instance in EnterOtp", ws);


    const handleVerify = () => {
        if (customerOTP && riderOTP && (customerOTP === riderOTP) && activeRideId) {
            const rideDetails = giveRideDetails(activeRideId)
            console.log('ride details from enter otp page')
            console.log(activeRideId)
            console.log(rideDetails)
            if (rideDetails) {

                changeStatus(rideDetails?.id, 'Start')
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'journeyBegins',
                        role: 'rider',
                        id: rideDetails?.id,
                        customer_id: rideDetails?.customer_id,
                    }))
                }
            } else {
                console.log('ride details not found on page enter OTP')
            }
            router.replace('/(main)/(rider)/finish-ride');
        } else {
            setError("Please enter a valid OTP.");
        }
    };

    return (
        <View className="flex-1 justify-center items-center px-6 bg-white">
            <Text className="text-2xl font-bold text-black mb-4">
                Enter OTP
            </Text>
            <Text className="text-gray-600 text-center mb-8">
                Please enter the OTP provided by the customer to start the ride.
            </Text>

            {/* <TextInput
                value={riderOTP}
                onChangeText={setRiderOTP}
                keyboardType="number-pad"
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg text-center py-3 text-lg tracking-widest mb-6"
                placeholder="Enter OTP"
            /> */}
            <OtpInput
                numberOfDigits={4}
                onTextChange={setRiderOTP}
                focusColor="black"
                placeholder="*"
                type="numeric"
                theme={{
                    containerStyle: {
                        width: '100%',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        marginBottom: 24,
                    },
                    pinCodeContainerStyle: {
                        borderWidth: 1,
                        borderColor: '#D1D5DB', // Tailwind: border-gray-300
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
                        letterSpacing: 6,
                    },
                    focusStickStyle: {
                        backgroundColor: 'black',
                        width: 2,
                        height: 24,
                    },
                    focusedPinCodeContainerStyle: {
                        borderColor: 'black',
                    },
                    filledPinCodeContainerStyle: {
                        borderColor: '#4B5563', // Tailwind: border-gray-600
                    },
                    disabledPinCodeContainerStyle: {
                        backgroundColor: '#E5E7EB', // Tailwind: bg-gray-200
                    },
                    placeholderTextStyle: {
                        color: '#9CA3AF', // Tailwind: text-gray-400
                    },
                }}
            />



            {
                error && (
                    <View className='items-center justify-center'>
                        <Text className='font-Jakarta text-lg text-red-600'>{error}</Text>
                    </View>
                )
            }

            <CustomButton
                title="Verify OTP"
                onPress={handleVerify}
                bgVariant="primary"
                textVariant="primary"
                className="w-full"
            />
        </View>
    );
};

export default EnterOtp;
