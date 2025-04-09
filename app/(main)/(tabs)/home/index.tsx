import { SignedIn, SignedOut, useAuth, useClerk, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import * as Linking from 'expo-linking'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons, images, rides } from '@/constants/data'
import RideCard from '@/components/RideCard'
import GoogleTextInput from '@/components/GoogleTextInput'
import Map from '@/components/Map'
import { useLocationStore } from '@/store'
import { useEffect, useState } from 'react'
import * as Location from 'expo-location';


const HomePage = () => {
    const { setUserLocation, setDestinationLocation } = useLocationStore()
    const { user } = useUser();
    const [hasPermissions, setHasPermissions] = useState(false);

    useEffect(() => {
        const requestLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setHasPermissions(false);
                return;
            }
            let location = await Location.getCurrentPositionAsync();
            const address = await Location.reverseGeocodeAsync({
                latitude: location.coords?.latitude!,
                longitude: location.coords?.longitude!
            });
            // console.log(address)

            setUserLocation({
                latitude: location.coords?.latitude!,
                longitude: location.coords?.longitude!,
                address: `${address[0].name}, ${address[0].region}`
            })
        };
        requestLocation();
    }, [])

    const loading = false;

    const handleSignOut = () => {

    }

    const handleDestinationPress = () => {

    }

    return (
        <SafeAreaView className='bg-[#454444] text-white'>
            <FlatList
                data={rides?.slice(0, 5)}
                renderItem={({ item }) => <RideCard ride={item} />}
                className='px-5'
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{
                    paddingBottom: 100,
                }}
                ListEmptyComponent={() => (
                    <View className='flex flex-col items-center justify-center'>
                        {!loading ?
                            (
                                <>
                                    <Image
                                        source={images.noResult}
                                        className='w-40 h-40'
                                        alt='No recent rides found '
                                        resizeMode='contain'
                                    />
                                    <Text className='text-sm'>No recent rides found</Text>
                                </>
                            ) :
                            (
                                <ActivityIndicator
                                    size="small"
                                    color="#000"
                                />
                            )
                        }
                    </View>
                )}
                ListHeaderComponent={() => (
                    <>
                        <View className='flex flex-row items-center justify-between my-5'>
                            <Text className='text-xl capitalize font-JakartaExtraBold'>
                                Welcome{","} {user?.firstName} 👋
                            </Text>
                            <TouchableOpacity
                                onPress={handleSignOut}
                                className='flex justify-center items-center w-10 h-10 rounded-full bg-white'
                            >
                                <Image
                                    source={icons.out}
                                    className='w-4 h-4'
                                />
                            </TouchableOpacity>
                        </View>
                        <GoogleTextInput
                            containerStyle='bg-white shadow-md shadow-neutral-300'
                            handlePress={handleDestinationPress}
                        />
                        <>
                            <Text className='text-xl font-JakartaBold mt-5 mb-3'>
                                Your Current Location

                            </Text>
                            <View className="flex flex-row items-center bg-transparent h-[300px]">
                                <Map />
                            </View>
                        </>
                        <Text className='text-xl font-JakartaBold mt-5 mb-3'>
                            Recent Rides

                        </Text>
                    </>
                )}
            />
        </SafeAreaView>
    )
}

export default HomePage