import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { GoogleInputProps } from '@/types/type';
import { icons } from '@/constants/data';
import { useCustomer } from '@/store';
import Constants from 'expo-constants';

// const googlePlacesApiKey =
//     process.env.NODE_ENV === 'production'
//         ? process.env.EXPO_PUBLIC_GOOGLE_API_KEY
//         : process.env.EXPO_PUBLIC_GOOGLE_API_KEY_DEV;


const googlePlacesApiKey = Constants.expoConfig?.extra?.googleMapsApiKey;

const GoogleTextInput = ({
    icon,
    containerStyle,
    handlePress,
    initialLocation,
    textInputBackgroundColor,
}: GoogleInputProps) => {
    const inputRef = useRef<TextInput>(null);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { userLatitude, userLongitude } = useCustomer();

    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                        query
                    )}&key=${googlePlacesApiKey}&location=${userLatitude},${userLongitude}&radius=5000&language=en&components=country:in`
                );
                const data = await response.json();
                setSuggestions(data.predictions || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error('Autocomplete fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [query]);

    const handleSelect = async (place_id: string, description: string) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${googlePlacesApiKey}`
            );
            const data = await response.json();
            const location = data.result.geometry.location;

            handlePress({
                latitude: location.lat,
                longitude: location.lng,
                address: description,
            });

            // Truncate the address to display only a portion in the input field
            setQuery(description.length > 40 ? description.slice(0, 40) + '...' : description);
            setSuggestions([]);
            setShowSuggestions(false); // 🔑 Hide list immediately after selecting
        } catch (err) {
            console.error('Place details fetch error:', err);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className={`z-50 mb-5 ${containerStyle}`}
        >
            <View className="flex-row items-center bg-white rounded-full px-4 py-3 shadow shadow-neutral-300">
                <Image
                    source={icon || icons.search}
                    className="w-5 h-5 mr-3 tint-black"
                    resizeMode="contain"
                />
                <TextInput
                    ref={inputRef}
                    placeholder={initialLocation || 'Where to?'}
                    placeholderTextColor="gray"
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        setShowSuggestions(true);
                    }}
                    className="flex-1 text-black text-base"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => {
                        setQuery('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                    }}>
                        <Image
                            source={icons.close}
                            className="w-4 h-4 tint-black"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}
            </View>

            {loading && <ActivityIndicator className="mt-3" color="#666" size="small" />}

            {showSuggestions && suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.place_id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleSelect(item.place_id, item.description)}
                            className="bg-white px-4 py-3 border-b border-neutral-200"
                        >
                            <Text className="text-black">{item.description}</Text>
                        </TouchableOpacity>
                    )}
                    className="mt-2 max-h-60 rounded-xl bg-white"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
            )}
        </KeyboardAvoidingView>
    );
};

export default GoogleTextInput;
