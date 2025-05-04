import { useClerk, useUser } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { icons, images } from '@/constants/data';
import RideCard from '@/components/RideCard';
import GoogleTextInput from '@/components/GoogleTextInput';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useCustomer, useRidesStore, useUserStore, useWSStore } from '@/store';
import Map from '@/components/Map';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.serverUrl;

const HomePage = () => {
  const {
    setUserLocation: setCustomerLocation,
    setDestinationLocation,
    setId: setCustomerId,
    setRole: setCustomerRole,
    setFullName: setCustomerFullName,
    setProfileImageURL: setCustomerProfileImageURL,
  } = useCustomer();

  const { setRides, Rides = [] } = useRidesStore(); // Default to empty array
  const { ws, setWebSocket } = useWSStore();

  const { user } = useUser();
  const { role } = useUserStore();
  const data = user?.publicMetadata;
  const { signOut } = useClerk();

  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');

  // WebSocket setup
  useEffect(() => {
    let newWs: WebSocket;

    if (!ws && user) {
      newWs = new WebSocket('wss://websocket-server-for-glidex.onrender.com');

      newWs.onopen = () => {
        newWs.send(
          JSON.stringify({
            type: 'register',
            id: user?.id,
            role: 'customer',
          })
        );
        console.log('WebSocket connected');
      };

      newWs.onerror = () => {
        console.log('An error occurred while connecting to the server.');
      };

      newWs.onclose = () => {
        console.log('WebSocket closed');
      };

      setWebSocket(newWs);
    }
  }, [user]);

  // Location permissions + setting user data
  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermissions(false);
        return;
      }
      setHasPermissions(true);

      const location = await Location.getCurrentPositionAsync();
      const addressInfo = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const formattedAddress = addressInfo[0]?.formattedAddress ?? '';
      setAddress(formattedAddress);

      if ((role ?? data?.role) === 'customer') {
        setCustomerLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: formattedAddress,
        });

        if (role) setCustomerRole({ role });
        if (user) {
          setCustomerId({ customerId: user.id });
          setCustomerFullName({ full_name: user.fullName ?? '' });
          setCustomerProfileImageURL({ profile_image_url: user.imageUrl });
        }
      }
    };

    if (user) requestLocation();
  }, [user]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Set destination from Google input
  const handleDestinationPress = (location: { latitude: number; longitude: number; address: string }) => {
    setDestinationLocation(location);
    router.push('/(main)/find-ride');
  };

  // Fetch all rides
  useEffect(() => {
    if (!user?.id) return;

    const getAllRides = async () => {
      setLoading(true);
      try {
        const url = `${API_URL}/(api)/ride/get-all?clerk_id=${user.id}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();

        setRides(Array.isArray(data) ? data : []); // Ensure it's an array
      } catch (error) {
        console.log('Error fetching rides:', error);
        setRides([]); // Fallback
      } finally {
        setLoading(false);
      }
    };

    getAllRides();
  }, [user?.id]);

  return (
    <SafeAreaView className="bg-gray-500 text-white flex-1">
      <FlatList
        data={(Rides ?? []).slice(0, 3)}
        renderItem={({ item }) => <RideCard ride={item} />}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image source={images.noResult} className="w-40 h-40" resizeMode="contain" />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <Text>Loading...</Text>
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-xl capitalize font-JakartaExtraBold">
                Welcome{','} {user?.firstName} 👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="flex justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            {/* Google Location Search */}
            {(() => {
              try {
                return (
                  <GoogleTextInput
                    containerStyle="bg-white shadow-md shadow-neutral-300"
                    handlePress={handleDestinationPress}
                  />
                );
              } catch (e) {
                console.error('🔥 Error in GoogleTextInput:', e);
                return <Text>Error loading input</Text>;
              }
            })()}

            {/* Current Location */}
            <Text className="text-xl font-JakartaBold mt-5">Your Current Location:</Text>
            {address && (
              <Text className="text-lg font-Jakarta text-gray-700 mb-3">{address}</Text>
            )}

            {/* Map View */}
            <View className="w-full" style={{ height: 300, borderRadius: 16, overflow: 'hidden' }}>
              <Map />
            </View>

            <Text className="text-xl font-JakartaBold mt-5 mb-3">Recent Rides</Text>
          </>
        )}
      />
    </SafeAreaView>
  );
};

export default HomePage;
