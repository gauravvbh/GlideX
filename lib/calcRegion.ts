import { Driver } from "@/types/type";

// const isProduction = process.env.EAS_BUILD_PROFILE === 'production';

// const MAPS_KEY = isProduction
//     ? process.env.EXPO_PUBLIC_GOOGLE_API_KEY
//     : process.env.EXPO_PUBLIC_GOOGLE_API_KEY_DEV;

import Constants from 'expo-constants';

const googleMapsApiKey = Constants.expoConfig?.extra?.googleMapsApiKey;


type PlainDriver = Omit<Driver, 'setCarImageURL' | 'setCarSeats' | 'setUserLocation' | 'setId' | 'setProfileImageURL' | 'setRating' | 'setFullName' | 'setRole'>;

// export const generateMarkersFromData = ({
//     data,
//     customerLatitude,
//     customerLongitude,
// }: {
//     data: PlainDriver[];
//     customerLatitude: number;
//     customerLongitude: number;
// }): (PlainDriver & { latitude: number, longitude: number })[] => {
//     return data.map((driver) => {
//         const latOffset = (Math.random() - 0.5) * 0.01;
//         const lngOffset = (Math.random() - 0.5) * 0.01;

//         return {
//             latitude: customerLatitude + latOffset,
//             longitude: customerLongitude + lngOffset,
//             title: driver.full_name,
//             ...driver,
//         };
//     });
// };

export const calculateRegion = ({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
}: {
    userLatitude: number | null,
    userLongitude: number | null,
    destinationLatitude?: number | null,
    destinationLongitude?: number | null,
}) => {
    if (userLatitude == null || userLongitude == null) {
        return {
            latitude: 22.6125732,
            longitude: 88.3953292,
            latitudeDelta: 0.0007,
            longitudeDelta: 0.0007,
        };
    }

    if (destinationLatitude == null || destinationLongitude == null) {
        return {
            latitude: userLatitude,
            longitude: userLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
    }

    const minLat = Math.min(userLatitude, destinationLatitude);
    const maxLat = Math.max(userLatitude, destinationLatitude);
    const minLng = Math.min(userLongitude, destinationLongitude);
    const maxLng = Math.max(userLongitude, destinationLongitude);

    const latitudeDelta = (maxLat - minLat) * 1.3;
    const longitudeDelta = (maxLng - minLng) * 1.3;

    const latitude = (userLatitude + destinationLatitude) / 2;
    const longitude = (userLongitude + destinationLongitude) / 2;

    return {
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
    };
};


export const getNearbyDrivers = async (
    userLatitude: number,
    userLongitude: number,
    drivers: PlainDriver[],
    destinationLatitude?: number,
    destinationLongitude?: number,
    maxDistanceKm: number = 5
): Promise<PlainDriver[]> => {
    console.log('drivers passed on getNearbyDrivers')
    console.log(drivers)
    const validDrivers = drivers?.filter(
        (driver) => driver.userLatitude && driver.userLongitude
    ) || [];
    console.log('validDrivers', validDrivers)
    if (validDrivers.length === 0) return [];

    const destinations = validDrivers
        .map((driver) => `${driver.userLatitude},${driver.userLongitude}`)
        .join("|");

    const origin = `${userLatitude},${userLongitude}`;

    // to get the distance between the user and each driver.
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&key=${googleMapsApiKey}&units=metric`;

    try {
        const res = await fetch(url);
        const json = await res.json();

        if (json.status !== "OK") throw new Error("Google API error");

        const elements = json.rows[0].elements;

        const nearbyDrivers: PlainDriver[] = [];

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];

            if (
                element.status === "OK" &&
                element.distance?.value != null
                // element.distance.value <= maxDistanceKm * 1000
            ) {
                const driver = validDrivers[i];

                // Estimate total travel time (driver -> user -> destination)
                let price = '';
                if (destinationLatitude && destinationLongitude) {
                    const responseToUser = await fetch(
                        `https://maps.googleapis.com/maps/api/directions/json?origin=${driver.userLatitude},${driver.userLongitude}&destination=${userLatitude},${userLongitude}&key=${googleMapsApiKey}`
                    );
                    const dataToUser = await responseToUser.json();
                    const timeToUser = dataToUser.routes[0].legs[0].duration.value; // in seconds

                    const responseToDest = await fetch(
                        `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${googleMapsApiKey}`
                    );
                    const dataToDest = await responseToDest.json();
                    const timeToDest = dataToDest.routes[0].legs[0].duration.value; // in seconds

                    const totalTime = (timeToUser + timeToDest) / 60; // minutes
                    price = (totalTime * 0.5).toFixed(2); // your rate logic
                }

                nearbyDrivers.push({
                    ...driver,
                    distanceAway: element.distance.value / 1000,
                    price
                });
            }
        }

        console.log('Nearby drivers with price:', nearbyDrivers);
        return nearbyDrivers;
    } catch (err) {
        console.error("Error in getNearbyDrivers:", err);
        return [];
    }
};
