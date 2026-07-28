import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../theme/theme';

const { width, height } = Dimensions.get('window');

export const GlobalSpeedDial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleAction = (route: string, params?: any) => {
    toggleMenu(); // close menu
    // small delay so animation can start before heavy navigation
    setTimeout(() => {
      navigation.navigate(route as never, params as never);
    }, 150);
  };

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
            outputRange: [20, -((index + 1) * 65)], // Spaces out each sub-fab vertically
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

      <View style={styles.container}>
        {/* Sub-FAB 3: Add Expense */}
        <Animated.View style={[styles.subFabContainer, getSubFabStyle(2)]}>
          <Text style={styles.label}>Add Expense</Text>
          <TouchableOpacity
            style={[styles.subFab, { backgroundColor: COLORS.amber }]}
            activeOpacity={0.8}
            onPress={() => handleAction('AddTransaction', { defaultType: 'expense' })}
          >
            <Ionicons name="receipt-outline" size={20} color={COLORS.card} />
          </TouchableOpacity>
        </Animated.View>

        {/* Sub-FAB 2: Record Sale */}
        <Animated.View style={[styles.subFabContainer, getSubFabStyle(1)]}>
          <Text style={styles.label}>Record Sale</Text>
          <TouchableOpacity
            style={[styles.subFab, { backgroundColor: COLORS.blue }]}
            activeOpacity={0.8}
            onPress={() => handleAction('RecordSale')}
          >
            <Ionicons name="cart-outline" size={20} color={COLORS.card} />
          </TouchableOpacity>
        </Animated.View>

        {/* Sub-FAB 1: Add Stock */}
        <Animated.View style={[styles.subFabContainer, getSubFabStyle(0)]}>
          <Text style={styles.label}>Add Stock</Text>
          <TouchableOpacity
            style={[styles.subFab, { backgroundColor: COLORS.green }]}
            activeOpacity={0.8}
            onPress={() => handleAction('AddEditProduct')}
          >
            <Ionicons name="cube-outline" size={20} color={COLORS.card} />
          </TouchableOpacity>
        </Animated.View>

        {/* Main FAB */}
        <TouchableOpacity style={styles.mainFab} activeOpacity={0.9} onPress={toggleMenu}>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="add" size={32} color={COLORS.card} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: -height, // Cover full screen above
    left: -width,
    width: width * 2,
    height: height * 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: 10,
  },
  container: {
    position: 'absolute',
    bottom: 24, // Will be contained in a View above the tab bar, so 24 from the bottom of THAT view is fine
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
  subFabContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 6, // center small fab over big fab
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
});
