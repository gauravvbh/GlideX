import React, { useState, useEffect } from 'react';
import {
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '@/constants/data'; // Your icon paths
import { useCustomer } from '@/store';
import { router } from 'expo-router';

const googlePlacesApiKey =
    process.env.NODE_ENV === 'production'
        ? process.env.EXPO_PUBLIC_GOOGLE_API_KEY
        : process.env.EXPO_PUBLIC_GOOGLE_API_KEY_DEV;

type Suggestion = {
    description: string;
    place_id: string;
};

const AutocompletePage = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const { userLatitude, userLongitude, setDestinationLocation } = useCustomer();

    const handleDestinationPress = (location: {
        latitude: number;
        longitude: number;
        address: string;
    }) => {
        setDestinationLocation(location);
        router.push('/(main)/find-ride');
    };

    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        const fetchPlaces = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                        query
                    )}&key=${googlePlacesApiKey}&location=${userLatitude},${userLongitude}&radius=10000&language=en&components=country:in`
                );
                const data = await response.json();
                setSuggestions(data.predictions || []);
            } catch (error) {
                console.error('Error fetching autocomplete:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, [query]);

    const fetchPlaceDetailsAndHandle = async (placeId: string, description: string) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googlePlacesApiKey}`
            );
            const data = await response.json();
            const location = data.result.geometry.location;

            handleDestinationPress({
                latitude: location.lat,
                longitude: location.lng,
                address: description,
            });

            setQuery(description);
            setSuggestions([]);
        } catch (error) {
            console.error('Error fetching place details:', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-black px-5">
            <TouchableOpacity onPress={() => router.back()} className='flex justify-center items-center w-10 h-10 rounded-full bg-white'>
                <Image source={icons.backArrow} className='w-5 h-5' />
            </TouchableOpacity>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View className="mt-10 mb-6 items-center">
                    <Text className="text-white text-3xl font-bold text-center">
                        Where do you want to go?
                    </Text>
                </View>

                <View className="flex-row items-center bg-neutral-800 rounded-full px-4 py-3">
                    <Image source={icons.search} className="w-6 h-6 tint-white" />
                    <TextInput
                        placeholder="Search destination..."
                        placeholderTextColor="#aaa"
                        value={query}
                        onChangeText={setQuery}
                        className="flex-1 text-white text-base ml-3"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Image source={icons.close} className="w-5 h-5 ml-2 tint-white" />
                        </TouchableOpacity>
                    )}
                </View>

                {loading && (
                    <ActivityIndicator size="large" color="#aaa" className="mt-5" />
                )}

                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.place_id}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 50 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() =>
                                fetchPlaceDetailsAndHandle(item.place_id, item.description)
                            }
                            className="p-4 border-b border-neutral-700"
                        >
                            <Text className="text-white text-base">{item.description}</Text>
                        </TouchableOpacity>
                    )}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AutocompletePage;
