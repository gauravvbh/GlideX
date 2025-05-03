import { Redirect, router } from 'expo-router';
import { useAuth, useClerk, useUser } from '@clerk/clerk-expo';
import { Text, View } from 'react-native';
import CustomButton from '@/components/CustomButton';

const Page = () => {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const role = user?.publicMetadata?.role;
    const { signOut } = useClerk();

    const handleSignOut = async () => {
        try {
            await signOut()
            router.replace('/(auth)/sign-in')
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }
    const handleGoHome = async () => {
        try {
            router.replace('/(main)/(customer)/(tabs)/home')
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!isSignedIn) {
        return <Redirect href="/(auth)/welcome" />;
    }

    if (role === 'customer') {
        return <Redirect href="/(main)/(customer)/(tabs)/home" />;
    }

    if (role === 'rider') {
        return <Redirect href="/(main)/(rider)/home" />;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text className='text-white'>Some error occured logout and relogin again</Text>
            <CustomButton
                title='Log Out'
                className='w-1/3 mt-5'
                onPress={handleSignOut}
            />
        </View>
    );
};

export default Page;
