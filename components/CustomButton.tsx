import { ButtonProps } from '@/types/type';
import { Text, TouchableOpacity } from 'react-native';

const getBgVariantStyle = (variant: ButtonProps['bgVariant']) => {
    switch (variant) {
        case "secondary":
            return 'bg-[#1E1E22] shadow-lg shadow-[#0286FF]/40 border border-[#0286FF]/60'; // Dark but glowing effect
        case "danger":
            return 'bg-[#DC2626] shadow-md shadow-red-500/40 border border-red-500/60';
        case "success":
            return 'bg-[#16A34A] shadow-md shadow-green-500/40 border border-green-500/60';
        case "outline":
            return 'bg-transparent border border-[#0286FF]/50';
        default:
            return 'bg-[#0286FF] shadow-xl shadow-[#0286FF]/50'; // Bright blue glow
    }
};


const getTextVariantStyle = (variant: ButtonProps['textVariant']) => {
    switch (variant) {
        case "primary":
            return 'text-white';
        case "secondary":
            return 'text-[#F0F0F0]'; // Soft white glow
        case "success":
            return 'text-[#BBF7D0]';
        case "danger":
            return 'text-[#FCA5A5]';
        default:
            return 'text-white';
    }
};


const CustomButton = ({
    onPress,
    disabled,
    title,
    bgVariant = "primary",
    textVariant = "primary",
    IconLeft,
    IconRight,
    className,
    ...props
}: ButtonProps) =>
    <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        className={`rounded-full p-4 flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 ${getBgVariantStyle(bgVariant)} ${className}  ${disabled ? 'opacity-50' : 'shadow-md shadow-neutral-400/70'} `}
        {...props}
    >
        {IconLeft && <IconLeft />}
        <Text className={`text-white text-lg font-bold ${getTextVariantStyle(textVariant)}`}>{title}</Text>
        {IconRight && <IconRight />}
    </TouchableOpacity>

export default CustomButton;
