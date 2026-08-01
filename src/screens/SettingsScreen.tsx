import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

const SUPPORTED_CURRENCIES = ['UGX', 'USD', 'KES', 'EUR', 'NGN', 'GHS'];

export const SettingsScreen = ({ navigation }: any) => {
  const { settings, updateSettings, logout, products, transactions } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 8;

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [currency, setCurrency] = useState(settings.currency || 'UGX');
  const [lowStockThreshold, setLowStockThreshold] = useState(
    settings.lowStockThreshold.toString()
  );

  const handleSave = useCallback(() => {
    const thresholdNum = parseInt(lowStockThreshold, 10);
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      Alert.alert('Validation Error', 'Please enter a valid non-negative number for low stock threshold.');
      return;
    }

    updateSettings({
      businessName,
      ownerName,
      currency,
      lowStockThreshold: thresholdNum,
    });
    Alert.alert('Settings Saved! 🎉', 'Your business configuration has been updated successfully.');
  }, [businessName, ownerName, currency, lowStockThreshold, updateSettings]);

  const handleLogout = useCallback(() => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
    logout();
  }, [navigation, logout]);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Modal Header */}
      <View style={styles.modalHeader}>
        <Pressable
          onPress={() => navigation?.goBack()}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Close settings modal"
        >
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Business Settings</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subHeader}>Configure business profile and preferences</Text>

        {/* Business Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Business Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="e.g. Retail Store"
              placeholderTextColor={COLORS.textMuted}
              accessibilityLabel="Business name input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner / Manager Name</Text>
            <TextInput
              style={styles.input}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="e.g. Ahmed"
              placeholderTextColor={COLORS.textMuted}
              accessibilityLabel="Owner name input"
            />
          </View>
        </View>

        {/* Preferences & Currency Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences & Inventory Alerts</Text>

          {/* Currency Selection Chips */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Currency</Text>
            <View style={styles.currencyGrid}>
              {SUPPORTED_CURRENCIES.map((curr) => {
                const isSelected = currency === curr;
                return (
                  <Pressable
                    key={curr}
                    style={({ pressed }) => [
                      styles.currencyChip,
                      isSelected && styles.currencyChipActive,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setCurrency(curr)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select currency ${curr}`}
                  >
                    <Text
                      style={[
                        styles.currencyChipText,
                        isSelected && styles.currencyChipTextActive,
                      ]}
                    >
                      {curr}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Low Stock Alert Threshold */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Low Stock Alert Threshold (Units)</Text>
            <Text style={styles.helperText}>
              Items with stock equal to or below this amount will show a low-stock alert.
            </Text>
            <TextInput
              style={styles.input}
              value={lowStockThreshold}
              onChangeText={setLowStockThreshold}
              keyboardType="number-pad"
              placeholder="e.g. 5"
              placeholderTextColor={COLORS.textMuted}
              accessibilityLabel="Low stock threshold input"
            />
          </View>

          {/* Save Button */}
          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save business settings"
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.card} />
            <Text style={styles.saveBtnText}>Save Settings</Text>
          </Pressable>
        </View>

        {/* Account Action */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out of application"
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  subHeader: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  healthCard: {
    backgroundColor: COLORS.greenBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    ...SHADOWS.small,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  healthTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.green,
    textTransform: 'uppercase',
  },
  healthSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyChipActive: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
  },
  currencyChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  currencyChipTextActive: {
    color: COLORS.green,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    borderRadius: 14,
    height: 52,
    gap: 8,
    marginTop: 8,
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.card,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.redBg,
    borderRadius: 14,
    height: 52,
    gap: 8,
    marginTop: 8,
  },
  logoutBtnPressed: {
    opacity: 0.8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.red,
  },
  pressed: {
    opacity: 0.7,
  },
});
