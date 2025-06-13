import { useUser } from "@clerk/clerk-expo";
import { Image, ScrollView, Text, View } from "react-native";
import InputField from "@/components/InputField";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-bgColor">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl text-primaryTextColor font-JakartaBold mt-5 mb-6">
          My Profile
        </Text>

        <View className="items-center justify-center mb-6">
          <Image
            source={{
              uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
            }}
            style={{ width: 110, height: 110, borderRadius: 55 }}
            className="border-[3px] border-primaryTextColor"
          />
        </View>

        <View className="bg-cardBgColor rounded-xl px-5 py-4">
          <InputField
            label="First name"
            placeholder={user?.firstName || "Not Found"}
            containerStyle="w-full mb-3"
            inputStyle="bg-cardBgColor text-primaryTextColor"
            editable={false}
          />

          <InputField
            label="Last name"
            placeholder={user?.lastName || "Not Found"}
            containerStyle="w-full mb-3"
            inputStyle="bg-cardBgColor text-primaryTextColor"
            editable={false}
          />

          <InputField
            label="Email"
            placeholder={user?.primaryEmailAddress?.emailAddress || "Not Found"}
            containerStyle="w-full mb-3"
            inputStyle="bg-cardBgColor text-primaryTextColor"
            editable={false}
          />

          <InputField
            label="Phone"
            placeholder={String(user?.publicMetadata.phone_number) || "Not Found"}
            containerStyle="w-full"
            inputStyle="bg-cardBgColor text-primaryTextColor"
            editable={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
