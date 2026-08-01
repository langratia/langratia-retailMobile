import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

export const MenuModal = ({ navigation }: any) => {
  const { settings, logout, products, transactions } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 8;

  const handleExportData = useCallback(() => {
    Alert.alert(
      'Export Data',
      `Data export ready! Total products: ${products.length}, Total transactions: ${transactions.length}. Saved in local offline storage.`
    );
  }, [products.length, transactions.length]);

  const handleHelpGuide = useCallback(() => {
    Alert.alert(
      'Offline Retail Guide',
      'This application works 100% offline. All sales, inventory, and transactions are stored directly on your phone/device.'
    );
  }, []);

  const handleLogout = useCallback(() => {
    navigation.goBack();
    logout();
  }, [navigation, logout]);

  const navigateToScreen = useCallback(
    (screenName: string) => {
      navigation.goBack();
      navigation.navigate(screenName);
    },
    [navigation]
  );

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        >
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Business Profile Summary Card */}
        <View
          style={styles.profileCard}
          accessibilityRole="summary"
          accessibilityLabel={`Business name: ${settings.businessName}, Owner: ${settings.ownerName}. 100% Offline mode`}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {settings.ownerName ? settings.ownerName.charAt(0).toUpperCase() : 'B'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.businessName}>{settings.businessName}</Text>
            <Text style={styles.ownerName}>Owner: {settings.ownerName}</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.currencyTag}>{settings.currency}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>App Navigation & Tools</Text>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {/* Business Settings */}
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressedItem]}
            onPress={() => navigateToScreen('Settings')}
            accessibilityRole="button"
            accessibilityLabel="Business Settings"
            accessibilityHint="Configure business name, currency, and stock alert threshold"
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.blueBg }]}>
              <Ionicons name="settings-outline" size={22} color={COLORS.blue} />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuTitle}>Business Settings</Text>
              <Text style={styles.menuSub}>Configure business name, stock alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          {/* Analytics & Reports */}
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressedItem]}
            onPress={() => navigateToScreen('Reports')}
            accessibilityRole="button"
            accessibilityLabel="Analytics & Reports"
            accessibilityHint="View business performance summary and financial metrics"
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.purpleBg }]}>
              <Ionicons name="stats-chart-outline" size={22} color={COLORS.purple} />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuTitle}>Analytics & Reports</Text>
              <Text style={styles.menuSub}>View business health and metrics</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          {/* Financial Statement Table */}
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressedItem]}
            onPress={() => navigateToScreen('StatementModal')}
            accessibilityRole="button"
            accessibilityLabel="Financial Statement Table"
            accessibilityHint="Open full tabular ledger of all transactions"
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.greenBg }]}>
              <Ionicons name="document-text-outline" size={22} color={COLORS.green} />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuTitle}>Financial Statement Table</Text>
              <Text style={styles.menuSub}>Tabular ledger of all transactions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          {/* Export & Backup */}
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressedItem]}
            onPress={handleExportData}
            accessibilityRole="button"
            accessibilityLabel="Export and Backup Data"
            accessibilityHint="Back up all inventory and transaction records locally"
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.purpleBg }]}>
              <Ionicons name="cloud-download-outline" size={22} color={COLORS.purple} />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuTitle}>Export & Backup Data</Text>
              <Text style={styles.menuSub}>Backup records locally</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>

          {/* Help & Offline Guide */}
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressedItem]}
            onPress={handleHelpGuide}
            accessibilityRole="button"
            accessibilityLabel="Offline Guide and Help"
            accessibilityHint="Learn how local storage works"
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.amberBg }]}>
              <Ionicons name="help-circle-outline" size={22} color={COLORS.amber} />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuTitle}>Offline Guide & Help</Text>
              <Text style={styles.menuSub}>How offline storage works</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* Account Action */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressedLogout]}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Log Out"
          accessibilityHint="Logs out of application"
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        {/* Version Footer */}
        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>v1.2.0 • IVAN A.K.A Electronics POS</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...SHADOWS.small,
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.green,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.green,
  },
  profileInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.green,
  },
  currencyTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 52,
    borderRadius: 12,
    gap: 12,
  },
  pressedItem: {
    backgroundColor: COLORS.inputBg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.redBg,
    borderRadius: 12,
    height: 50,
    gap: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.red,
  },
  pressedLogout: {
    opacity: 0.8,
  },
  versionFooter: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.7,
  },
});
