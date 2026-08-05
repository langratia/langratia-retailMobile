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

  // Position FAB comfortably above the bottom navigation bar so it's very easy to tap
  const fabBottom = 88 + Math.max(insets.bottom, 16);

  const toggleMenu = useCallback(() => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 7,
      tension: 60,
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

  // Vertical straight-line animation offset
  const getSubFabStyle = (index: number) => {
    return {
      opacity: animation,
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -((index + 1) * 66)],
          }),
        },
        {
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
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

      <View style={[styles.container, { bottom: fabBottom }]} pointerEvents="box-none">
        {/* Sub-FAB 3: Add Expense */}
        <Animated.View style={[styles.subFabContainer, getSubFabStyle(2)]} pointerEvents={isOpen ? 'auto' : 'none'}>
          <Pressable onPress={() => handleAction('AddTransaction', { defaultType: 'expense' })}>
            <View style={styles.labelBadge}>
              <Text style={styles.label} numberOfLines={1}>Add Expense</Text>
            </View>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.subFab,
              { backgroundColor: COLORS.amber },
              pressed && styles.pressed,
            ]}
            onPress={() => handleAction('AddTransaction', { defaultType: 'expense' })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Add expense transaction"
          >
            <Ionicons name="receipt-outline" size={22} color={COLORS.card} />
          </Pressable>
        </Animated.View>

        {/* Sub-FAB 2: Record Sale */}
        <Animated.View style={[styles.subFabContainer, getSubFabStyle(1)]} pointerEvents={isOpen ? 'auto' : 'none'}>
          <Pressable onPress={() => handleAction('RecordSale')}>
            <View style={styles.labelBadge}>
              <Text style={styles.label} numberOfLines={1}>Record Sale</Text>
            </View>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.subFab,
              { backgroundColor: COLORS.blue },
              pressed && styles.pressed,
            ]}
            onPress={() => handleAction('RecordSale')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Record sale checkout"
          >
            <Ionicons name="cart-outline" size={22} color={COLORS.card} />
          </Pressable>
        </Animated.View>

        {/* Sub-FAB 1: Add Stock */}
        <Animated.View style={[styles.subFabContainer, getSubFabStyle(0)]} pointerEvents={isOpen ? 'auto' : 'none'}>
          <Pressable onPress={() => handleAction('AddEditProduct')}>
            <View style={styles.labelBadge}>
              <Text style={styles.label} numberOfLines={1}>Add Stock</Text>
            </View>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.subFab,
              { backgroundColor: COLORS.green },
              pressed && styles.pressed,
            ]}
            onPress={() => handleAction('AddEditProduct')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Add stock product"
          >
            <Ionicons name="cube-outline" size={22} color={COLORS.card} />
          </Pressable>
        </Animated.View>

        {/* Main FAB Button */}
        <Pressable
          style={({ pressed }) => [
            styles.mainFab,
            pressed && styles.mainFabPressed,
          ]}
          onPress={toggleMenu}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={isOpen ? 'Close quick actions menu' : 'Expand quick actions menu'}
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    zIndex: 10,
  },
  container: {
    position: 'absolute',
    // Span the full screen width so sub-fab labels have room to render.
    // Without `left`, the container collapses to 60px (main FAB width) and
    // the flex measurement constrains the label badge — causing truncation.
    left: 0,
    right: 20,
    alignItems: 'flex-end', // keeps main FAB pinned to the right
    zIndex: 20,
  },
  mainFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  mainFabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  subFabContainer: {
    position: 'absolute',
    // Span the full available width so labels never get squeezed.
    left: 0,
    right: 0,
    paddingRight: 4, // 4px offset perfectly centers 52px circle over 60px main FAB
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // icon sits at right, label is to its left
  },
  labelBadge: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    // No maxWidth — label should always be fully visible
    ...SHADOWS.small,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  subFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },
});
