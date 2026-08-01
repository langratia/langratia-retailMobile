import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

const PRINTERY_SERVICES = [
  { id: 'srv-1', name: 'Photocopying', icon: 'copy-outline' as const, color: COLORS.blue },
  { id: 'srv-2', name: 'Printing', icon: 'print-outline' as const, color: COLORS.purple },
  { id: 'srv-3', name: 'Scanning', icon: 'scan-outline' as const, color: COLORS.green },
];

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export const PrinteryScreen = ({ navigation }: any) => {
  const { addTransaction, transactions, settings } = useAppStore();
  const [selectedService, setSelectedService] = useState<typeof PRINTERY_SERVICES[0]>(PRINTERY_SERVICES[0]);
  const [amount, setAmount] = useState('');

  // Calculate today's total printery income (Memoized)
  const todayPrinteryIncome = useMemo(() => {
    const todayFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return transactions
      .filter(
        (tx) =>
          tx.type === 'income' &&
          tx.category === 'Printery Services' &&
          (tx.date === 'Today' || tx.date === todayFormatted)
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const handleRecordIncome = useCallback(() => {
    const numAmount = parseFloat(amount);
    if (!selectedService) {
      Alert.alert('Selection Error', 'Please select a service (Photocopying, Printing, or Scanning).');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount.');
      return;
    }

    addTransaction({
      type: 'income',
      amount: numAmount,
      description: `Printery: ${selectedService.name}`,
      category: 'Printery Services',
    });

    Alert.alert(
      'Success! 🎉',
      `${settings.currency} ${numAmount.toLocaleString()} recorded for ${selectedService.name}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setAmount('');
          },
        },
      ]
    );
  }, [amount, selectedService, addTransaction, settings.currency]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Printery POS" showNotification={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Printery Performance Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTitleRow}>
            <Ionicons name="print" size={20} color={COLORS.purple} />
            <Text style={styles.summaryTitle}>Today's Printery Revenue</Text>
          </View>
          <Text style={styles.summaryAmount}>
            {settings.currency} {todayPrinteryIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </Text>
          <Text style={styles.summarySub}>Logged today under Printery Services</Text>
        </View>

        {/* Primary Input & Action Card (Prominently Visible at Top) */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionLabel}>Select Service</Text>
          
          {/* 3 Main Services Segmented Bar */}
          <View style={styles.servicesRow}>
            {PRINTERY_SERVICES.map((service) => {
              const isSelected = selectedService.id === service.id;
              return (
                <Pressable
                  key={service.id}
                  style={({ pressed }) => [
                    styles.serviceTab,
                    isSelected && [styles.serviceTabActive, { borderColor: service.color }],
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setSelectedService(service)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${service.name}`}
                >
                  <Ionicons
                    name={service.icon}
                    size={20}
                    color={isSelected ? service.color : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.serviceTabText,
                      isSelected && [styles.serviceTabTextActive, { color: service.color }],
                    ]}
                  >
                    {service.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Prominent Amount Input Box */}
          <Text style={styles.inputLabel}>
            Enter Amount ({settings.currency}) for <Text style={{ color: selectedService.color, fontWeight: '700' }}>{selectedService.name}</Text>
          </Text>

          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor={COLORS.textMuted}
            accessibilityLabel="Amount received input"
          />

          {/* Quick Price Presets */}
          <Text style={styles.presetLabel}>Quick Presets ({settings.currency}):</Text>
          <View style={styles.presetsRow}>
            {PRESET_AMOUNTS.map((preset) => {
              const isPresetSelected = amount === preset.toString();
              return (
                <Pressable
                  key={preset}
                  style={({ pressed }) => [
                    styles.presetChip,
                    isPresetSelected && styles.presetChipActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setAmount(preset.toString())}
                  accessibilityRole="button"
                  accessibilityLabel={`${preset} ${settings.currency} preset`}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      isPresetSelected && styles.presetChipTextActive,
                    ]}
                  >
                    {preset >= 1000 ? `${preset / 1000}k` : preset}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Record Money Button */}
          <Pressable
            style={({ pressed }) => [
              styles.recordBtn,
              pressed && styles.recordBtnPressed,
            ]}
            onPress={handleRecordIncome}
            accessibilityRole="button"
            accessibilityLabel={`Record ${settings.currency} ${amount || 0} for ${selectedService.name}`}
          >
            <Ionicons name="checkmark-circle" size={24} color={COLORS.card} />
            <Text style={styles.recordBtnText}>Record Printer Money</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: COLORS.purpleBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    ...SHADOWS.small,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.purple,
    textTransform: 'uppercase',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  summarySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  paymentSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    ...SHADOWS.small,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servicesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  serviceTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceTabActive: {
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  serviceTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  serviceTabTextActive: {
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 58,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    textAlign: 'center',
    marginBottom: 16,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  presetChip: {
    flex: 1,
    minWidth: 54,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  presetChipActive: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  presetChipTextActive: {
    color: COLORS.green,
    fontWeight: '800',
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    borderRadius: 14,
    height: 56,
    gap: 8,
    ...SHADOWS.medium,
  },
  recordBtnPressed: {
    opacity: 0.85,
  },
  recordBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.card,
  },
});
