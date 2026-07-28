import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  onDismiss,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible && (opacity as any)._value === 0) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          bgColor: COLORS.greenBg,
          borderColor: COLORS.green,
          textColor: COLORS.green,
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          bgColor: COLORS.redBg,
          borderColor: COLORS.red,
          textColor: COLORS.red,
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          bgColor: COLORS.amberBg,
          borderColor: COLORS.amber,
          textColor: COLORS.amber,
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          bgColor: COLORS.blueBg,
          borderColor: COLORS.blue,
          textColor: COLORS.blue,
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Ionicons name={config.icon} size={22} color={config.textColor} />
        <Text style={[styles.toastText, { color: config.textColor }]}>
          {message}
        </Text>
      </View>

      {onDismiss && (
        <TouchableOpacity onPress={hideToast} activeOpacity={0.7} style={styles.closeBtn}>
          <Ionicons name="close" size={18} color={config.textColor} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    ...SHADOWS.medium,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
