import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

export const MenuModal = ({ navigation }: any) => {
  const { settings, logout, products, transactions } = useAppStore();

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      `Data export ready! Total products: ${products.length}, Total transactions: ${transactions.length}. Data is saved locally in offline storage.`
    );
  };

  const handleHelpGuide = () => {
    Alert.alert(
      'Offline Retail Guide',
      'This application works 100% offline. All sales, inventory, and transactions are stored directly on your phone/device. No internet connection required!'
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Business Profile Summary Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {settings.ownerName ? settings.ownerName.charAt(0).toUpperCase() : 'B'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.businessName}>{settings.businessName}</Text>
            <Text style={styles.ownerName}>Owner: {settings.ownerName}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.offlineBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.offlineText}>100% Offline Mode</Text>
              </View>
              <Text style={styles.currencyTag}>{settings.currency}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>App Navigation & Tools</Text>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {/* Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.goBack();
              navigation.navigate('Settings');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.blueBg }]}>
              <Ionicons name="settings-outline" size={22} color={COLORS.blue} />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuTitle}>Business Settings</Text>
              <Text style={styles.menuSub}>Configure business name, stock alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Export & Backup */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.purpleBg }]}>
              <Ionicons name="cloud-download-outline" size={22} color={COLORS.purple} />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuTitle}>Export & Backup Data</Text>
              <Text style={styles.menuSub}>Backup records locally</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Help & Offline Guide */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleHelpGuide}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.amberBg }]}>
              <Ionicons name="help-circle-outline" size={22} color={COLORS.amber} />
            </View>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuTitle}>Offline Guide & Help</Text>
              <Text style={styles.menuSub}>How offline storage works</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Account Action */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            navigation.goBack();
            logout();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 20,
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
    borderRadius: 12,
    gap: 12,
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
    height: 48,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.red,
  },
});
