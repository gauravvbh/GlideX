import { useClerk, useUser } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FlatList, Image, Platform, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { icons, images } from '@/constants/data';
import RideCard from '@/components/RideCard';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useCustomer, useRidesStore, useUserStore, useWSStore } from '@/store';
import Map from '@/components/Map';
import Constants from 'expo-constants';
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
const WEBSOCKET_API_URL = Constants.expoConfig?.extra?.webSocketServerUrl;

const HomePage = () => {
    const { setUserLocation: setCustomerLocation, setId: setCustomerId, setRole: setCustomerRole, setFullName: setCustomerFullName, setProfileImageURL: setCustomerProfileImageURL } = useCustomer();

    const { setRides, Rides } = useRidesStore();
    const { ws, setWebSocket } = useWSStore();

    const { user } = useUser();
    const { role } = useUserStore();
    const data = user?.publicMetadata;
    const { signOut } = useClerk();
    const [hasPermissions, setHasPermissions] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [address, setAddress] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);
    const [_, forceUpdate] = useState(0);


    //setting the ws server
    useEffect(() => {
        let newWs: WebSocket;

        if (!ws && user) {
            // newWs = new WebSocket('ws://192.168.0.146:8080'); //wss://websocket-server-for-glidex.onrender.com
            newWs = new WebSocket(WEBSOCKET_API_URL);

            newWs.onopen = () => {
                newWs.send(JSON.stringify({
                    type: 'register',
                    id: user?.id,
                    role: 'customer',
                }));

                console.log("WebSocket connected");
            };

            newWs.onerror = () => {
                console.log('An error occurred while connecting to the server.');
            };

            newWs.onclose = () => {
                console.log("WebSocket closed");
            };

            setWebSocket(newWs);
        }
    }, [user]);


    const onRefresh = async () => {
        setRefreshing(true);

        forceUpdate(n => n + 1);

        setRefreshing(false);
    };

    useEffect(() => {
        try {
            const requestLocation = async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setHasPermissions(false);
                    return;
                }
                setHasPermissions(true);
                let location = await Location.getCurrentPositionAsync();
                console.log('location')
                console.log(location)
                const address = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
                // console.log('address of customer ',address)

                setAddress(address[0]?.formattedAddress ?? '');

                if ((role ?? data?.role) === 'customer') {
                    setCustomerLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        address: address[0]?.formattedAddress ?? ''
                    });

                    if (role) setCustomerRole({ role });
                    if (user) {
                        setCustomerId({ customerId: user.id });
                        setCustomerFullName({ full_name: user.fullName ?? '' });
                        setCustomerProfileImageURL({ profile_image_url: user.imageUrl });
                    }
                }
            };

            if (user) requestLocation();
        } catch (error) {
            console.error("Error getting location:", error);
        }

    }, [user]);


    useEffect(() => {
        let subscriber: Location.LocationSubscription;
        try {
            const startWatching = async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setHasPermissions(false);
                    return;
                }

                setHasPermissions(true);
                subscriber = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, distanceInterval: 10 },
                    (location) => {
                        (async () => {
                            console.log('location from watcher')
                            console.log(location)
                            const address = await Location.reverseGeocodeAsync({
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude
                            });

                            setAddress(address[0]?.formattedAddress ?? '');

                            if ((role ?? data?.role) === 'customer') {
                                setCustomerLocation({
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude,
                                    address: address[0]?.formattedAddress ?? ''
                                });

                                if (role) setCustomerRole({ role });
                                if (user) {
                                    setCustomerId({ customerId: user.id });
                                    setCustomerFullName({ full_name: user.fullName ?? '' });
                                    setCustomerProfileImageURL({ profile_image_url: user.imageUrl });
                                }
                            }
                        })
                    }
                );
            };
            startWatching();
        } catch (error) {
            console.error("Error getting location:", error);
        }

        return () => {
            subscriber?.remove();
        };
    }, []);


    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/(auth)/sign-in');
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };


    //getting all rides from api
    useEffect(() => {
        if (!user?.id) return;

        const getAllRides = async () => {
            setLoading(true)
            try {
                const url = `${API_URL}/api/ride/get-all?clerk_id=${user.id}`;


                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const { data } = await response.json();
                setRides(data);
            } catch (error) {
                console.log('Error fetching rides:', error);
            }
            finally {
                setLoading(false)
            }
        };

        getAllRides();
    }, [user?.id]);

    return (
        <SafeAreaView className='bg-bgColor text-primaryTextColor flex-1'>
            <FlatList
                data={(Rides || []).slice(0, 3)}
                keyExtractor={(item, index) => item?.ride_id?.toString() || `fallback-key-${index}`}
                renderItem={({ item }) => <RideCard ride={item} />}
                className='px-5'
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={() => (
                    <View className='flex flex-col items-center justify-center'>
                        {!loading ? (
                            <>
                                <Image source={images.noResult} className='w-40 h-40' alt='No recent rides found' resizeMode='contain' />
                                <Text className='text-sm text-primaryTextColor'>No recent rides found</Text>
                            </>
                        ) : (
                            <View className="items-center justify-center">
                                <LottieView
                                    source={require('@/assets/animations/loading.json')}
                                    autoPlay
                                    loop
                                    style={{ width: 250, height: 250 }}
                                />
                            </View>
                        )}
                    </View>
                )}
                ListHeaderComponent={() => (
                    <>
                        <View className='flex flex-row items-center justify-between my-5'>
                            <Text className='text-xl text-primaryTextColor capitalize font-JakartaExtraBold'>
                                Welcome{","} {user?.firstName} 👋
                            </Text>
                            <TouchableOpacity onPress={handleSignOut} className='flex justify-center items-center w-10 h-10 rounded-full bg-white'>
                                <Image source={icons.out} className='w-4 h-4' />
                            </TouchableOpacity>
                        </View>

                        <View>
                            <TouchableOpacity
                                onPress={() => router.push('/autocomplete')}
                                className='bg-white rounded-full px-4 py-3 mb-4 flex-row items-center gap-x-3'
                            >
                                <Image source={icons.search} className='w-6 h-6 tint-white' />
                                <Text className='text-secondaryTextColor text-base'>Search destination...</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className='text-xl text-primaryTextColor font-JakartaBold mt-5'>Your Current Location:</Text>
                        {address && (
                            <Text className='text-lg font-Jakarta text-placeholderTextColor mb-3'>{address}</Text>
                        )}
                        <View className='w-full' style={{ height: 300, borderRadius: 16, overflow: 'hidden' }}>
                            <Map />
                        </View>
                        <Text className='text-2xl text-primaryTextColor font-JakartaBold mt-10 mb-3'>Recent Rides</Text>
                    </>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#000000']} // Android
                        tintColor="#000"     // iOS
                    />
                }
            />
        </SafeAreaView>

    );
};

export default HomePage;
