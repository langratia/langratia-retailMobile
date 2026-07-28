import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/theme';

interface BadgeProps {
  quantity: number;
  lowStockThreshold?: number;
}

export const Badge: React.FC<BadgeProps> = ({ quantity, lowStockThreshold = 5 }) => {
  let text = `${quantity} Units In Stock`;
  let bgColor = COLORS.inStockBg;
  let textColor = COLORS.inStockText;

  if (quantity === 0) {
    text = '0 Units Out of Stock';
    bgColor = COLORS.outOfStockBg;
    textColor = COLORS.outOfStockText;
  } else if (quantity <= lowStockThreshold) {
    text = `${quantity} Units Low Stock`;
    bgColor = COLORS.lowStockBg;
    textColor = COLORS.lowStockText;
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
