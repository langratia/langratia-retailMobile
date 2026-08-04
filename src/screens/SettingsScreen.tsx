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
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { SuccessModal } from '../components/SuccessModal';

const SUPPORTED_CURRENCIES = ['UGX', 'USD', 'KES', 'EUR', 'NGN', 'GHS'];

export const SettingsScreen = ({ navigation }: any) => {
  const { settings, updateSettings, resetAllData, logout, products, transactions } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 8;

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [currency, setCurrency] = useState(settings.currency || 'UGX');
  const [lowStockThreshold, setLowStockThreshold] = useState(
    settings.lowStockThreshold.toString()
  );
  const [securityPin, setSecurityPin] = useState('1234');
  const [successConfig, setSuccessConfig] = useState<{
    visible: boolean;
    title: string;
    subtitle: string;
  }>({
    visible: false,
    title: '',
    subtitle: '',
  });

  React.useEffect(() => {
    const loadPin = async () => {
      try {
        const storedPin = await SecureStore.getItemAsync('SECURITY_PIN');
        if (storedPin) {
          setSecurityPin(storedPin);
        }
      } catch (error) {
        console.error('Failed to load secure PIN', error);
      }
    };
    loadPin();
  }, []);

  const handleSave = useCallback(async () => {
    // SS-03: Validate non-empty business name and owner name.
    if (!businessName.trim()) {
      Alert.alert('Validation Error', 'Business Name cannot be empty.');
      return;
    }
    if (!ownerName.trim()) {
      Alert.alert('Validation Error', 'Owner/Manager Name cannot be empty.');
      return;
    }

    const thresholdNum = parseInt(lowStockThreshold, 10);
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      Alert.alert('Validation Error', 'Please enter a valid non-negative number for low stock threshold.');
      return;
    }

    if (!/^\d{4}$/.test(securityPin)) {
      Alert.alert('PIN Error', 'Security PIN must be exactly 4 numeric digits.');
      return;
    }

    try {
      await SecureStore.setItemAsync('SECURITY_PIN', securityPin);
    } catch (e) {
      console.error('Failed to securely save PIN', e);
      Alert.alert('Save Error', 'Failed to save your security PIN. Please try again.');
      return;
    }

    // PIN is NOT stored in the Zustand settings — it lives exclusively in SecureStore.
    updateSettings({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      currency,
      lowStockThreshold: thresholdNum,
    });
    setSuccessConfig({
      visible: true,
      title: 'Settings Saved',
      subtitle: 'Your business preferences have been updated.',
    });
  }, [businessName, ownerName, currency, lowStockThreshold, securityPin, updateSettings]);

  const handleResetData = useCallback(() => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all products and sales data? This will clear all records and set the app to a clean state for your business.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe & Reset',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            // SS-02: Sync local form state with the actual reset values from the store,
            // not hardcoded strings that differ from initialSettings.
            setBusinessName('IVAN A.K.A Electronics');
            setOwnerName('Ivan');
            setCurrency('UGX');
            setLowStockThreshold('5');
            setSuccessConfig({
              visible: true,
              title: 'Data Wiped',
              subtitle: 'All app data has been reset.',
            });
          },
        },
      ]
    );
  }, [resetAllData]);

  // SS-04: Call logout() first, then goBack(). The store update (sync) should
  // happen before any navigation side-effect so the auth gate fires correctly.
  const handleLogout = useCallback(() => {
    logout();
    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
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
        {/* Business Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Business Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="e.g. My Business"
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
              placeholder="e.g. Ivan"
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

          {/* 4-Digit Security PIN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>App Unlock Security PIN (4 Digits)</Text>
            <Text style={styles.helperText}>
              The 4-digit PIN required to unlock and log into your application (Default: 1234).
            </Text>
            <TextInput
              style={styles.input}
              value={securityPin}
              onChangeText={setSecurityPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry={true}
              placeholder="••••"
              placeholderTextColor={COLORS.textMuted}
              accessibilityLabel="Security PIN input"
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

        {/* Data Maintenance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Reset & Maintenance</Text>
          <Text style={styles.helperText}>
            Current stored products: {products.length} • Stored transactions: {transactions.length}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
            onPress={handleResetData}
            accessibilityRole="button"
            accessibilityLabel="Reset all app data"
          >
            <Ionicons name="trash-bin-outline" size={18} color={COLORS.red} />
            <Text style={styles.resetBtnText}>Wipe & Reset All App Data</Text>
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

      <SuccessModal
        visible={successConfig.visible}
        title={successConfig.title}
        subtitle={successConfig.subtitle}
        onClose={() =>
          setSuccessConfig((prev) => ({ ...prev, visible: false }))
        }
      />
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
  // Removed unused styles: healthCard, healthHeader, healthTitle, healthSub (GA-09)
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
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.redBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 4,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.red,
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
