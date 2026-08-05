import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../theme/theme';

interface HeaderProps {
  title?: string;
  showMenu?: boolean;
  showNotification?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'RetailFlow',
  showMenu = true,
  showNotification = true,
  rightAction,
}) => {
  const navigation = useNavigation<any>();
  const { products, settings } = useAppStore();

  const lowStockCount = useMemo(
    () => products.filter((p) => p.quantity <= settings.lowStockThreshold).length,
    [products, settings.lowStockThreshold]
  );

  const handleNotificationPress = useCallback(() => {
    if (lowStockCount > 0) {
      Alert.alert(
        'Business Alerts',
        `You have ${lowStockCount} item(s) running low on stock! Check your Inventory to replenish.`,
        [
          {
            text: 'View Inventory',
            onPress: () =>
              navigation.navigate('Inventory', { filterLowStock: true }),
          },
          { text: 'Close', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Business Alerts',
        'All stock levels and financial records are healthy!'
      );
    }
  }, [lowStockCount, navigation]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.inner}>
        <View style={styles.leftSection}>
          {showMenu && (
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              onPress={() => navigation.navigate('MenuModal')}
              accessibilityRole="button"
              accessibilityLabel="Open application menu"
              accessibilityHint="Opens navigation drawer menu"
            >
              <Ionicons name="menu-outline" size={24} color={COLORS.textPrimary} />
            </Pressable>
          )}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {rightAction}
          {showNotification && (
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              onPress={handleNotificationPress}
              accessibilityRole="button"
              accessibilityLabel={`Business alerts. ${lowStockCount} low stock alerts`}
              accessibilityHint="Inspects inventory stock alerts"
            >
              <View style={styles.notificationWrapper}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={COLORS.textPrimary}
                />
                {lowStockCount > 0 && <View style={styles.dot} />}
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  inner: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.inputBg,
  },
  notificationWrapper: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  pressed: {
    opacity: 0.7,
  },
});
