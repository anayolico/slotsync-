import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { colors } from '../theme/colors';

interface OtpInputProps {
  code: string;
  onChangeCode: (code: string) => void;
  onComplete?: (code: string) => void;
  isInvalid?: boolean;
}

export default function OtpInput({ 
  code, 
  onChangeCode, 
  onComplete,
  isInvalid = false 
}: OtpInputProps) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const digits = code.padEnd(6, ' ').slice(0, 6).split('');

  const handleChangeText = (text: string, index: number) => {
    // Handling paste of multiple digits
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      const newCode = cleaned.slice(0, 6);
      onChangeCode(newCode);
      const nextFocus = Math.min(newCode.length, 5);
      inputRefs.current[nextFocus]?.focus();
      if (newCode.length === 6 && onComplete) {
        onComplete(newCode);
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    const newCode = newDigits.join('').trimEnd();
    onChangeCode(newCode);

    if (cleaned.length > 0) {
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      if (newCode.length === 6 && onComplete) {
        onComplete(newCode);
      }
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (digits[index] === ' ' || !digits[index]) {
        if (index > 0) {
          const newDigits = [...digits];
          newDigits[index - 1] = '';
          onChangeCode(newDigits.join('').trimEnd());
          inputRefs.current[index - 1]?.focus();
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const val = digits[index] && digits[index] !== ' ' ? digits[index] : '';
        const isFilled = val.length > 0;
        const isCurrentActive = !isInvalid && (code.length === index || (code.length === 6 && index === 5));

        return (
          <View
            key={index}
            style={[
              styles.cellWrapper,
              isFilled && styles.cellFilled,
              isCurrentActive && styles.cellActive,
              isInvalid && styles.cellInvalid,
            ]}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.cellInput,
                isInvalid && styles.cellInputInvalid
              ]}
              keyboardType="number-pad"
              maxLength={index === 0 ? 6 : 1}
              value={val}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              selectTextOnFocus
              selectionColor={isInvalid ? '#ef4444' : colors.primary}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  cellWrapper: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cellFilled: {
    borderColor: '#818cf8',
    backgroundColor: '#f5f7ff',
  },
  cellActive: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  cellInvalid: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    shadowColor: '#ef4444',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cellInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  cellInputInvalid: {
    color: '#dc2626',
  },
});
