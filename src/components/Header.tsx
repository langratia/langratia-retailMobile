import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
  title = 'IVAN A.K.A Electronics',
  showMenu = true,
  showNotification = true,
  rightAction,
}) => {
  const navigation = useNavigation();
  const { products, settings } = useAppStore();

  const lowStockCount = products.filter((p) => p.quantity <= settings.lowStockThreshold).length;

  const handleNotificationPress = () => {
    if (lowStockCount > 0) {
      Alert.alert(
        '🔔 Business Alerts',
        `You have ${lowStockCount} item(s) running low on stock! Check your Inventory to replenish.`,
        [
          { text: 'View Inventory', onPress: () => navigation.navigate('Inventory' as never, { filterLowStock: true } as never) },
          { text: 'Close', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert('🔔 Business Alerts', 'All stock levels and financial records are up to date!');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.inner}>
        <View style={styles.leftSection}>
          {showMenu && (
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MenuModal' as never)}
            >
              <Ionicons name="menu-outline" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>

        <View style={styles.rightSection}>
          {rightAction}
          {showNotification && (
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={handleNotificationPress}
            >
              <View style={styles.notificationWrapper}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
                {lowStockCount > 0 && <View style={styles.dot} />}
              </View>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
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
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: COLORS.inputBg,
  },
  notificationWrapper: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
});
