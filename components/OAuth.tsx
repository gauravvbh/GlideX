import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { ActivityIndicator, Alert, Image, Text, View } from "react-native";
import CustomButton from "@/components/CustomButton";
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { icons } from "@/constants/data";
// import { googleOAuth } from "@/lib/auth";
import { useCallback, useEffect, useState } from "react";


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

const OAuth = () => {
    useWarmUpBrowser()
    // const { setUser } = useUserStore();

    // Use the `useSSO()` hook to access the `startSSOFlow()` method
    const { startSSOFlow } = useSSO()

    const [loading, setLoading] = useState<boolean>(false)

    const handleGoogleSignIn = useCallback(async () => {
        setLoading(true)
        try {
            const redirectUri = AuthSession.makeRedirectUri({
                scheme: 'myapp',
                path: '/(auth)/complete-sign-up'
            });


            // Start the authentication process by calling `startSSOFlow()`
            const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
                strategy: 'oauth_google',
                redirectUrl: redirectUri
            });

            if (createdSessionId) {
                setActive!({ session: createdSessionId })
            } else {
                // If there is no `createdSessionId`,
                // there are missing requirements, such as MFA
                // Use the `signIn` or `signUp` returned from `startSSOFlow`
                // to handle next steps
                console.error("No session or setActive is undefined");
            }
        } catch (err) {
            console.error("❌ Google Sign-in Error:", err);
        } finally {
            setLoading(false)
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
                title={`${loading ? 'Loading' : 'Sign in with Google'}`}
                className={`mt-5 w-full shadow-none ${loading && 'opacity-60'}`}
                disabled={loading}
                IconLeft={() => (
                    loading ? (
                        <ActivityIndicator size='small' color='white' className="w-5 h-5 mx-2" />
                    ) : (
                        <Image
                            source={icons.google}
                            resizeMode="contain"
                            className="w-5 h-5 mx-2"
                        />
                    )
                    //ActivityIndicator size small color black
                )}
                bgVariant="outline"
                textVariant="primary"
                onPress={handleGoogleSignIn}
            />
        </View>
    );
};

export default OAuth;