import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { colors, radii, shadows, typography } from '../theme';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChangeText = (text: string, index: number) => {
    // Handle paste of multiple digits
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      const truncated = cleaned.slice(0, length);
      onChange(truncated);
      const nextFocus = Math.min(truncated.length, length - 1);
      inputsRef.current[nextFocus]?.focus();
      return;
    }

    // Single digit input
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    const combined = newDigits.join('').slice(0, length);
    onChange(combined);

    if (cleaned && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        const isFocused = focusedIndex === index;
        const hasValue = Boolean(digits[index]);

        return (
          <View
            key={index}
            style={[
              styles.boxWrapper,
              isFocused && styles.boxFocused,
              hasValue && styles.boxFilled,
            ]}
          >
            <TextInput
              ref={(ref) => (inputsRef.current[index] = ref)}
              value={digits[index]}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={index === 0 ? length : 1}
              editable={!disabled}
              selectTextOnFocus={true}
              style={styles.input}
              textAlign="center"
              accessibilityLabel={`OTP digit ${index + 1}`}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    width: '100%',
  },
  boxWrapper: {
    width: 48,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.inputBg,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glass,
  },
  boxFocused: {
    borderColor: colors.primaryAqua,
    backgroundColor: '#FFFFFF',
    ...shadows.glowAqua,
    transform: [{ scale: 1.05 }],
  },
  boxFilled: {
    borderColor: colors.primaryAquaDark,
  },
  input: {
    width: '100%',
    height: '100%',
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    color: colors.textNavy,
  },
});
