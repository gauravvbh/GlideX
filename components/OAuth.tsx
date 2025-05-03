import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Alert, Image, Text, View } from "react-native";
import CustomButton from "@/components/CustomButton";
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { icons } from "@/constants/data";
// import { googleOAuth } from "@/lib/auth";
import { useCallback, useEffect } from "react";


export const useWarmUpBrowser = () => {
    useEffect(() => {
        // Preloads the browser for Android devices to reduce authentication load time
        // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
        void WebBrowser.warmUpAsync()
        return () => {
            // Cleanup: closes browser when component unmounts
            void WebBrowser.coolDownAsync()
        }
    }, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()
WebBrowser.maybeCompleteAuthSession()

const OAuth = ({ role }: { role?: string }) => {
    useWarmUpBrowser()
    // const { setUser } = useUserStore();

    // Use the `useSSO()` hook to access the `startSSOFlow()` method
    const { startSSOFlow } = useSSO()

    const handleGoogleSignIn = useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await startSSOFlow({
                strategy: 'oauth_google',
                redirectUrl: AuthSession.makeRedirectUri({ scheme: 'myapp', path: '/(auth)/verify-phone' }),
            });

            if (setActive && createdSessionId) {
                await setActive({ session: createdSessionId });
                router.replace('/(auth)/verify-phone');
            } else {
                console.error("No session or setActive is undefined");
            }
        } catch (err) {
            console.error("❌ Google Sign-in Error:", err);
        }
    }, []);



    return (
        <View>
            <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
                <View className="flex-1 h-[1px] bg-general-100" />
                <View>
                    <Text className="text-lg text-white">Or</Text>
                </View>
                <View className="flex-1 h-[1px] bg-general-100" />
            </View>

            <CustomButton
                title="Log In with Google"
                className="mt-5 w-full shadow-none"
                IconLeft={() => (
                    <Image
                        source={icons.google}
                        resizeMode="contain"
                        className="w-5 h-5 mx-2"
                    />
                )}
                bgVariant="outline"
                textVariant="primary"
                onPress={handleGoogleSignIn}
            />
        </View>
    );
};

export default OAuth;