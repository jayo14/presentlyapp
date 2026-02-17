import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Eye, EyeOff } from 'lucide-react-native';
import Fonts from '@/constants/fonts';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  editable?: boolean;
  icon?: React.ReactNode;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  editable = true,
  icon,
}: InputProps) {
  const { colors } = useTheme();
  const [isSecure, setIsSecure] = useState<boolean>(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {icon && <View style={styles.leftIcon}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              color: colors.text,
              borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
              paddingLeft: icon ? 48 : 16,
              paddingRight: secureTextEntry ? 48 : 16,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsSecure(!isSecure)}
            activeOpacity={0.7}
          >
            {isSecure ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: Fonts.lexend.medium,
    marginBottom: 2,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    height: 56,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: Fonts.lexend.regular,
    borderWidth: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
  },
  error: {
    fontSize: 13,
    fontFamily: Fonts.lexend.regular,
    marginTop: 4,
  },
});
