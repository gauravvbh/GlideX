import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { icons } from '@/constants/data'
import { useClerk } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { useDriverDetails } from '@/store'

const RiderHeader = ({ hasPermissions, todayEarnings }: { hasPermissions: boolean, todayEarnings:string }) => {

    const { signOut } = useClerk();

    const {
        isVerified,
        onDuty,
        setOnDuty
    } = useDriverDetails()


    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/(auth)/sign-in');
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    return (
        <>
            <View className='bg-#EDD228 p-3 flex-row justify-between items-center h-20'>
                <MaterialIcons
                    name='logout'
                    color='white'
                    size={24}
                    onPress={handleSignOut}
                />
                <TouchableOpacity
                    className='py-0 px-4 border border-gray-500 rounded-full flex-row items-center gap-1.5'
                    disabled={!isVerified}
                    onPress={() => {
                        setOnDuty(!onDuty)
                    }}
                >
                    {/* <Text>{onduty?"":""}</Text> */}
                    <Text className='text-white font-JakartaBold'>{onDuty ? 'ON DUTY' : 'OFF DUTY'}</Text>
                    {
                        onDuty ? (
                            <Image
                                // source={onduty?:}
                                source={icons.dutyOn}
                                className='w-10 h-10'
                                resizeMode='contain'
                            />
                        ) : (
                            <Image
                                // source={onduty?:}
                                source={icons.dutyOff}
                                className='w-10 h-10'
                                resizeMode='contain'
                            />
                        )
                    }
                </TouchableOpacity>
                <MaterialIcons name='notifications' size={24} color='white' />
            </View>
            <View className="h-16 px-5 py-3 flex-row items-center justify-between bg-gray-500">
                <Text className='font-JakartaMedium text-lg text-white'>Today's Earning</Text>
                <View className="flex-row items-center gap-4">
                    <Text className='text-md font-JakartaMedium text-white'>
                        $ {isVerified ? todayEarnings : '_ _'}
                    </Text>
                </View>
            </View>
        </>
    )
}

export default RiderHeader