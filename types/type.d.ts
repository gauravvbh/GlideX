import { TextInputProps, TouchableOpacityProps } from "react-native";
import { UserResource } from '@clerk/types';


type PlainDriver = Omit<Driver, 'setCarImageURL' | 'setCarSeats' | 'setTime' | 'setPrice' | 'setUser' | 'setUserLocation' | 'setId' | 'setProfileImageURL' | 'setRating' | 'setFullName' | 'setRole'>;

declare interface MapProps {
    destinationLatitude?: number;
    destinationLongitude?: number;
    onDriverTimesCalculated?: (driversWithTimes: Driver[]) => void;
    selectedDriver?: number | null;
    onMapReady?: () => void;
}

// declare interface Ride {
//     ride_id: number,
//     origin_address: string;
//     destination_address: string;
//     origin_latitude: number;
//     origin_longitude: number;
//     destination_latitude: number;
//     destination_longitude: number;
//     ride_time: number;
//     fare_price: number;
//     payment_status: string;
//     driver_id: number;
//     user_id: string;
//     created_at: string;
//     driver: {
//         first_name: string;
//         last_name: string;
//         car_seats: number;
//     };
// }

declare interface ButtonProps extends TouchableOpacityProps {
    title: string;
    bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
    textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
    IconLeft?: React.ComponentType<any>;
    IconRight?: React.ComponentType<any>;
    className?: string;
    disabled?: boolean
}

declare interface GoogleInputProps {
    icon?: string;
    initialLocation?: string;
    containerStyle?: string;
    textInputBackgroundColor?: string;
    handlePress: ({
        latitude,
        longitude,
        address,
    }: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
}

declare interface InputFieldProps extends TextInputProps {
    label: string;
    icon?: any;
    secureTextEntry?: boolean;
    labelStyle?: string;
    containerStyle?: string;
    inputStyle?: string;
    iconStyle?: string;
    className?: string;
}

declare interface PaymentProps {
    fullName: string;
    email: string;
    amount: string;
    driverId: string;
    rideTime: number;
    handlePaymentDone: () => void;
}

declare interface DriverCardProps {
    item: PlainDriver;
    selected: string;
    setSelected: () => void;
}

declare interface UserData {
    id: string | null;
    role: string | null;
    profile_image_url: string | null;
    rating?: number | null;
    full_name: string | null;
    email: string | null;
    userLatitude?: number | null;
    userLongitude?: number | null;
    userAddress?: string | null;
    number?: sting | null;

    setUserLocation: (location: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
    setId: (data: { customerId: string }) => void;
    setProfileImageURL: (data: { profile_image_url: string }) => void;
    setRating: (data: { rating: number }) => void;
    setFullName: (data: { full_name: string }) => void;
    setRole: (data: { role: string }) => void;
}

declare interface Customer extends UserData {
    destinationLatitude: number | null;
    destinationLongitude: number | null;
    destinationAddress: string | null;
    setDestinationLocation: ({
        latitude,
        longitude,
        address,
    }: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
    clearDestinationLocation: () => void;
}

declare interface StoreRole {
    role: string | null;
    setRole: (data: { role: string }) => void;
}


declare interface Driver extends UserData {
    distanceAway?: number;
    price?: string | null;
    car_image_url?: string | null;
    car_seats?: number | null;
    setCarImageURL: ({ car_image_url }: { car_image_url: string }) => void;
    setCarSeats: ({ car_seats }: { car_seats: number }) => void;
}


// declare interface DriverStore {
//     drivers: PlainDriver[];
//     nearbyDrivers: PlainDriver[];
//     selectedDriverDetails: PlainDriver | null;
//     giveRiderDetails: (riderId: string) => PlainDriver | undefined
//     setSelectedDriverDetails: (driver: PlainDriver) => void;
//     updateSelectedDriverLocation: (latitude: number, longitude: number, address: string) => void;
//     selectedDriverId: string | null;
//     setSelectedDriverId: (driverId: string) => void;
//     setDrivers: (drivers: PlainDriver[]) => void;
//     setNearbyDrivers: (drivers: PlainDriver[] | PlainDriver) => void;
//     updateDriverLocation: (driverId: string, latitude: number, longitude: number, address: string) => void;
//     removeDriverLocation: (driverId: string) => void;
//     clearSelectedDriver: () => void;
//     removeNearbyDriver: (driverId: string) => void;
// }

declare interface DriverStore {
    drivers: PlainDriver[];
    nearbyDrivers: PlainDriver[];
    selectedDriverDetails: PlainDriver | null
    setSelectedDriverDetails: (driver: PlainDriver) => void;
    updateSelectedDriverLocation: (latitude: number, longitude: number, address: string) => void;
    selectedDriverId: string | null;
    setSelectedDriverId: (driverId: string) => void;
    giveRiderDetails: (driverId: string) => PlainDriver | undefined;
    setDrivers: (drivers: PlainDriver[]) => void;
    setNearbyDrivers: (drivers: PlainDriver[]) => void;
    addNearbyDrivers: (driver: PlainDriver) => void;
    updateDriverLocation: (driverId: string, latitude: number, longitude: number, address: string) => void;
    removeDriverLocation: (driverId: string) => void;
    clearSelectedDriver: () => void;
    removeNearbyDriver: (driverId: string) => void;
}


declare interface RideData {
    created_at: string;
    destination_address: string;
    destination_latitude: number;
    destination_longitude: number;
    driver: Driver;
    driver_id: string;
    fare_price: number;
    origin_address: string;
    origin_latitude: number;
    origin_longitude: number;
    payment_status: 'Paid' | 'Unpaid';
    ride_id: string;
    user_id: string;
}

declare interface RidesStore {
    Rides: RideData[];
    selectedRide: null | RideData;
    setRides: (allRides: RideData[]) => void;
    setSelectedRide: (id: string) => void;
}


declare interface DriverDetails {
    onDuty: boolean;
    isVerified: null | boolean;
    setOnDuty: (onDuty: boolean) => void;
    setIsVerified: (verified: boolean) => void;
}



declare interface WSStore {
    ws: WebSocket | null;
    setWebSocket: (ws: WebSocket) => void;
}

declare interface RideOfferDetails {
    id: string,
    fare: string,
    duration: string,
    distance: string,
    pickupDetails: {
        pickup: string,
        pickupAddress: string,
        pickupDistance: number,
        pickupLongitude: number,
        pickupLatitude: number
    },
    dropoffDetails: {
        dropoff: string,
        dropoffAddress: string,
        dropoffLatitude: number,
        dropoffLongitude: number
    },
    customerDetails: {
        full_name: string,
        email: string,
        number: string
    },
    rider_id: string,
    customer_id: string,
    status: string
}

declare interface RideOffer {
    rideOffer: RideOfferDetails[],
    activeRideId: string | null,
    addRideOffer: (ride: RideOfferDetails) => void;
    setActiveRideId: (rideId: string) => void;
    removeRideOffer: (rideId: string) => void;
    giveRideDetails: (rideId: string) => RideOfferDetails | undefined;
    changeStatus: (rideId: string, newStatus: string) => void;
}