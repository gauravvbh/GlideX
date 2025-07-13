import { View, Text, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
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
import SlideButton from '@/components/SlideButton';
import { getDangerEmailHtml } from '@/lib/dangerAlertTemplate';
import { getNearbyDrivers } from '@/lib/calcRegion';
import { Driver, RideOfferDetails } from '@/types/type';

type PlainDriver = Omit<Driver, 'setCarImageURL' | 'setCarSeats' | 'setUserLocation' | 'setId' | 'setProfileImageURL' | 'setRating' | 'setFullName' | 'setRole'>;

const publishableKey = Constants.expoConfig?.extra?.stripeApiKey;
const API_URL = Constants.expoConfig?.extra?.serverUrl;
const WEBSOCKET_API_URL = Constants.expoConfig?.extra?.webSocketServerUrl;

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
    const { userAddress, destinationAddress, userLongitude, userLatitude, destinationLatitude, destinationLongitude } = useCustomer.getState();
    const [page, setPage] = useState<string>('Loading');
    const [paid, setPaid] = useState(false);
    const { nearbyDrivers, selectedDriverId, selectedDriverDetails } = useDriverStore();
    const { ws, setWebSocket } = useWSStore();
    const router = useRouter();
    const [otp, setOtp] = useState('0000');
    const [driverReached, setDriverReached] = useState(false);
    const { removeRideOffer, setActiveRideId, giveRideDetails, rideOffer, activeRideId, changeStatus } = useRideOfferStore(state => state);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [verifyReached, setVerifyReached] = useState<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [countdown, setCountdown] = useState(10);
    const [alertSent, setAlertSent] = useState(false);
    const [rideDetails, setRideDetails] = useState<RideOfferDetails>()




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
            const newWs = new WebSocket(WEBSOCKET_API_URL);

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

            if (message.type === 'riderLocationUpdated') {
                console.log('📍 Rider location update:', message);
                updateDriverLocation(message.driverId, message.latitude, message.longitude, message.address)
                updateSelectedDriverLocation(message.latitude, message.longitude, message.address)



                const updatedDrivers = useDriverStore.getState().nearbyDrivers?.filter(
                    (driver) => driver.userLatitude && driver.userLongitude
                ) || [];

                updateMarkersOnMap(updatedDrivers);
            }

            if (message.type === 'riderLocationUpdate') {
                console.log('📍 Rider location update:', message);
                updateDriverLocation(message.driverId, message.latitude, message.longitude, message.address)
                updateSelectedDriverLocation(message.latitude, message.longitude, message.address)
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
                setVerifyReached(true)
            }

            if (message.type === 'driverOffline') {
                if (page === 'Loading') {
                    removeDriverLocation(message.driverId)
                    removeNearbyDriver(message.driverId)
                    clearSelectedDriver()

                    const updatedDrivers = useDriverStore.getState().nearbyDrivers
                    console.log('⭐⭐⭐⭐')
                    console.log(updatedDrivers)
                    updateMarkersOnMap(updatedDrivers);

                    setPage('Error')
                }
            }
        };
    }, [ws]);

    useEffect(() => {
        if (!activeRideId) return;

        const details = giveRideDetails(activeRideId);
        if (details) {
            setRideDetails(details);
        }
    }, [activeRideId]);



    const updateMarkersOnMap = async (driversToUse?: PlainDriver[]) => {
        if (userLatitude && userLongitude) {
            let driversWithDistanceAway: PlainDriver[] = [];
            const driversToPass = driversToUse ?? nearbyDrivers;

            if (destinationLatitude && destinationLongitude) {
                driversWithDistanceAway = await getNearbyDrivers(userLatitude, userLongitude, driversToPass, destinationLatitude, destinationLongitude);
            } else {
                driversWithDistanceAway = await getNearbyDrivers(userLatitude, userLongitude, driversToPass);
            }


            // console.log('drivers with distance away')
            // console.log(driversWithDistanceAway)
            setNearbyDrivers(driversWithDistanceAway)
        }
    }

    useEffect(() => {
        if (verifyReached) {
            setCountdown(10);

            timeoutRef.current = setTimeout(() => {
                console.log("🔔 Timer done. Sending email...");

                setAlertSent(true);

                fetch("https://utils-server-for-glidex.onrender.com/api/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: user?.emailAddresses[0].emailAddress,
                        subject: `Ride Alert – Destination Not Confirmed by ${user?.firstName}`,
                        html: getDangerEmailHtml(selectedDriverDetails!, user!),
                    }),
                }).catch(err => console.log("❌ Email send error", err));

                const rideDetails = giveRideDetails(activeRideId!);
                if (ws && ws.readyState === WebSocket.OPEN && rideDetails) {
                    ws.send(JSON.stringify({
                        type: 'noConfirmationAlert',
                        role: 'customer',
                        rider_id: rideDetails.rider_id,
                        id: rideDetails.id,
                    }));
                }


            }, 10000);

            const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                clearInterval(countdownInterval);
            };
        }
    }, [verifyReached]);




    useEffect(() => {
        const saveRideToDB = async () => {
            if (activeRideId && page === 'End') {
                const rideDetails = giveRideDetails(activeRideId);
                try {
                    const url = `${API_URL}/api/ride/create`;
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


    const handleSlideComplete = () => {

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            console.log("🛑 Timer cancelled by user sliding");
        }

        if (activeRideId) {
            const rideDetails = giveRideDetails(activeRideId)
            console.log('rideDetails')
            console.log(rideDetails)
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'reachedDestinationVerified',
                    role: 'customer',
                    rider_id: rideDetails?.rider_id,
                    id: rideDetails?.id,
                }))
            }
        }
        setPage('End');
        setVerifyReached(false)
        setTimeout(() => setShowModal(true), 5000);
    }

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
            <RideLayout title='final page' disabled={(page === 'Loading' || page === 'OnWay' || page === 'Start') ? true : false}>
                {page === 'OnWay' && <OnWay />}
                {page === 'Start' && <Start otp={otp} />}
                {page === 'Middle' && <Middle />}
                {page === 'End' && <End />}
                {page === 'Error' && <ErrorFindDriver />}
                {page === 'Loading' && <LoadingRider />}

                <View className='h-[1px] bg-gray-300 my-4' />

                <FinalDetails
                    paid={paid}
                    setPaid={setPaid}
                    page={page}
                    {...(page !== 'Loading' && page !== 'Error' && { number: selectedDriverDetails?.number })}
                />

                <ReactNativeModal isVisible={showModal}>
                    <View className="bg-white p-6 rounded-2xl border border-neutral-200 w-11/12 self-center">

                        {/* Header */}
                        <View className="items-center mb-4">
                            <Text className="text-xl font-JakartaBold text-black text-center mb-1">
                                🎉 Ride Completed!
                            </Text>
                            <Text className="text-sm font-JakartaLight text-neutral-600 text-center">
                                Thank you for riding with us.
                            </Text>
                        </View>

                        {/* Fare Summary Section */}
                        <View className="my-4 bg-neutral-100 rounded-lg p-4">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm font-JakartaMedium text-neutral-700">Total Fare</Text>
                                <Text className="text-base font-JakartaSemiBold text-black">
                                    ${selectedDriverDetails?.price ?? '0.00'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-sm text-neutral-500">Distance</Text>
                                <Text className="text-sm text-neutral-500">
                                    {(rideDetails && rideDetails.distance) ?? 'N/A'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-sm text-neutral-500">Duration</Text>
                                <Text className="text-sm text-neutral-500">
                                    {(rideDetails && rideDetails.duration) ?? 'N/A'}
                                </Text>
                            </View>
                        </View>

                        {/* Payment Section */}
                        {!paid ? (
                            <>
                                <View className="my-2">
                                    <Text className="text-base font-JakartaMedium text-neutral-800 mt-5 text-center">
                                        Please complete your payment
                                    </Text>

                                    <PaymentPage
                                        fullName={user?.fullName!}
                                        email={user?.emailAddresses[0].emailAddress!}
                                        amount={selectedDriverDetails?.price!}
                                        driverId={selectedDriverDetails?.id!}
                                        rideTime={selectedDriverDetails?.distanceAway!}
                                        handlePaymentDone={() => setPaid(true)}
                                    />

                                    <Text className="text-center my-3 text-neutral-500">— OR —</Text>

                                    <Text className="text-center text-base text-neutral-700">
                                        Pay with cash to the driver
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <View className="items-center my-4">
                                <Text className="text-green-600 font-JakartaSemiBold text-lg text-center">
                                    ✅ Payment completed
                                </Text>
                            </View>
                        )}

                        {/* Action Button */}
                        <CustomButton
                            title="Return to Home"
                            onPress={handleGoBack}
                            className="w-full mt-4"
                        />
                    </View>
                </ReactNativeModal>


                <ReactNativeModal isVisible={verifyReached}>
                    <View className="bg-white p-5 rounded-lg items-center">

                        {alertSent ? (
                            <>
                                <Text className="text-red-600 text-xl font-JakartaSemiBold text-center mb-2">
                                    🚨 Safety Alert Sent
                                </Text>
                                <Text className="text-center text-lg text-gray-600 mb-4">
                                    You didn’t confirm your destination in time. An alert was sent to your email.
                                </Text>
                                <CustomButton title="Return to Home" onPress={handleGoBack} className='w-1/2' />
                            </>
                        ) : (
                            <>
                                <Text className="text-red-600 text-lg font-semibold text-center mb-2">
                                    ⚠️ Please confirm your destination
                                </Text>
                                <Text className="text-gray-600 text-center mb-4">
                                    If you don’t confirm within <Text className="font-bold">{countdown}</Text> seconds,
                                    an emergency alert will be sent to your email.
                                </Text>
                                <SlideButton
                                    title="Slide to Confirm the Destination Location"
                                    onComplete={handleSlideComplete}
                                    bgColor="#0F9D58"
                                    textColor="#fff"
                                />
                            </>
                        )}
                    </View>
                </ReactNativeModal>



            </RideLayout>
        </StripeProvider>
    );
};

export default FinalPage;
