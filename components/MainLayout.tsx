import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth, useUser } from '@clerk/clerk-expo';

const MainLayout = ({ isFontsLoaded }: { isFontsLoaded: boolean }) => {
    const { isLoaded: isAuthLoaded } = useAuth();
    const { isLoaded: isUserLoaded, user } = useUser();

    useEffect(() => {
        if (isFontsLoaded && isAuthLoaded && isUserLoaded) {
            SplashScreen.hideAsync();
        }
    }, [isFontsLoaded, isAuthLoaded, isUserLoaded]);

    if (!isFontsLoaded || !isAuthLoaded || !isUserLoaded) {
        return null; // or a loading screen
    }

    return <Stack screenOptions={{ headerShown: false }} />;
};

export default MainLayout;
