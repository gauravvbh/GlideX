import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Rating } from 'react-native-ratings';
import { useTheme } from 'react-native-paper';
import { uploadImageToFirebase } from '@/lib/imageToURL';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import ReactNativeModal from 'react-native-modal';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import { useDriver, useDriverDetails } from '@/store';
import Constants from 'expo-constants'


const API_URL = Constants.expoConfig?.extra?.serverUrl;

const VerificationPage = () => {
    const { user } = useUser();
    const { colors } = useTheme();

    const [carImageUri, setCarImageUri] = useState<string | null>(null);
    const [showCarImageModal, setShowCarImageModal] = useState<boolean>(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [showProfileImageModal, setShowProfileImageModal] = useState<boolean>(false)

    const [rating, setRating] = useState(0);
    const [carSeats, setCarSeats] = useState('');

    const { setCarImageURL, setCarSeats: setStoreCarSeats, setProfileImageURL, setRating: setStoreRating } = useDriver();

    const {
        setIsVerified
    } = useDriverDetails()


    const pickCarImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });


        if (!result.canceled) {
            const uri = result.assets?.[0]?.uri;
            const fileName = result.assets?.[0]?.fileName ?? `${Date.now()}.jpg`;

            try {
                const imageUrl = await uploadImageToFirebase(uri, fileName);
                setCarImageUri(imageUrl);
            } catch (error) {
                console.error("Error uploading image to Firebase:", error);
            }
        }
    };

    const pickProfileImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });


        if (!result.canceled) {
            const uri = result.assets?.[0]?.uri;
            const fileName = result.assets?.[0]?.fileName ?? `${Date.now()}.jpg`;

            try {
                const imageUrl = await uploadImageToFirebase(uri, fileName);
                setProfileImage(imageUrl);
            } catch (error) {
                console.error("Error uploading image to Firebase:", error);
            }
        }
    };


    const handleSubmit = async () => {
        try {
            const doneUpdate = await fetch(`${API_URL}/api/driver/verify-driver`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user?.id,
                    carImageUri,
                    profileImage,
                    rating,
                    carSeats,
                })
            })

            setCarImageURL({ car_image_url: carImageUri! })
            setStoreCarSeats({ car_seats: Number(carSeats) })
            setProfileImageURL({ profile_image_url: profileImage! })
            setStoreRating({ rating })
            setIsVerified(true);

            router.replace('/(rider)/home')
        } catch (error) {
            console.log('error in driver verification page', error)
        }


        //update driver details
    };

    return (
        <SafeAreaView className='flex-1'>
            <ScrollView className="flex-1 p-6 bg-gray-900">
                <View>
                    <TouchableOpacity className='mb-10' onPress={() => router.back()}>
                        <AntDesign name='close' size={30} color='white' />
                    </TouchableOpacity>
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-white mb-3">Car Image</Text>
                        <Button title="Upload Car Image" onPress={pickCarImage} />
                        {carImageUri && (
                            <View className='w-full flex-row  mt-5 justify-between items-center'>
                                <View className='flex-row gap-x-2'>
                                    <Text className='text-green-600'>Uploaded</Text>
                                    <AntDesign name='check' size={20} color='green' />
                                </View>
                                <View>
                                    <TouchableOpacity onPress={() => setShowCarImageModal(true)}>
                                        <Text className='text-white'>Show Image</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    <ReactNativeModal isVisible={showCarImageModal}>
                        <View className='h-2/4 p-5 w-full bg-white m-auto rounded-2xl'>
                            <TouchableOpacity onPress={() => setShowCarImageModal(false)} className='absolute top-3 right-3'>
                                <AntDesign name='close' size={30} color='black' />
                            </TouchableOpacity>
                            <View className='w-full h-full'>
                                {carImageUri && (
                                    <Image
                                        source={{ uri: carImageUri }}
                                        className="w-full h-full mt-4 rounded-lg"
                                        resizeMode='contain'
                                    />
                                )}
                            </View>
                        </View>
                    </ReactNativeModal>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-white mb-3">Profile Image</Text>
                        <Button title="Upload Profile Image" onPress={pickProfileImage} />
                        {profileImage && (
                            <View className='w-full flex-row  mt-5 justify-between items-center'>
                                <View className='flex-row gap-x-2'>
                                    <Text className='text-green-600'>Uploaded</Text>
                                    <AntDesign name='check' size={20} color='green' />
                                </View>
                                <View>
                                    <TouchableOpacity onPress={() => setShowProfileImageModal(true)}>
                                        <Text className='text-white'>Show Image</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    <ReactNativeModal isVisible={showProfileImageModal}>
                        <View className='h-2/4 p-5 w-full bg-white m-auto rounded-2xl'>
                            <TouchableOpacity onPress={() => setShowProfileImageModal(false)} className='absolute top-3 right-3'>
                                <AntDesign name='close' size={30} color='black' />
                            </TouchableOpacity>
                            <View className='w-full h-full'>
                                {profileImage && (
                                    <Image
                                        source={{ uri: profileImage }}
                                        className="w-full h-full mt-4 rounded-lg"
                                        resizeMode='contain'
                                    />
                                )}
                            </View>
                        </View>
                    </ReactNativeModal>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-white mb-3">Rating</Text>
                        <Rating
                            ratingCount={5}
                            imageSize={30}
                            showRating
                            onFinishRating={setRating}
                            style={{
                                marginTop: 4,
                                marginBottom: 10,
                                backgroundColor: 'transparent', // this handles the container bg
                            }}
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-lg font-bold text-white mb-3">Car Seats</Text>
                        <TextInput
                            className="bg-gray-800 text-white p-3 rounded-md"
                            placeholder="Enter number of seats"
                            placeholderTextColor={colors.primary}
                            keyboardType="numeric"
                            value={carSeats}
                            onChangeText={setCarSeats}
                        />
                    </View>

                    <CustomButton title="Submit" className='mt-10' onPress={handleSubmit} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default VerificationPage;
