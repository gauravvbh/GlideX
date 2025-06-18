import { Image, Text, View } from "react-native";

import RideLayout from "@/components/RideLayout";
import { useCustomer, useDriverStore, useRideOfferStore, useWSStore } from "@/store";
import { icons } from "@/constants/data";
import { useRouter } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { formatTime } from "@/lib/utils";
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import Constants from 'expo-constants';

const WEBSOCKET_API_URL = Constants.expoConfig?.extra?.webSocketServerUrl;




const ConfirmRidePage = () => {
    const router = useRouter()
    const { userAddress, destinationAddress, userLatitude, userLongitude, destinationLatitude, destinationLongitude } = useCustomer();
    const { selectedDriverId, nearbyDrivers, setSelectedDriverDetails, updateDriverLocation, updateSelectedDriverLocation, selectedDriverDetails } = useDriverStore();
    const { ws, setWebSocket } = useWSStore();
    const { user } = useUser()
    const { addRideOffer } = useRideOfferStore(store => store);


    // const findSelectedDriverDetails = nearbyDrivers?.find(
    //     (driver) => driver.id === selectedDriverId,
    // );

    // console.log(findSelectedDriverDetails?.distanceAway)
    // console.log('findSelectedDriverDetails')
    // useEffect(() => {
    //     if (findSelectedDriverDetails) {
    //         setSelectedDriverDetails(findSelectedDriverDetails);
    //     }
    // }, [findSelectedDriverDetails]);


    useEffect(() => {
        let socket: WebSocket;

        if (!ws) {
            const newWs = new WebSocket(WEBSOCKET_API_URL);
            

            newWs.onopen = () => {
                console.log("WebSocket connected");
            };

            newWs.onerror = () => {
                console.log('An error occurred while connecting to the server.');
            };

            socket = newWs;
            setWebSocket(newWs);
        } else {
            socket = ws;
        }


        socket.onmessage = (event) => {
            console.log('Message received from WebSocket:');
            console.log(event.data)
            const message = JSON.parse(event.data);
            console.log('📍Parsed message from message page:');
            console.log(message)
            if (message.type === 'riderLocationUpdated' || message.type === 'riderLocationUpdate') {
                updateDriverLocation(message.driverId, message.latitude, message.longitude, message.address)
                updateSelectedDriverLocation(message.latitude, message.longitude, message.address)
            }
        };
    }, [ws]);


    function generateRideId(): string {
        // const timestamp = Date.now().toString(36); // base36 timestamp
        const random = Math.random().toString(36).substring(2, 6); // 4-char random string
        return `ride_${random}`;
    }



    const makePickup = (): string => {
        if (userAddress) {
            return userAddress.split(',')[0].trim();
        }
        return '';
    }


    const makeDropoff = (): string => {
        if (destinationAddress) {
            return destinationAddress.split(',')[0].trim();
        }
        return '';
    }


    const rideDetails = () => {
        return {
            id: generateRideId(),
            role: 'customer',
            pickupDetails: {
                pickup: makePickup(),
                pickupAddress: userAddress ?? '',
                pickupLongitude: userLongitude ?? 0,
                pickupLatitude: userLatitude ?? 0,
                pickupDistance: selectedDriverDetails?.distanceAway ?? 0,
            },
            dropoffDetails: {
                dropoff: makeDropoff(),
                dropoffAddress: destinationAddress ?? '',
                dropoffLatitude: destinationLatitude ?? 0,
                dropoffLongitude: destinationLongitude ?? 0
            },
            customerDetails: {
                full_name: user?.fullName ?? '',
                email: user?.primaryEmailAddress?.emailAddress ?? '',
                number: String(user?.publicMetadata.phone_number ?? '')
            },
            rider_id: selectedDriverId ?? '',
            customer_id: user?.id ?? '',
            status: 'offer',
        };
    };


    const handleOfferRide = () => {
        if (ws?.readyState === WebSocket.OPEN) {
            const ride = rideDetails()
            ws.send(JSON.stringify({
                type: 'rideOffer',
                role: 'customer',
                rideDetails: ride
            }))
            addRideOffer(ride)
        }
    }



    return (
        <RideLayout title="Book Ride" disabled={false}>
            <>
                <Text className="text-xl font-JakartaSemiBold mb-3">
                    Ride Information
                </Text>

                <View className="flex flex-col w-full items-center justify-center mt-10">
                    {
                        selectedDriverDetails?.profile_image_url && (
                            <Image
                                source={{ uri: selectedDriverDetails?.profile_image_url }}
                                className="w-28 h-28 rounded-full"
                            />
                        )
                    }


                    <View className="mt-5">
                        <Text className="text-lg font-JakartaSemiBold">
                            {selectedDriverDetails?.full_name}
                        </Text>
                    </View>
                    <View className="mt-1">
                        <View className="flex flex-row items-center space-x-0.5">
                            <Image
                                source={icons.star}
                                className="w-5 h-5"
                                resizeMode="contain"
                            />
                            <Text className="text-lg font-JakartaRegular">
                                {selectedDriverDetails?.rating}
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
                    <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
                        <Text className="text-lg font-JakartaRegular">Ride Price</Text>
                        <Text className="text-lg font-JakartaRegular text-[#0CC25F]">
                            ${selectedDriverDetails?.price || '_ _'}
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
                        <Text className="text-lg font-JakartaRegular">Pickup Time</Text>
                        <Text className="text-lg font-JakartaRegular">
                            {formatTime(selectedDriverDetails?.distanceAway! * 5)}
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-between w-full py-3">
                        <Text className="text-lg font-JakartaRegular">Car Seats</Text>
                        <Text className="text-lg font-JakartaRegular">
                            {selectedDriverDetails?.car_seats}
                        </Text>
                    </View>
                </View>

                <View className="flex flex-col w-full items-start justify-center mt-5">
                    <View
                        className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
                        <Image source={icons.to} className="w-6 h-6" />
                        <Text className="text-lg font-JakartaRegular ml-2">
                            {userAddress}
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
                        <Image source={icons.point} className="w-6 h-6" />
                        <Text className="text-lg font-JakartaRegular ml-2">
                            {destinationAddress}
                        </Text>
                    </View>
                </View>
                <CustomButton
                    title="Confirm Ride"
                    onPress={() => {
                        handleOfferRide();
                        router.replace('/(main)/(customer)/final-page' as never)
                    }}
                    className="mt-10 w-full"
                />
            </>
        </RideLayout>
    );
};

export default ConfirmRidePage;