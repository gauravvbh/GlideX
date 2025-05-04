import { View, Text, Image } from 'react-native'
import { useCustomer, useDriverStore } from '@/store'
import { icons } from '@/constants/data'
import { MaterialIcons } from '@expo/vector-icons'
import { useUser } from '@clerk/clerk-expo';
import Payment from './Payment';

const FinalDetails = ({ paid, setPaid, page }: { paid: boolean; setPaid: (value: boolean) => void, page: string }) => {
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
                {page !== 'Error' && (
                    <View>
                        {paid ? (
                            <Text className='text-green-600 font-semibold'>✅ Paid</Text>
                        ) : (
                            <>
                                <Payment
                                    fullName={user?.fullName!}
                                    email={user?.emailAddresses[0].emailAddress!}
                                    amount={selectedDriverDetails?.price!}
                                    driverId={selectedDriverDetails?.id!}
                                    rideTime={selectedDriverDetails?.distanceAway!}
                                    handlePaymentDone={() => setPaid(true)}
                                />
                                <Text className='my-4 text-center text-gray-500'>OR</Text>
                                <Text className='text-center text-lg'>Pay the driver in cash</Text>
                            </>
                        )}
                    </View>
                )}
            </View>

        </View>
    )
}

export default FinalDetails