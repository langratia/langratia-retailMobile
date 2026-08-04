import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

export const LoginScreen = () => {
  const { login, settings } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top + 16 : 24;

  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [correctPin, setCorrectPin] = useState<string>('1234');
  const [isBiometricMode, setIsBiometricMode] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  const playSuccessAnimation = useCallback(() => {
    setIsSuccess(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setTimeout(() => {
        login();
      }, 400); // Small delay after animation finishes before navigating
    });
  }, [login, scaleAnim, rotateAnim]);

  React.useEffect(() => {
    const loadPinAndBiometric = async () => {
      try {
        const storedPin = await SecureStore.getItemAsync('SECURITY_PIN');
        if (storedPin) {
          setCorrectPin(storedPin);
        }
      } catch (error) {
        console.error('Failed to load secure PIN', error);
      }
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        setIsBiometricMode(true);
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Unlock ${settings.businessName || 'IVAN A.K.A Electronics'}`,
          fallbackLabel: 'Use PIN',
          disableDeviceFallback: false,
        });
        if (result.success) {
          playSuccessAnimation();
        }
      } else {
        setIsBiometricMode(false);
      }
    };
    loadPinAndBiometric();
  }, [settings.businessName, login]);

  const handleKeyPress = useCallback(
    (digit: string) => {
      setErrorMessage('');
      if (pin.length < 4) {
        const nextPin = pin + digit;
        setPin(nextPin);
        if (nextPin.length === 4) {
          if (nextPin === correctPin) {
            setTimeout(() => {
              setPin('');
              playSuccessAnimation();
            }, 150);
          } else {
            setTimeout(() => {
              setErrorMessage('Incorrect Security PIN! Please try again.');
              Alert.alert(
                'Access Denied',
                'Incorrect 4-digit Security PIN. Default PIN is 1234.'
              );
              setPin('');
            }, 150);
          }
        }
      }
    },
    [pin, correctPin, login]
  );

  const handleDelete = useCallback(() => {
    setErrorMessage('');
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  }, [pin]);

  const handleManualLogin = useCallback(() => {
    if (pin === correctPin) {
      setPin('');
      playSuccessAnimation();
    } else {
      setErrorMessage('Incorrect Security PIN! Default PIN is 1234.');
      Alert.alert(
        'Access Denied',
        'Please enter the correct 4-digit Security PIN (Default: 1234).'
      );
      setPin('');
    }
  }, [pin, correctPin, login]);

  const handleBiometricAuth = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return; // Do nothing silently if user manually triggers and no hardware
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Unlock ${settings.businessName || 'IVAN A.K.A Electronics'}`,
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: false,
    });

    if (result.success) {
      playSuccessAnimation();
    }
  }, [settings.businessName, playSuccessAnimation]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPadding, paddingBottom: Math.max(insets.bottom, 20) },
      ]}
    >
      {isSuccess ? (
        <View style={styles.successContainer}>
          <Animated.View style={{
            transform: [
              { scale: scaleAnim },
              { rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['-120deg', '0deg'] }) }
            ]
          }}>
            <Ionicons name="checkmark-circle" size={120} color={COLORS.green} />
          </Animated.View>
          <Animated.Text style={[styles.successText, { opacity: rotateAnim }]}>
            Access Granted
          </Animated.Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
        {/* Brand Logo & Splash Banner */}
        <View style={styles.brandBox}>
          {/* Custom Luxury Monogram Brand Emblem for IVAN ELECTRONICS */}
          <View style={styles.logoOuterGlow}>
            <View style={styles.logoShieldFrame}>
              <View style={styles.logoBadgeInner}>
                <View style={styles.monogramRow}>
                  <Text style={styles.monogramLetterI}>I</Text>
                  <Text style={styles.monogramLetterE}>E</Text>
                </View>
                <View style={styles.logoPowerCrown}>
                  <Ionicons name="flash" size={12} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>

          {/* Electronics Category Icons Strip */}
          <View style={styles.techIconsRow}>
            <View style={styles.techPill}>
              <Ionicons name="phone-portrait-outline" size={14} color={COLORS.green} />
              <Text style={styles.techPillText}>Smartphones</Text>
            </View>
            <View style={styles.techPill}>
              <Ionicons name="headset-outline" size={14} color={COLORS.green} />
              <Text style={styles.techPillText}>Audio</Text>
            </View>
            <View style={styles.techPill}>
              <Ionicons name="laptop-outline" size={14} color={COLORS.green} />
              <Text style={styles.techPillText}>Electronics</Text>
            </View>
          </View>

          <Text style={styles.appName}>
            {settings.businessName || 'IVAN A.K.A Electronics'}
          </Text>
          <Text style={styles.appSubTitle}>RETAIL & ELECTRONICS MANAGEMENT SYSTEM</Text>

          <View style={styles.dividerLine} />

          <Text style={styles.appTagline}>
            {isBiometricMode
              ? 'App is locked. Touch the fingerprint sensor to open.'
              : 'Enter 4-digit PIN to open application'}
          </Text>
        </View>

        {isBiometricMode === true ? (
          <View style={styles.biometricContainer}>
            <Ionicons name="lock-closed" size={48} color={COLORS.green} style={{ marginBottom: 16 }} />
            <Text style={styles.biometricTitle}>App Locked</Text>
            
            <Pressable
              style={({ pressed }) => [
                styles.quickUnlockBtn,
                { marginTop: 24, width: 220 },
                pressed && styles.quickUnlockPressed,
              ]}
              onPress={handleBiometricAuth}
            >
              <Ionicons name="finger-print" size={20} color="#FFFFFF" />
              <Text style={styles.quickUnlockText}>UNLOCK</Text>
            </Pressable>

            <Pressable
              style={{ marginTop: 24, padding: 12 }}
              onPress={() => setIsBiometricMode(false)}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' }}>
                Use App PIN Instead
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Error Message Feedback */}
            {errorMessage !== '' && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={COLORS.red} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

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
                      errorMessage !== '' && styles.pinDotError,
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

              {/* Bottom Keypad Row: Empty, 0, Backspace */}
              <View style={styles.keypadRow}>
                <View style={[styles.keyBtn, { borderWidth: 0, backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 }]} />

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

            {/* Validate Security PIN Button */}
            <Pressable
              style={({ pressed }) => [
                styles.quickUnlockBtn,
                pressed && styles.quickUnlockPressed,
              ]}
              onPress={handleManualLogin}
              accessibilityRole="button"
              accessibilityLabel="Validate 4-digit PIN and open application"
            >
              <Ionicons name="lock-open-outline" size={20} color="#FFFFFF" />
              <Text style={styles.quickUnlockText}>ENTER APPLICATION</Text>
            </Pressable>
          </>
        )}
        </ScrollView>
      )}
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
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    ...SHADOWS.medium,
  },
  logoShieldFrame: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.green,
    transform: [{ rotate: '45deg' }],
  },
  logoBadgeInner: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    position: 'relative',
    ...SHADOWS.small,
  },
  monogramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramLetterI: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.green,
    letterSpacing: -1,
  },
  monogramLetterE: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginLeft: 1,
    letterSpacing: -1,
  },
  logoPowerCrown: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.green,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
    ...SHADOWS.small,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.redBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.red,
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
  pinDotError: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
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
  biometricContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  biometricTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.green,
    letterSpacing: 0.5,
  },
});
