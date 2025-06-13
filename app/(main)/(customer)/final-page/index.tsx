import { View, Text, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import RideLayout from '@/components/RideLayout';
import { useCustomer, useDriverStore, useRideOfferStore, useWSStore } from '@/store';
import PaymentPage from "@/components/Payment";
import { useUser } from '@clerk/clerk-expo';
import Start from '@/components/Start';
import Middle from '@/components/Middle';
import End from '@/components/End';
import FinalDetails from '@/components/FinalDetails';
import CustomButton from '@/components/CustomButton';
import LoadingRider from '@/components/LoadingRider';
import * as Linking from "expo-linking";
import ErrorFindDriver from '@/components/ErrorFindDriver';
import { useRouter } from 'expo-router';
import OnWay from '@/components/OnWay';
import ReactNativeModal from 'react-native-modal';
import Constants from 'expo-constants';

const publishableKey = Constants.expoConfig?.extra?.stripeApiKey;
const API_URL = Constants.expoConfig?.extra?.serverUrl;

// Only import StripeProvider in non-web environments to avoid bundling issues
let StripeProvider: any = ({ children }: any) => <>{children}</>;

if (Platform.OS !== 'web') {
    try {
        StripeProvider = require('@stripe/stripe-react-native').StripeProvider;
    } catch (e) {
        console.warn('Stripe native module not available. Falling back.');
        StripeProvider = ({ children }: any) => <>{children}</>;
    }
}


const FinalPage = () => {
    if (Platform.OS === 'web') {
        return (
            <View>
                <Text>Not available on web platform</Text>
            </View>
        );
    }

    const { user } = useUser();
    const { userAddress, destinationAddress } = useCustomer();
    const [page, setPage] = useState<string>('Loading');
    const [paid, setPaid] = useState(false);
    const { nearbyDrivers, selectedDriverId, selectedDriverDetails } = useDriverStore();
    const { ws, setWebSocket } = useWSStore();
    const router = useRouter();
    const [otp, setOtp] = useState('0000');
    const [driverReached, setDriverReached] = useState(false);
    const { removeRideOffer, setActiveRideId, giveRideDetails, rideOffer, activeRideId, changeStatus } = useRideOfferStore(state => state);
    const [showModal, setShowModal] = useState<boolean>(false);

    const {
        setDrivers,
        drivers,
        setNearbyDrivers,
        updateDriverLocation,
        removeDriverLocation,
        removeNearbyDriver,
        updateSelectedDriverLocation,
        clearSelectedDriver
    } = useDriverStore();

    const { clearDestinationLocation } = useCustomer();

    const generateOtp = () => {
        const randomOtp = Math.floor(1000 + Math.random() * 9000);
        return randomOtp.toString();
    };

    useEffect(() => {
        let socket: WebSocket;

        if (!ws) {
            const newWs = new WebSocket('wss://websocket-server-for-glidex.onrender.com');

            newWs.onopen = () => console.log('WebSocket connected');
            newWs.onerror = (err) => console.log('WebSocket error:', err);
            setWebSocket(newWs);
            socket = newWs;
        } else {
            socket = ws;
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("📝 Received WS message:", message);

            if (message.type === 'riderLocationUpdated' || message.type === 'riderLocationUpdate') {
                updateSelectedDriverLocation(message.latitude, message.longitude, message.address);
            }

            if (message.type === 'rideOfferRejected') {
                removeRideOffer(message.id);
                setPage('Error');
            }

            if (message.type === 'rideofferAccepted') {
                setPage('OnWay');
                setActiveRideId(message.id);
            }

            if (message.type === 'driverReached') {
                setPage('Start');
                const newOtp = generateOtp();
                setOtp(newOtp);
                const details = giveRideDetails(message.id);

                if (socket && socket.readyState === WebSocket.OPEN && details) {
                    socket.send(JSON.stringify({
                        type: 'providingOTP',
                        role: 'customer',
                        id: details.id,
                        otp: newOtp,
                        customer_id: user?.id,
                        driver_id: details.rider_id
                    }));
                }
            }

            if (message.type === 'rideBegins') {
                setPage('Middle');
                changeStatus(message.id, 'Start');
                // removeRideOffer(message.id);
            }

            if (message.type === 'rideEnded') {
                setPage('End');
                setTimeout(() => setShowModal(true), 5000);
            }
        };
    }, [ws]);
    console.log(page)
    console.log(page)

    useEffect(() => {
        const saveRideToDB = async () => {
            if (activeRideId && page === 'End') {
                const rideDetails = giveRideDetails(activeRideId);
                try {
                    const url = `${API_URL}/ride/create`;
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            origin_address: rideDetails?.pickupDetails.pickupAddress,
                            destination_address: rideDetails?.dropoffDetails.dropoffAddress,
                            origin_latitude: rideDetails?.pickupDetails.pickupLatitude,
                            origin_longitude: rideDetails?.pickupDetails.pickupLongitude,
                            destination_latitude: rideDetails?.dropoffDetails.dropoffLatitude,
                            destination_longitude: rideDetails?.dropoffDetails.dropoffLongitude,
                            fare_price: selectedDriverDetails?.price,
                            payment_status: 'Paid',
                            driver_id: rideDetails?.rider_id,
                            user_id: rideDetails?.customer_id
                        })
                    });

                    const { data } = await response.json();
                } catch (error) {
                    console.log('Error fetching rides:', error);
                }
            }
        };

        saveRideToDB();
    }, [page]);

    const handleCancelRide = () => { };

    const handleGoBack = () => {
        clearDestinationLocation();
        clearSelectedDriver();
        router.replace('/(main)/(customer)/(tabs)/home');
    };

    return (
        <StripeProvider
            publishableKey={publishableKey}
            merchantIdentifier="merchant.uber.com"
            urlScheme="myapp"
        >
            <RideLayout title='final page'>
                {page === 'OnWay' && <OnWay number={selectedDriverDetails?.number!} />}
                {page === 'Start' && <Start number={selectedDriverDetails?.number!} otp={otp} />}
                {page === 'Middle' && <Middle number={selectedDriverDetails?.number!} />}
                {page === 'End' && <End number={selectedDriverDetails?.number!} />}
                {page === 'Error' && <ErrorFindDriver />}
                {page === 'Loading' && <LoadingRider />}

                <View className='h-[1px] bg-gray-300 my-4' />

                <FinalDetails paid={paid} setPaid={setPaid} page={page} />

                <ReactNativeModal isVisible={showModal}>
                    <View className='bg-white p-5 rounded-md'>
                        <Text className='text-2xl font-bold text-center mb-2'>🎉 Ride Completed!</Text>
                        

                        {!paid ? (
                            <>
                                <Text className='text-lg text-center'>Please complete your payment</Text>
                                <PaymentPage
                                    fullName={user?.fullName!}
                                    email={user?.emailAddresses[0].emailAddress!}
                                    amount={selectedDriverDetails?.price!}
                                    driverId={selectedDriverDetails?.id!}
                                    rideTime={selectedDriverDetails?.distanceAway!}
                                    handlePaymentDone={() => setPaid(true)}
                                />
                                <Text className='text-center my-3 text-gray-500'>— OR —</Text>
                                <Text className='text-center text-lg'>Pay with cash to the driver</Text>
                            </>
                        ) : (
                            <Text className='text-green-600 font-semibold text-center text-lg mt-5'>✅ Payment completed</Text>
                        )}

                        <CustomButton
                            title='Return to Home'
                            onPress={handleGoBack}
                            className='mt-5'
                        />
                    </View>
                </ReactNativeModal>

            </RideLayout>
        </StripeProvider>
    );
};

export default FinalPage;
