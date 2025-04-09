import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react'
import { GoogleInputProps } from '@/types/type'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { icons } from '@/constants/data';

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;


const GoogleTextInput = ({
    containerStyle,
    handlePress,
    initialLocation,
    textInputBackgroundColor
}: GoogleInputProps) => {

    const googleRef = useRef<any>(null);

    return (
        <View className={`flex flex-row items-center justify-center relative z-50 rounded-xl mb-5 ${containerStyle}`}>
            <GooglePlacesAutocomplete
                ref={googleRef}
                fetchDetails={true}
                placeholder='Where to?'
                debounce={200}
                styles={{
                    textInputContainer: {
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 20,
                        marginHorizontal: 20,
                        position: 'relative',
                        shadowColor: '#d4d4d4',

                    },
                    textInput: {
                        backgroundColor: textInputBackgroundColor || 'white',
                        fontSize: 16,
                        fontWeight: '600',
                        marginTop: 5,
                        width: '100%',
                        borderRadius: 200
                    },
                    listView: {
                        backgroundColor: textInputBackgroundColor || 'white',
                        position: 'relative',
                        top: 0,
                        width: '100%',
                        borderRadius: 10,
                        shadowColor: '#d4d4d4',
                        zIndex: 99
                    }
                }}
                onPress={(data, details = null) => {
                    if (!details) return;
                    handlePress({
                        latitude: details?.geometry.location.lat,
                        longitude: details?.geometry.location.lng,
                        address: data.description
                    })
                }}
                query={{
                    key: googlePlacesApiKey,
                    language: 'en'
                }}
                renderLeftButton={() => (
                    <View className='justify-center items-center w-6 h-6'>
                        <Image
                            source={icons.search}
                            className='w-6 h-6'
                            resizeMode='contain'
                        />
                    </View>
                )}
                renderRightButton={() => (
                    <TouchableOpacity
                        onPress={() => googleRef.current?.clear()}
                        className='justify-center items-center w-6 h-6 rounded-3xl bg-gray-200 p-1'
                    >
                        <Image
                            source={icons.close}
                            className='w-full h-full'
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                )}
                textInputProps={{
                    placeholderTextColor: 'gray',
                    placeholder: initialLocation ?? "Where to?",
                    returnKeyType: 'search'
                }}
            />
        </View>
    )
}

export default GoogleTextInput