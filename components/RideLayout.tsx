import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useRef } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useRouter } from 'expo-router'
import { icons } from '@/constants/data'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import Map from './Map'
import { useCustomer, useDriverStore } from '@/store'

const RideLayout = ({ title, children, snapPoints, disabled }: { title: string, children: React.ReactNode, snapPoints?: string[], disabled: boolean }) => {


    const {
        clearDestinationLocation,
    } = useCustomer();
    const {
        clearSelectedDriver
    } = useDriverStore();

    const bottomSheetRef = useRef<BottomSheet>(null);

    const router = useRouter()
    return (
        <GestureHandlerRootView>
            <View className='flex-1 bg-red-600'>
                <View className='flex flex-1 h-screen bg-blue-500'>
                    <View className='flex flex-row absolute z-10 top-16  items-center justify-start px-5'>
                        <TouchableOpacity
                            onPress={() => {
                                if (title === 'Ride') {
                                    clearDestinationLocation();
                                    clearSelectedDriver();
                                }
                                router.back()
                            }}
                            disabled={disabled}
                        >
                            {
                                !disabled && (
                                    <View className='w-10 h-10 bg-white rounded-full items-center justify-center'>
                                        <Image
                                            source={icons.backArrow}
                                            className='w-6 h-6'
                                        />
                                    </View>
                                )
                            }
                        </TouchableOpacity>
                        {
                            !disabled && (
                                <Text className='text-xl text-white font-JakartaSemiBold ml-5'>{title || 'Go back'}</Text>
                            )
                        }
                    </View>
                    <Map />
                </View>

                <BottomSheet
                    keyboardBehavior='extend'
                    ref={bottomSheetRef}
                    snapPoints={snapPoints || ['40%', '80%']}
                    index={0}
                    style={{

                        borderTopEndRadius: 50
                    }}

                >
                    <BottomSheetView style={{ flex: 1, padding: 20, borderRadius: 50 }}>
                        {children}
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </GestureHandlerRootView>
    )
}

export default RideLayout