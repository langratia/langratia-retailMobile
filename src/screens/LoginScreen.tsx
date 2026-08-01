import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

export const LoginScreen = () => {
  const { login, settings } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top + 16 : 24;

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
      'Biometric Unlock',
      `Unlocking ${settings.businessName || 'IVAN A.K.A Electronics'} via Fingerprint / Face ID...`,
      [
        {
          text: 'Unlock App',
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Splash Header Badge */}
        <View style={styles.splashHeaderBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.splashBadgeText}>CLIENT EDITION • 100% OFFLINE</Text>
        </View>

        {/* Brand Logo & Splash Banner */}
        <View style={styles.brandBox}>
          {/* Custom Brand Logo emblem */}
          <View style={styles.logoOuterGlow}>
            <View style={styles.logoMiddleRing}>
              <View style={styles.logoInnerCircle}>
                <Ionicons name="hardware-chip-outline" size={42} color={COLORS.green} />
                <View style={styles.logoMiniIcon}>
                  <Ionicons name="flash" size={14} color="#FFF" />
                </View>
              </View>
            </View>
          </View>

          {/* Electronics Category Icons Strip */}
          <View style={styles.techIconsRow}>
            <View style={styles.techPill}>
              <Ionicons name="phone-portrait-outline" size={14} color={COLORS.green} />
              <Text style={styles.techPillText}>Phones</Text>
            </View>
            <View style={styles.techPill}>
              <Ionicons name="headset-outline" size={14} color={COLORS.green} />
              <Text style={styles.techPillText}>Audio</Text>
            </View>
            <View style={styles.techPill}>
              <Ionicons name="laptop-outline" size={14} color={COLORS.green} />
              <Text style={styles.techPillText}>Gadgets</Text>
            </View>
          </View>

          <Text style={styles.appName}>
            {settings.businessName || 'IVAN A.K.A Electronics'}
          </Text>
          <Text style={styles.appSubTitle}>RETAIL & ELECTRONICS MANAGEMENT SYSTEM</Text>

          <View style={styles.dividerLine} />

          <Text style={styles.appTagline}>
            Enter 4-digit PIN or use Biometrics to open application
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

        {/* Direct Unlock Button */}
        <Pressable
          style={({ pressed }) => [
            styles.quickUnlockBtn,
            pressed && styles.quickUnlockPressed,
          ]}
          onPress={login}
          accessibilityRole="button"
          accessibilityLabel="Open Application Now"
        >
          <Ionicons name="power-outline" size={20} color="#FFFFFF" />
          <Text style={styles.quickUnlockText}>ENTER APPLICATION</Text>
        </Pressable>

        {/* System Footer */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            Powered by IVAN A.K.A Electronics POS • Client Edition
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  splashHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  splashBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.green,
    letterSpacing: 0.5,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  logoOuterGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  logoMiddleRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.green,
    ...SHADOWS.medium,
  },
  logoInnerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoMiniIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.green,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  techIconsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  techPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  techPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  appSubTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.green,
    letterSpacing: 1.2,
    marginBottom: 12,
    textAlign: 'center',
  },
  dividerLine: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.green,
    borderRadius: 2,
    marginBottom: 12,
  },
  appTagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pinIndicatorRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
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
    transform: [{ scale: 1.1 }],
  },
  keypadGrid: {
    gap: 12,
    marginBottom: 20,
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
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 280,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.green,
    ...SHADOWS.medium,
  },
  quickUnlockPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  quickUnlockText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  footerInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
