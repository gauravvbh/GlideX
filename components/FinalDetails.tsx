import { View, Text, Image } from 'react-native'
import { useCustomer, useDriverStore } from '@/store'
import { icons } from '@/constants/data'
import { MaterialIcons } from '@expo/vector-icons'
import { useUser } from '@clerk/clerk-expo';

const FinalDetails = ({ paid }: { paid: boolean }) => {
    const {
        userAddress,
        destinationAddress
    } = useCustomer();

    const { nearbyDrivers, selectedDriverId } = useDriverStore();

    const selectedDriverDetails = nearbyDrivers?.find(
        (driver) => driver.id === selectedDriverId,
    );


    const { user } = useUser();



    return (
        <View >
            <Text className='text-xl font-JakartaBold'>Location Details</Text>
            <View className='mt-5 flex-row'>
                <Image
                    source={icons.origin}
                    className='h-7 w-7 my-auto'
                    resizeMode='contain'
                />
                <Text className='my-auto ml-2 text-lg text-start'>{userAddress && userAddress}</Text>
            </View>
            <View className='mt-5 flex-row'>
                <Image
                    source={icons.destination}
                    className='h-7 w-7 my-auto'
                    resizeMode='contain'
                />
                <Text className='my-auto ml-2 text-lg text-start'>{destinationAddress && destinationAddress}</Text>
            </View>
            <View className='mt-10 w-full'>
                <View className='flex-row justify-between'>
                    <View className='flex-row '>
                        <MaterialIcons name="payment" size={30} color="black" />
                        <Text className='my-auto ml-2 font-JakartaBold text-lg'>Payment</Text>
                    </View>
                    <Text className='my-auto text-xl font-JakartaBold'>${selectedDriverDetails?.price || '_ _'}</Text>
                </View>
                <View className='pl-1'>
                    {
                        paid ? (
                            <Text className='text-green-600 font-JakartaSemiBold text-lg'>Paid</Text>
                        ) : (
                            <Text className=' text-lg'>Payment via cash</Text>
                        )
                    }
                </View>
            </View>
            {/* <PaymentPage
                fullName={user?.fullName!}
                email={user?.emailAddresses[0].emailAddress!}
                amount={selectedDriverDetails?.price!}
                driverId={selectedDriverDetails?.id!}
                rideTime={selectedDriverDetails?.time!}
            /> */}
        </View>
    )
}

export default FinalDetails