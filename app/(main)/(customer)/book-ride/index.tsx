import { View, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import RideLayout from '@/components/RideLayout'
import DriverCard from '@/components/DriverCard'
import CustomButton from '@/components/CustomButton'
import { useRouter } from 'expo-router'
import { useDriverStore } from '@/store'
import { Driver } from '@/types/type'

type PlainDriver = Omit<Driver, 'setCarImageURL' | 'setCarSeats' | 'setTime' | 'setPrice' | 'setUser' | 'setUserLocation' | 'setId' | 'setProfileImageURL' | 'setRating' | 'setFullName' | 'setRole'>;

const BookRidePage = () => {

    const router = useRouter();
    const {
        nearbyDrivers,
        selectedDriverId,
        setSelectedDriverId,
        setSelectedDriverDetails
    } = useDriverStore();

    const [driversWLocations, setDriversWLocations] = useState<PlainDriver[]>([]);


    useEffect(() => {
        const driversWithLocation = nearbyDrivers?.filter(driver => driver.userAddress) || [];
        setDriversWLocations(driversWithLocation);
    }, [nearbyDrivers])



    return (
        <RideLayout title='Choose a Driver' disabled={false}>
            <FlatList
                data={driversWLocations}
                // data={drivers}
                renderItem={({ item }) => (
                    <DriverCard item={item} selected={selectedDriverId ?? ''} setSelected={() => setSelectedDriverId(item.id!)} />
                )}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                ListFooterComponent={() => (
                    <View className='mx-5 mt-10'>
                        <CustomButton
                            title='Select Ride'
                            disabled={!selectedDriverId}
                            className='w-full'
                            onPress={() => {
                                if (selectedDriverId) {
                                    const findSelectedDriverDetails = nearbyDrivers?.find(
                                        (driver) => driver.id === selectedDriverId,
                                    );
                                    console.log('😁')
                                    console.log(findSelectedDriverDetails)
                                    setSelectedDriverDetails(findSelectedDriverDetails!);
                                }
                                router.push('/(main)/confirm-ride' as never)
                            }}
                        />
                    </View>
                )}
            />
        </RideLayout>
    )
}

export default BookRidePage