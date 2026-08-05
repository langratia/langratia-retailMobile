import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Animated as RNAnimated,
  ImageBackground,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

/** Maximum consecutive failed PIN attempts before a temporary lockout. */
const MAX_PIN_ATTEMPTS = 5;
/** Lockout duration in milliseconds after exceeding MAX_PIN_ATTEMPTS. */
const LOCKOUT_DURATION_MS = 30_000;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Keypad occupies ~80% of the screen width, split across 3 columns with gaps
const KEYPAD_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 300);
const KEY_GAP = 14;
const KEY_SIZE = Math.floor((KEYPAD_WIDTH - KEY_GAP * 2) / 3);

export const LoginScreen = () => {
  const { login, settings } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 24;

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

  // ─── Load PIN on mount ────────────────────────────────────────────────────

  React.useEffect(() => {
    const loadPin = async () => {
      try {
        const storedPin = await SecureStore.getItemAsync('SECURITY_PIN');
        // AppNavigator guarantees a PIN exists before showing this screen.
        // If it's somehow missing, show an error rather than crashing.
        setCorrectPin(storedPin ?? null);
        if (!storedPin) {
          setErrorMessage('No PIN configured. Please contact support.');
        }
      } catch (error) {
        console.error('Failed to load secure PIN', error);
        setErrorMessage('Security store unavailable. Please restart the app.');
      }
    };
    loadPin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Unified PIN validation ───────────────────────────────────────────────

  const validatePin = useCallback(
    (enteredPin: string) => {
      const now = Date.now();
      if (now < lockedUntilRef.current) {
        const secondsLeft = Math.ceil((lockedUntilRef.current - now) / 1000);
        setErrorMessage(`Too many attempts. Try again in ${secondsLeft}s.`);
        setPin('');
        return;
      }

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

  // Don't render until PIN is loaded
  if (correctPin === null && !errorMessage) return null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <ImageBackground
      source={require('../../assets/ivanBanner.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Subtle gradient scrim — light enough that the Ivan A.K.A branding remains visible */}
      <View style={[styles.overlay, { paddingTop: topPadding, paddingBottom: Math.max(insets.bottom, 24) }]}>

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
              <Ionicons name="checkmark-circle" size={110} color={COLORS.green} />
            </RNAnimated.View>
            <RNAnimated.Text style={[styles.successText, { opacity: rotateAnim }]}>
              Access Granted
            </RNAnimated.Text>
          </View>
        ) : (
          <View style={styles.content}>

            {/* ── Branded header card ─────────────────────────────────────── */}
            <View style={styles.brandCard}>
              <Text style={styles.poweredBy}>POWERED BY</Text>
              <Text style={styles.appName}>RetailFlow</Text>
              <View style={styles.divider} />
              <Text style={styles.pinPrompt}>Enter your 4-digit PIN to continue</Text>
            </View>

            {/* ── Error banner ─────────────────────────────────────────────── */}
            {errorMessage !== '' && (
              <Animated.View
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(200)}
                style={styles.errorBanner}
              >
                <Ionicons name="alert-circle" size={15} color={COLORS.red} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </Animated.View>
            )}

            {/* ── PIN indicator dots ───────────────────────────────────────── */}
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

            {/* ── 3×4 Numeric Keypad ──────────────────────────────────────── */}
            <View style={styles.keypadGrid}>
              {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((num) => (
                    <Pressable
                      key={num}
                      style={({ pressed }) => [styles.keyBtn, pressed && styles.keyBtnPressed]}
                      onPress={() => handleKeyPress(num)}
                      android_ripple={{ color: 'rgba(0,200,100,0.15)', borderless: false }}
                      accessibilityRole="button"
                      accessibilityLabel={`Keypad digit ${num}`}
                    >
                      <Text style={styles.keyText}>{num}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}

              {/* Bottom row: empty · 0 · backspace */}
              <View style={styles.keypadRow}>
                <View style={[styles.keyBtn, styles.keyBtnInvisible]} />

                <Pressable
                  style={({ pressed }) => [styles.keyBtn, pressed && styles.keyBtnPressed]}
                  onPress={() => handleKeyPress('0')}
                  android_ripple={{ color: 'rgba(0,200,100,0.15)', borderless: false }}
                  accessibilityRole="button"
                  accessibilityLabel="Keypad digit 0"
                >
                  <Text style={styles.keyText}>0</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.keyBtn, pressed && styles.keyBtnPressed]}
                  onPress={handleDelete}
                  android_ripple={{ color: 'rgba(0,200,100,0.15)', borderless: false }}
                  accessibilityRole="button"
                  accessibilityLabel="Backspace"
                >
                  <Ionicons name="backspace-outline" size={22} color="#1a2e44" />
                </Pressable>
              </View>
            </View>

            {/* ── Unlock button ────────────────────────────────────────────── */}
            <Pressable
              style={({ pressed }) => [styles.unlockBtn, pressed && { opacity: 0.85 }]}
              onPress={() => validatePin(pin)}
              android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
              accessibilityRole="button"
              accessibilityLabel="Unlock application"
            >
              <Ionicons name="lock-open-outline" size={18} color="#fff" />
              <Text style={styles.unlockText}>UNLOCK</Text>
            </Pressable>

          </View>
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
    // Light scrim: keeps Ivan A.K.A branding visible in the top half
    backgroundColor: 'rgba(240, 248, 255, 0.55)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },

  // ── Brand card ─────────────────────────────────────────────────────────────
  brandCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  poweredBy: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 2,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.green,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  divider: {
    width: 40,
    height: 2.5,
    backgroundColor: COLORS.green,
    borderRadius: 2,
    marginBottom: 8,
  },
  pinPrompt: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // ── Error banner ───────────────────────────────────────────────────────────
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.redBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
    gap: 6,
    width: '100%',
    maxWidth: 340,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.red,
  },

  // ── PIN dots ───────────────────────────────────────────────────────────────
  pinIndicatorRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(26,46,68,0.35)',
  },
  pinDotFilled: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
    transform: [{ scale: 1.15 }],
  },
  pinDotError: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },

  // ── Keypad ─────────────────────────────────────────────────────────────────
  keypadGrid: {
    gap: KEY_GAP,
    marginBottom: 18,
    width: KEYPAD_WIDTH,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyBtn: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(26,46,68,0.12)',
    ...SHADOWS.small,
  },
  keyBtnPressed: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
  },
  keyBtnInvisible: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  keyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2e44',
  },

  // ── Unlock button ──────────────────────────────────────────────────────────
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: KEYPAD_WIDTH,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.green,
    marginBottom: 4,
    ...SHADOWS.medium,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
  },

  // ── Success overlay ────────────────────────────────────────────────────────
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
