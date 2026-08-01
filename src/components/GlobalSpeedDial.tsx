import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../theme/theme';

const { width, height } = Dimensions.get('window');

export const GlobalSpeedDial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const fabBottom = 72 + Math.max(insets.bottom, 10);

  const toggleMenu = useCallback(() => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  }, [isOpen, animation]);

  const handleAction = useCallback(
    (route: string, params?: any) => {
      toggleMenu(); // close menu
      setTimeout(() => {
        navigation.navigate(route as never, params as never);
      }, 150);
    },
    [toggleMenu, navigation]
  );

  // Interpolate rotation for the main FAB icon (+ to x)
  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Reusable function to create animated styles for sub-fabs
  const getSubFabStyle = (index: number) => {
    return {
      opacity: animation,
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [20, -((index + 1) * 65)],
          }),
        },
        {
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          }),
        },
      ],
    };
  };

  return (
    <>
      {/* Backdrop to close menu when tapping outside */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      <View style={[styles.container, { bottom: fabBottom }]}>
        {/* Sub-FAB 3: Add Expense */}
        <Animated.View style={[styles.subFabContainer, getSubFabStyle(2)]}>
          <Text style={styles.label}>Add Expense</Text>
          <Pressable
            style={({ pressed }) => [
              styles.subFab,
              { backgroundColor: COLORS.amber },
              pressed && styles.pressed,
            ]}
            onPress={() => handleAction('AddTransaction', { defaultType: 'expense' })}
            accessibilityRole="button"
            accessibilityLabel="Add expense transaction"
            accessibilityHint="Navigates to add expense modal"
          >
            <Ionicons name="receipt-outline" size={20} color={COLORS.card} />
          </Pressable>
        </Animated.View>

        {/* Sub-FAB 2: Record Sale */}
        <Animated.View style={[styles.subFabContainer, getSubFabStyle(1)]}>
          <Text style={styles.label}>Record Sale</Text>
          <Pressable
            style={({ pressed }) => [
              styles.subFab,
              { backgroundColor: COLORS.blue },
              pressed && styles.pressed,
            ]}
            onPress={() => handleAction('RecordSale')}
            accessibilityRole="button"
            accessibilityLabel="Record sale checkout"
            accessibilityHint="Navigates to point of sale checkout modal"
          >
            <Ionicons name="cart-outline" size={20} color={COLORS.card} />
          </Pressable>
        </Animated.View>

        {/* Sub-FAB 1: Add Stock */}
        <Animated.View style={[styles.subFabContainer, getSubFabStyle(0)]}>
          <Text style={styles.label}>Add Stock</Text>
          <Pressable
            style={({ pressed }) => [
              styles.subFab,
              { backgroundColor: COLORS.green },
              pressed && styles.pressed,
            ]}
            onPress={() => handleAction('AddEditProduct')}
            accessibilityRole="button"
            accessibilityLabel="Add stock product"
            accessibilityHint="Navigates to add or edit product modal"
          >
            <Ionicons name="cube-outline" size={20} color={COLORS.card} />
          </Pressable>
        </Animated.View>

        {/* Main FAB */}
        <Pressable
          style={({ pressed }) => [
            styles.mainFab,
            pressed && styles.mainFabPressed,
          ]}
          onPress={toggleMenu}
          accessibilityRole="button"
          accessibilityLabel={isOpen ? 'Close quick actions menu' : 'Expand quick actions menu'}
          accessibilityHint="Toggles speed dial quick action buttons"
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="add" size={32} color={COLORS.card} />
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: -height,
    left: -width,
    width: width * 2,
    height: height * 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: 10,
  },
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 20,
  },
  mainFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.fab,
  },
  mainFabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  subFabContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 6,
  },
  label: {
    backgroundColor: COLORS.card,
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
    fontSize: 13,
    fontWeight: '600',
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  subFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
