import { View, Text, TextInput, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomButton from '@/components/CustomButton';
import { useRideOfferStore, useWSStore } from '@/store';
import { router } from 'expo-router';

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
            const newWs = new WebSocket('wss://websocket-server-for-glidex.onrender.com');

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

            <TextInput
                value={riderOTP}
                onChangeText={setRiderOTP}
                keyboardType="number-pad"
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg text-center py-3 text-lg tracking-widest mb-6"
                placeholder="Enter OTP"
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
