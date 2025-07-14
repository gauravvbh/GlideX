import { View, Text, Image, TouchableOpacity, Linking } from 'react-native'
import { useCustomer, useDriverStore } from '@/store'
import { icons } from '@/constants/data'
import { MaterialIcons } from '@expo/vector-icons'
import { useUser } from '@clerk/clerk-expo';
import Payment from './Payment';

const FinalDetails = ({ paid, setPaid, page, number }: { paid: boolean; setPaid: (value: boolean) => void, page: string, number?: string }) => {
    const {
        userAddress,
        destinationAddress
    } = useCustomer();

    const { nearbyDrivers, selectedDriverId } = useDriverStore();

    const selectedDriverDetails = nearbyDrivers?.find(
        (driver) => driver.id === selectedDriverId,
    );


    const { user } = useUser();

    console.log('⚠️')
    console.log(page)



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
            {/* Call Driver Section */}
            {number && (
                <View className="mt-8 flex-row items-center justify-between bg-neutral-100 p-4 rounded-lg border border-neutral-300">
                    <View>
                        <Text className="text-base font-JakartaMedium text-neutral-700">Need Help?</Text>
                        <Text className="text-sm text-neutral-500">Call your driver</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:+91${number}`)}
                        className="bg-black px-4 py-2 rounded-full"
                    >
                        <Text className="text-white font-JakartaSemiBold text-base">Call</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View className='mt-10 w-full'>
                <View className='flex-row justify-between'>
                    <View className='flex-row '>
                        <MaterialIcons name="payment" size={30} color="black" />
                        <Text className='my-auto ml-2 font-JakartaBold text-lg'>Payment</Text>
                    </View>
                    <Text className='my-auto text-xl font-JakartaBold'>${selectedDriverDetails?.price || '_ _'}</Text>
                </View>
                {page !== 'Error' && page !== 'Loading' && (
                    <View>
                        {paid ? (
                            <View className='bg-green-50 p-4 mt-5 rounded-md'>
                                <Text className='text-green-600 font-semibold text-center text-lg'>✅ Payment Complete</Text>
                            </View>

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