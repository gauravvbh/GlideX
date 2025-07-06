import { View, Text, KeyboardAvoidingView, TouchableWithoutFeedback, Image, TextInput, Keyboard, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { InputFieldProps } from '@/types/type'
import { Feather, Ionicons } from '@expo/vector-icons';

const InputField = ({
    label,
    labelStyle,
    icon,
    secureTextEntry = false,
    containerStyle,
    inputStyle,
    iconStyle,
    className,
    ...props
}: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [dontShowPassword, setDontShowPassword] = useState(secureTextEntry)

    return (
        <KeyboardAvoidingView behavior="height">
            <View className='my-2 w-full'>
                <Text className={`text-base text-white font-JakartaSemiBold mb-3 ${labelStyle}`}>
                    {label}
                </Text>
                <View className={`flex flex-row items-center bg-neutral-950 rounded-full border ${isFocused ? 'border-primary-500' : 'border-slate-950'} ${containerStyle}`}>
                    {icon && <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />}
                    {label === 'Phone Number' && (
                        <Feather name="phone" size={16} color="gray" style={{ marginLeft: 16 }} />
                    )}
                    <TextInput
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={`text-white rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle}`}
                        secureTextEntry={dontShowPassword}
                        placeholderTextColor="#888"
                        {...props}
                    />

                    {label === 'Password' && (
                        <TouchableOpacity onPress={() => setDontShowPassword(!dontShowPassword)}>
                            {
                                dontShowPassword ? (
                                    <Ionicons name="eye-off" size={20} color="gray" style={{ marginRight: 16 }} />
                                ) : (
                                    <Ionicons name="eye" size={20} color="gray" style={{ marginRight: 16 }} />
                                )
                            }
                        </TouchableOpacity>
                    )
                    }
                </View>
            </View>
        </KeyboardAvoidingView >
    )
}

export default InputField
