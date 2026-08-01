import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

export const LoginScreen = () => {
  const { login, settings } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top + 20 : 28;

  const [pin, setPin] = useState<string>('');

  const handleKeyPress = useCallback(
    (digit: string) => {
      if (pin.length < 4) {
        const nextPin = pin + digit;
        setPin(nextPin);
        if (nextPin.length === 4) {
          // Auto unlock after 4 digits
          setTimeout(() => {
            login();
          }, 150);
        }
      }
    },
    [pin, login]
  );

  const handleDelete = useCallback(() => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  }, [pin]);

  const handleBiometricAuth = useCallback(() => {
    Alert.alert(
      'Biometric Authentication',
      `Unlocking ${settings.businessName} via Fingerprint / Face ID...`,
      [
        {
          text: 'Unlock',
          onPress: () => login(),
        },
      ]
    );
  }, [settings.businessName, login]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPadding, paddingBottom: Math.max(insets.bottom, 20) },
      ]}
    >
      <View style={styles.content}>
        {/* Brand Icon & Name */}
        <View style={styles.brandBox}>
          <View style={styles.logoCircle}>
            <Ionicons name="wallet" size={40} color={COLORS.green} />
          </View>
          <Text style={styles.appName}>{settings.businessName || 'IVAN A.K.A Electronics'}</Text>
          <Text style={styles.appTagline}>
            Enter 4-digit Application PIN or use Biometrics to unlock
          </Text>
        </View>

        {/* PIN Indicator Dots */}
        <View style={styles.pinIndicatorRow}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <View
                key={idx}
                style={[
                  styles.pinDot,
                  isFilled && styles.pinDotFilled,
                ]}
              />
            );
          })}
        </View>

        {/* 3x4 Numeric Keypad */}
        <View style={styles.keypadGrid}>
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((num) => (
                <Pressable
                  key={num}
                  style={({ pressed }) => [
                    styles.keyBtn,
                    pressed && styles.keyBtnPressed,
                  ]}
                  onPress={() => handleKeyPress(num)}
                  accessibilityRole="button"
                  accessibilityLabel={`Keypad digit ${num}`}
                >
                  <Text style={styles.keyText}>{num}</Text>
                </Pressable>
              ))}
            </View>
          ))}

          {/* Bottom Keypad Row: Biometric, 0, Backspace */}
          <View style={styles.keypadRow}>
            <Pressable
              style={({ pressed }) => [
                styles.keyBtn,
                styles.iconKeyBtn,
                pressed && styles.keyBtnPressed,
              ]}
              onPress={handleBiometricAuth}
              accessibilityRole="button"
              accessibilityLabel="Unlock with Fingerprint or Face ID"
              accessibilityHint="Triggers device biometric security unlock"
            >
              <Ionicons name="finger-print-outline" size={28} color={COLORS.green} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.keyBtn,
                pressed && styles.keyBtnPressed,
              ]}
              onPress={() => handleKeyPress('0')}
              accessibilityRole="button"
              accessibilityLabel="Keypad digit 0"
            >
              <Text style={styles.keyText}>0</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.keyBtn,
                styles.iconKeyBtn,
                pressed && styles.keyBtnPressed,
              ]}
              onPress={handleDelete}
              accessibilityRole="button"
              accessibilityLabel="Backspace digit"
            >
              <Ionicons name="backspace-outline" size={24} color={COLORS.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Quick Direct Unlock Option */}
        <Pressable
          style={({ pressed }) => [
            styles.quickUnlockBtn,
            pressed && styles.quickUnlockPressed,
          ]}
          onPress={login}
          accessibilityRole="button"
          accessibilityLabel="Quick unlock app"
        >
          <Ionicons name="lock-open-outline" size={18} color={COLORS.green} />
          <Text style={styles.quickUnlockText}>Quick Unlock</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: COLORS.green,
    ...SHADOWS.small,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  appTagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  pinIndicatorRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.divider,
  },
  pinDotFilled: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  keypadGrid: {
    gap: 14,
    marginBottom: 24,
    width: '100%',
    maxWidth: 280,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.small,
  },
  iconKeyBtn: {
    backgroundColor: COLORS.card,
  },
  keyBtnPressed: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
    transform: [{ scale: 0.95 }],
  },
  keyText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  quickUnlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.greenBg,
  },
  quickUnlockPressed: {
    opacity: 0.7,
  },
  quickUnlockText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.green,
  },
});
