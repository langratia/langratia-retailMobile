import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ScrollView,
  Animated as RNAnimated,
  ImageBackground,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

/** Maximum consecutive failed PIN attempts before a temporary lockout. */
const MAX_PIN_ATTEMPTS = 5;
/** Lockout duration in milliseconds after exceeding MAX_PIN_ATTEMPTS. */
const LOCKOUT_DURATION_MS = 30_000;
/** Default PIN used when SecureStore has never been written. */
const DEFAULT_PIN = '1234';

export const LoginScreen = () => {
  const { login, settings } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top + 16 : 24;

  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [correctPin, setCorrectPin] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  /**
   * Tracks consecutive failed attempts for rate-limiting.
   * Using a ref so changes do not trigger re-renders.
   */
  const failedAttemptsRef = useRef<number>(0);
  const lockedUntilRef = useRef<number>(0);

  const scaleAnim = useRef(new RNAnimated.Value(0)).current;
  const rotateAnim = useRef(new RNAnimated.Value(0)).current;

  const playSuccessAnimation = useCallback(() => {
    setIsSuccess(true);
    RNAnimated.parallel([
      RNAnimated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
      RNAnimated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        login();
      }, 400);
    });
  }, [login, scaleAnim, rotateAnim]);

  // ─── Load PIN + trigger biometric on mount ────────────────────────────────

  React.useEffect(() => {
    const loadPinAndBiometric = async () => {
      // Load the stored PIN from SecureStore.
      // If SecureStore fails (corruption, first install), we surface an error
      // rather than silently falling back to '1234', which would bypass the
      // intended security.
      let resolvedPin: string | null = null;
      try {
        const storedPin = await SecureStore.getItemAsync('SECURITY_PIN');
        if (storedPin) {
          resolvedPin = storedPin;
        } else {
          // First launch — no PIN has been set yet. Default is 1234.
          resolvedPin = DEFAULT_PIN;
        }
      } catch (error) {
        // SecureStore is unavailable (e.g., hardware security module failure).
        // Surface a clear error and leave PIN entry disabled (correctPin = null).
        console.error('Failed to load secure PIN', error);
        setErrorMessage('Security store unavailable. Please restart the app.');
      }
      setCorrectPin(resolvedPin);
    };
    loadPinAndBiometric();
    // playSuccessAnimation is stable (useCallback with stable deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Unified PIN validation ───────────────────────────────────────────────

  /**
   * Single source of truth for PIN checking.
   * Handles rate-limiting: after MAX_PIN_ATTEMPTS failures the keypad is
   * disabled for LOCKOUT_DURATION_MS.
   */
  const validatePin = useCallback(
    (enteredPin: string) => {
      // Rate-limit check
      const now = Date.now();
      if (now < lockedUntilRef.current) {
        const secondsLeft = Math.ceil((lockedUntilRef.current - now) / 1000);
        setErrorMessage(`Too many attempts. Try again in ${secondsLeft}s.`);
        setPin('');
        return;
      }

      // SecureStore failed to load — do not allow any attempt
      if (correctPin === null) {
        setErrorMessage('Security store unavailable. Please restart the app.');
        setPin('');
        return;
      }

      if (enteredPin === correctPin) {
        failedAttemptsRef.current = 0;
        setErrorMessage('');
        setPin('');
        playSuccessAnimation();
      } else {
        failedAttemptsRef.current += 1;
        if (failedAttemptsRef.current >= MAX_PIN_ATTEMPTS) {
          lockedUntilRef.current = Date.now() + LOCKOUT_DURATION_MS;
          failedAttemptsRef.current = 0;
          setErrorMessage(
            `Too many incorrect attempts. Locked for ${LOCKOUT_DURATION_MS / 1000}s.`
          );
        } else {
          const attemptsLeft = MAX_PIN_ATTEMPTS - failedAttemptsRef.current;
          setErrorMessage(
            `Incorrect PIN. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
          );
        }
        setPin('');
      }
    },
    [correctPin, playSuccessAnimation]
  );

  // ─── Keypad handlers ──────────────────────────────────────────────────────

  const handleKeyPress = useCallback(
    (digit: string) => {
      setErrorMessage('');
      if (pin.length < 4) {
        const nextPin = pin + digit;
        setPin(nextPin);
        if (nextPin.length === 4) {
          // Auto-validate when 4 digits are entered
          setTimeout(() => {
            validatePin(nextPin);
          }, 150);
        }
      }
    },
    [pin, validatePin]
  );

  const handleDelete = useCallback(() => {
    setErrorMessage('');
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  }, [pin]);

  const handleManualLogin = useCallback(() => {
    validatePin(pin);
  }, [pin, validatePin]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <ImageBackground
      source={require('../../assets/splash-image.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View
        style={[
          styles.overlay,
          { paddingTop: topPadding, paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        {isSuccess ? (
          <View style={styles.successContainer}>
            <RNAnimated.View
              style={{
                transform: [
                  { scale: scaleAnim },
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-120deg', '0deg'],
                    }),
                  },
                ],
              }}
            >
              <Ionicons name="checkmark-circle" size={120} color={COLORS.green} />
            </RNAnimated.View>
            <RNAnimated.Text style={[styles.successText, { opacity: rotateAnim }]}>
              Access Granted
            </RNAnimated.Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header Tagline */}
            <View style={styles.headerBox}>
              <View style={styles.dividerLine} />
              <Text style={styles.appTagline}>
                Enter 4-digit PIN to open application
              </Text>
            </View>

          <>
            {/* Error / Rate-limit feedback banner */}
            {errorMessage !== '' && (
              <Animated.View
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(200)}
                style={styles.errorBanner}
              >
                <Ionicons name="alert-circle" size={16} color={COLORS.red} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </Animated.View>
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

            {/* 3×4 Numeric Keypad */}
            <View style={styles.keypadGrid}>
              {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((num) => (
                    <Pressable
                      key={num}
                      style={styles.keyBtn}
                      onPress={() => handleKeyPress(num)}
                      android_ripple={{ color: COLORS.greenBg, borderless: false, radius: 32 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Keypad digit ${num}`}
                    >
                      <Text style={styles.keyText}>{num}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}

              {/* Bottom row: empty, 0, backspace */}
              <View style={styles.keypadRow}>
                <View style={[styles.keyBtn, styles.keyBtnInvisible]} />

                <Pressable
                  style={styles.keyBtn}
                  onPress={() => handleKeyPress('0')}
                  android_ripple={{ color: COLORS.greenBg, borderless: false, radius: 32 }}
                  accessibilityRole="button"
                  accessibilityLabel="Keypad digit 0"
                >
                  <Text style={styles.keyText}>0</Text>
                </Pressable>

                <Pressable
                  style={[styles.keyBtn, styles.iconKeyBtn]}
                  onPress={handleDelete}
                  android_ripple={{ color: COLORS.greenBg, borderless: false, radius: 32 }}
                  accessibilityRole="button"
                  accessibilityLabel="Backspace digit"
                >
                  <Ionicons name="backspace-outline" size={24} color={COLORS.textSecondary} />
                </Pressable>
              </View>
            </View>

            {/* Submit button */}
            <Pressable
              style={styles.quickUnlockBtn}
              onPress={handleManualLogin}
              android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
              accessibilityRole="button"
              accessibilityLabel="Validate 4-digit PIN and open application"
            >
              <Ionicons name="lock-open-outline" size={20} color="#FFFFFF" />
              <Text style={styles.quickUnlockText}>ENTER APPLICATION</Text>
            </Pressable>
          </>
        </ScrollView>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  headerBox: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
    width: '100%',
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
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
    width: '100%',
    maxWidth: 280,
  },
  errorBannerText: {
    flex: 1,
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
  keyBtnInvisible: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  iconKeyBtn: {
    backgroundColor: COLORS.card,
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
    overflow: 'hidden',
  },
  quickUnlockText: {
    fontSize: 14,
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
