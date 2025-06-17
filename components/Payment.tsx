import { View, Alert, Image, Text, Platform } from 'react-native';
import { useState, useEffect } from 'react';  // Make sure useEffect is imported from React
import CustomButton from './CustomButton';
import { PaymentProps } from '@/types/type';
import { useAuth } from '@clerk/clerk-expo';
import ReactNativeModal from 'react-native-modal';
import { images } from '@/constants/data';
import { useRouter } from 'expo-router';
import { useCustomer, useDriverStore } from '@/store';
import * as Linking from "expo-linking";
import Constants from 'expo-constants';

let useStripe: any;
if (Platform.OS !== 'web') {
    useStripe = require('@stripe/stripe-react-native').useStripe;
}

const API_URL = Constants.expoConfig?.extra?.serverUrl;


export default function Payment({ fullName, email, amount, driverId, rideTime, handlePaymentDone }: PaymentProps) {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [paymentIntentId, setPaymentIntentId] = useState('');
    const { userId } = useAuth();
    const router = useRouter();


    const {
        userAddress,
        destinationAddress,
        userLongitude,
        userLatitude,
        destinationLongitude,
        destinationLatitude,
        clearDestinationLocation,
    } = useCustomer();

    const {
        clearSelectedDriver
    } = useDriverStore();

    const fetchPaymentSheetParams = async () => {
        try {
            const response = await fetch('https://stripe-server-for-glidex.onrender.com/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: fullName,
                    email: email,
                    amount: Number(amount) || 40,
                }),
            });


            if (!response.ok) {
                console.log('⚠️')
                throw new Error('Failed to create payment');
            }
            
            const data = await response.json();

            console.log(data)
            const { paymentIntent, ephemeralKey, customer, paymentIntentId } = data;
            return { paymentIntent, ephemeralKey, customer, paymentIntentId };
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Unable to fetch payment parameters.');
            return {};
        }
    };


    const initializePaymentSheet = async () => {
        const { paymentIntent, ephemeralKey, customer, paymentIntentId } = await fetchPaymentSheetParams();
        if (!paymentIntent || !ephemeralKey || !customer || !paymentIntentId) return;

        setPaymentIntentId(paymentIntentId);

        const { error } = await initPaymentSheet({
            merchantDisplayName: 'GlideX.',
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,
            allowsDelayedPaymentMethods: true,
            defaultBillingDetails: {
                name: 'Gaurav',
                email: email,
                address: {
                    country: 'US',  // <- Add this
                },
            },
            returnURL: Linking.createURL("stripe-redirect")
        });

        if (error) {
            Alert.alert('Init error', error.message);
        } else {
            setLoading(true);
        }
    };

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert(`Error: ${error.code}`, error.message);
        } else {
            setSuccess(true);
            handlePaymentDone();
        }

        try {
            // Handle successful payment logic (you can add additional API call here)
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    useEffect(() => {
        initializePaymentSheet();
    }, []);

    return (
        <View style={{ justifyContent: 'center', padding: 5 }}>
            <CustomButton
                title="Pay Now"
                onPress={openPaymentSheet}
                disabled={!loading}
                className="mt-10 w-full"
                textVariant='primary'
                bgVariant='secondary'
            />
            <ReactNativeModal
                isVisible={success}
                onBackdropPress={() => setSuccess(false)}
            >
                <View className='flex flex-col items-center justify-center bg-white p-7 rounded-2xl'>
                    <Image
                        source={images.check}
                        className='w-28 h-28 mt-5'
                    />
                    <Text className='text-2xl text-center font-JakartaBold mt-5'>
                        Payment Done!
                    </Text>
                    <Text className='text-md text-general-200 font-JakartaMedium text-center mt-3'>
                        Payment has been done now enjoy your ridings!!
                    </Text>
                    <CustomButton
                        title='Back Home'
                        onPress={() => {
                            setSuccess(false);
                            clearDestinationLocation();
                            clearSelectedDriver()
                            router.push('/(main)/(customer)/(tabs)/home' as never);
                        }}
                        className='mt-5 w-full'
                    />
                </View>
            </ReactNativeModal>
        </View>
    );
}
