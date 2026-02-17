import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Fonts from '@/constants/fonts';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  icon,
}: ButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    if (disabled) {
      return { backgroundColor: colors.border };
    }
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return colors.textSecondary;
    }
    switch (variant) {
      case 'primary':
        return '#231e0f'; // background-dark from design
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.textSecondary;
      default:
        return '#231e0f';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
          {icon}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: Fonts.lexend.bold,
  },
});
