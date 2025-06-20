import { images } from "@/constants/data";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const Chat = () => {
  return (
    <SafeAreaView className="flex-1 p-5 bg-bgColor">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className="text-2xl text-primaryTextColor font-JakartaBold">Chat</Text>
        <View className="flex-1 h-fit flex justify-center items-center">
          <Image
            source={images.message}
            alt="message"
            className="w-full h-40"
            resizeMode="contain"
          />
          <Text className="text-3xl text-primaryTextColor font-JakartaBold mt-3">
            No Messages Yet
          </Text>
          <Text className="text-base text-secondaryTextColor mt-2 text-center px-7">
            Start a conversation with your friends and family
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>


  );
};

export default Chat;