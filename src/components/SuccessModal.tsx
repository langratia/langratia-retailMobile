import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Vibration,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';

export interface SuccessModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  amount?: string;
  badgeText?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  primaryBtnText?: string;
  onPrimaryPress?: () => void;
  secondaryBtnText?: string;
  onSecondaryPress?: () => void;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title,
  subtitle,
  amount,
  badgeText = 'TRANSACTION COMPLETED 🎉',
  iconName = 'checkmark-circle',
  iconColor = COLORS.green,
  primaryBtnText = 'Done',
  onPrimaryPress,
  secondaryBtnText,
  onSecondaryPress,
  onClose,
}) => {
  // Animation Values
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const badgeBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Tactile Haptic Vibration Pulse (50ms tap, 30ms pause, 80ms double tap)
      try {
        Vibration.vibrate([0, 45, 35, 75]);
      } catch (e) {
        // Fallback for devices without vibration motor
      }

      // Reset animation values
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);
      glowScale.setValue(0.8);
      badgeBounce.setValue(-15);

      // Trigger Spring Pop Sequence
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.3,
            duration: 350,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.spring(glowScale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(badgeBounce, {
          toValue: 0,
          friction: 4,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim, glowScale, badgeBounce]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.cardContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          
          {/* Dopamine Glow Circle behind Icon */}
          <Animated.View style={[styles.glowRing, { transform: [{ scale: glowScale }] }]} />

          {/* Icon Badge */}
          <View style={[styles.iconCircle, { backgroundColor: `${iconColor}1A` }]}>
            <Ionicons name={iconName} size={48} color={iconColor} />
          </View>

          {/* Confetti Badge */}
          <Animated.View style={[styles.badgePill, { transform: [{ translateY: badgeBounce }] }]}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </Animated.View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          {/* Amount Hero Card (If present) */}
          {amount ? (
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>AMOUNT RECORDED</Text>
              <Text style={styles.amountValue}>{amount}</Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {secondaryBtnText ? (
              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                onPress={() => {
                  if (onSecondaryPress) onSecondaryPress();
                  onClose();
                }}
              >
                <Text style={styles.secondaryBtnText}>{secondaryBtnText}</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: iconColor },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                if (onPrimaryPress) onPrimaryPress();
                onClose();
              }}
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>{primaryBtnText}</Text>
            </Pressable>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.medium,
  },
  glowRing: {
    position: 'absolute',
    top: 24,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: COLORS.greenBg,
  },
  badgePill: {
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.green,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  amountBox: {
    width: '100%',
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.green,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
