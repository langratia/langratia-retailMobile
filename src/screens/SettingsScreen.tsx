import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

export const SettingsScreen = ({ navigation }: any) => {
  const { settings, updateSettings, logout } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 8;

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    settings.lowStockThreshold.toString()
  );

  const handleSave = () => {
    updateSettings({
      businessName,
      ownerName,
      currency: 'UGX',
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
    });
    Alert.alert('Settings Updated', 'Your business settings have been saved successfully.');
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Modal / Screen Header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={() => navigation?.goBack()} activeOpacity={0.7}>
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              style={styles.input}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="e.g. Ahmed"
            />
          </View>
        </View>

        {/* Preferences Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences & Alerts</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Currency</Text>
            <View style={styles.currencyBox}>
              <Ionicons name="cash-outline" size={20} color={COLORS.green} />
              <Text style={styles.currencyBoxText}>UGX (Uganda Shilling)</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Low Stock Alert Threshold (Units)</Text>
            <TextInput
              style={styles.input}
              value={lowStockThreshold}
              onChangeText={setLowStockThreshold}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.card} />
            <Text style={styles.saveBtnText}>Save Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Account Action */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
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
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subHeader: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
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
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  currencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.greenBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  currencyBoxText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.green,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    borderRadius: 12,
    height: 48,
    gap: 6,
    marginTop: 8,
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
    borderRadius: 12,
    height: 48,
    gap: 6,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.red,
  },
});
