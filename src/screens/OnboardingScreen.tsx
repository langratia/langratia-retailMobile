import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Animated as RNAnimated,
  Image,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 380);
const KEYPAD_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 300);
const KEY_GAP = 14;
const KEY_SIZE = Math.floor((KEYPAD_WIDTH - KEY_GAP * 2) / 3);

type Step = 'welcome' | 'business' | 'set_pin' | 'confirm_pin';

export const OnboardingScreen = () => {
  const { login, updateSettings } = useAppStore();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('welcome');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessError, setBusinessError] = useState('');

  const [pin, setPin] = useState('');
  const [confirmedPin, setConfirmedPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Which PIN step is active
  const isSettingPin = step === 'set_pin';
  const isConfirmingPin = step === 'confirm_pin';
  const activePin = isSettingPin ? pin : confirmedPin;
  const setActivePin = isSettingPin ? setPin : setConfirmedPin;

  // ── Success animation ───────────────────────────────────────────────────────
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;
  const rotateAnim = useRef(new RNAnimated.Value(0)).current;
  const [isSuccess, setIsSuccess] = useState(false);

  const playSuccess = useCallback(() => {
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
      setTimeout(() => login(), 600);
    });
  }, [login, scaleAnim, rotateAnim]);

  // ── Business step handlers ──────────────────────────────────────────────────
  const handleBusinessNext = useCallback(() => {
    if (!businessName.trim()) {
      setBusinessError('Please enter your business name.');
      return;
    }
    setBusinessError('');
    updateSettings({
      businessName: businessName.trim(),
      ownerName: ownerName.trim() || 'Owner',
    });
    setStep('set_pin');
  }, [businessName, ownerName, updateSettings]);

  // ── PIN keypad handlers ─────────────────────────────────────────────────────
  const handleKeyPress = useCallback(
    (digit: string) => {
      setPinError('');
      if (activePin.length < 4) {
        const next = activePin + digit;
        setActivePin(next);

        if (next.length === 4) {
          if (isSettingPin) {
            // Move to confirmation
            setTimeout(() => setStep('confirm_pin'), 150);
          } else {
            // Confirm
            setTimeout(() => {
              if (next === pin) {
                SecureStore.setItemAsync('SECURITY_PIN', pin).then(playSuccess);
              } else {
                setPinError('PINs do not match. Try again.');
                setConfirmedPin('');
              }
            }, 150);
          }
        }
      }
    },
    [activePin, isSettingPin, pin, setActivePin, playSuccess]
  );

  const handleDelete = useCallback(() => {
    setPinError('');
    if (activePin.length > 0) setActivePin(activePin.slice(0, -1));
  }, [activePin, setActivePin]);

  const handleResetPin = () => {
    setPin('');
    setConfirmedPin('');
    setPinError('');
    setStep('set_pin');
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <View style={styles.successScreen}>
        <Image
          source={require('../../assets/ivanBanner.png')}
          style={StyleSheet.absoluteFillObject as any}
          resizeMode="cover"
        />
        <View style={styles.successOverlay}>
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
            Welcome to RetailFlow!
          </RNAnimated.Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={require('../../assets/ivanBanner.png')}
        style={StyleSheet.absoluteFillObject as any}
        resizeMode="cover"
      />
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 24) }]}>

        {/* ── STEP: Welcome ──────────────────────────────────────────────── */}
        {step === 'welcome' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.centered}>
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="storefront-outline" size={36} color={COLORS.green} />
              </View>
              <Text style={styles.cardTitle}>Welcome to RetailFlow</Text>
              <Text style={styles.cardSubtitle}>
                Your complete retail management solution.{'\n'}
                Let's set up your business in under a minute.
              </Text>

              <View style={styles.featureList}>
                {[
                  { icon: 'cube-outline', text: 'Track inventory & stock levels' },
                  { icon: 'wallet-outline', text: 'Manage cashbook & sales' },
                  { icon: 'bar-chart-outline', text: 'View reports & insights' },
                  { icon: 'shield-checkmark-outline', text: 'PIN-secured access' },
                ].map((f) => (
                  <View key={f.text} style={styles.featureRow}>
                    <Ionicons name={f.icon as any} size={18} color={COLORS.green} />
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
                onPress={() => setStep('business')}
              >
                <Text style={styles.primaryBtnText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* ── STEP: Business details ────────────────────────────────────── */}
        {step === 'business' && (
          <Animated.View entering={SlideInRight.duration(350)} exiting={SlideOutLeft.duration(250)} style={styles.centered}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ alignItems: 'center' }}>
                <View style={styles.card}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="business-outline" size={32} color={COLORS.green} />
                  </View>
                  <Text style={styles.cardTitle}>Your Business</Text>
                  <Text style={styles.cardSubtitle}>This will appear on your reports and cashbook.</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Business Name *</Text>
                    <TextInput
                      style={[styles.input, businessError ? styles.inputError : null]}
                      value={businessName}
                      onChangeText={(t) => { setBusinessName(t); setBusinessError(''); }}
                      placeholder="e.g. Ivan A.K.A Electronics"
                      placeholderTextColor={COLORS.textMuted}
                      returnKeyType="next"
                    />
                    {businessError ? <Text style={styles.errorText}>{businessError}</Text> : null}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Your Name (optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={ownerName}
                      onChangeText={setOwnerName}
                      placeholder="e.g. Ivan"
                      placeholderTextColor={COLORS.textMuted}
                      returnKeyType="done"
                    />
                  </View>

                  <Pressable
                    style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
                    onPress={handleBusinessNext}
                  >
                    <Text style={styles.primaryBtnText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </Pressable>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        )}

        {/* ── STEP: Set PIN or Confirm PIN ──────────────────────────────── */}
        {(step === 'set_pin' || step === 'confirm_pin') && (
          <Animated.View entering={SlideInRight.duration(350)} style={[styles.centered, { width: '100%' }]}>
            <View style={[styles.card, { width: Math.min(SCREEN_WIDTH - 48, 380) }]}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={isConfirmingPin ? 'shield-checkmark-outline' : 'lock-closed-outline'}
                  size={32}
                  color={COLORS.green}
                />
              </View>
              <Text style={styles.cardTitle}>
                {isConfirmingPin ? 'Confirm Your PIN' : 'Set a 4-Digit PIN'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isConfirmingPin
                  ? 'Enter your PIN again to confirm.'
                  : 'This PIN protects access to your business data.'}
              </Text>

              {/* Error */}
              {pinError !== '' && (
                <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={15} color={COLORS.red} />
                  <Text style={styles.errorBannerText}>{pinError}</Text>
                </Animated.View>
              )}

              {/* PIN dots */}
              <View style={styles.pinIndicatorRow}>
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = activePin.length > idx;
                  return (
                    <View
                      key={idx}
                      style={[styles.pinDot, isFilled && styles.pinDotFilled, pinError && styles.pinDotError]}
                    />
                  );
                })}
              </View>

              {/* Keypad */}
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
                        accessibilityLabel={`Digit ${num}`}
                      >
                        <Text style={styles.keyText}>{num}</Text>
                      </Pressable>
                    ))}
                  </View>
                ))}

                <View style={styles.keypadRow}>
                  {isConfirmingPin ? (
                    <Pressable style={[styles.keyBtn, styles.keyBtnGhost]} onPress={handleResetPin}>
                      <Ionicons name="refresh-outline" size={18} color={COLORS.textSecondary} />
                    </Pressable>
                  ) : (
                    <View style={[styles.keyBtn, styles.keyBtnInvisible]} />
                  )}

                  <Pressable
                    style={({ pressed }) => [styles.keyBtn, pressed && styles.keyBtnPressed]}
                    onPress={() => handleKeyPress('0')}
                    android_ripple={{ color: 'rgba(0,200,100,0.15)', borderless: false }}
                    accessibilityRole="button"
                    accessibilityLabel="Digit 0"
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
            </View>
          </Animated.View>
        )}

        {/* ── Step dots indicator ───────────────────────────────────────── */}
        <View style={styles.stepDots}>
          {(['welcome', 'business', 'set_pin', 'confirm_pin'] as Step[]).map((s) => (
            <View key={s} style={[styles.stepDot, step === s && styles.stepDotActive]} />
          ))}
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(240, 248, 255, 0.60)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a2e44',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },

  // Feature list
  featureList: {
    width: '100%',
    gap: 10,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  featureText: {
    fontSize: 13,
    color: '#1a2e44',
    fontWeight: '500',
  },

  // Inputs
  inputGroup: { width: '100%', marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: '#1a2e44',
    borderWidth: 1,
    borderColor: COLORS.divider,
    width: '100%',
  },
  inputError: { borderColor: COLORS.red },
  errorText: { color: COLORS.red, fontSize: 12, marginTop: 4 },

  // Primary button
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.green,
    marginTop: 4,
    ...SHADOWS.small,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // Error banner
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
  },
  errorBannerText: { flex: 1, fontSize: 12, fontWeight: '700', color: COLORS.red },

  // PIN dots
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
    backgroundColor: COLORS.inputBg,
    borderWidth: 2,
    borderColor: COLORS.divider,
  },
  pinDotFilled: { backgroundColor: COLORS.green, borderColor: COLORS.green, transform: [{ scale: 1.15 }] },
  pinDotError: { backgroundColor: COLORS.red, borderColor: COLORS.red },

  // Keypad
  keypadGrid: { gap: KEY_GAP, width: KEYPAD_WIDTH, marginBottom: 4 },
  keypadRow: { flexDirection: 'row', justifyContent: 'space-between' },
  keyBtn: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.small,
  },
  keyBtnPressed: { backgroundColor: COLORS.greenBg, borderColor: COLORS.green },
  keyBtnInvisible: { borderWidth: 0, backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  keyBtnGhost: { backgroundColor: 'transparent', borderColor: COLORS.divider },
  keyText: { fontSize: 20, fontWeight: '700', color: '#1a2e44' },

  // Step indicator
  stepDots: { flexDirection: 'row', gap: 8, paddingTop: 16 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  stepDotActive: { backgroundColor: COLORS.green, width: 20 },

  // Success
  successScreen: { flex: 1 },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(240,248,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '800',
    color: '#1a2e44',
    letterSpacing: 0.5,
  },
});
