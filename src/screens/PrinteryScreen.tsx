import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

const PRINTERY_SERVICES = [
  { id: 'srv-1', name: 'Photocopy (B&W)', icon: 'copy-outline' as const, color: COLORS.blue },
  { id: 'srv-2', name: 'Printing (B&W)', icon: 'print-outline' as const, color: COLORS.purple },
  { id: 'srv-3', name: 'Printing (Color)', icon: 'color-palette-outline' as const, color: COLORS.amber },
  { id: 'srv-4', name: 'Scanning', icon: 'scan-outline' as const, color: COLORS.green },
  { id: 'srv-5', name: 'Other Service', icon: 'document-text-outline' as const, color: COLORS.textSecondary },
];

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export const PrinteryScreen = ({ navigation }: any) => {
  const { addTransaction, transactions, settings } = useAppStore();
  const [selectedService, setSelectedService] = useState<typeof PRINTERY_SERVICES[0] | null>(null);
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
      Alert.alert('Selection Error', 'Please select a printery service first.');
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
            setSelectedService(null);
          },
        },
      ]
    );
  }, [amount, selectedService, addTransaction, settings.currency]);

  return (
    <View style={styles.container}>
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

        {/* Section 1: Select Service */}
        <Text style={styles.sectionTitle}>Select Service</Text>

        <View style={styles.grid}>
          {PRINTERY_SERVICES.map((service) => {
            const isSelected = selectedService?.id === service.id;
            return (
              <Pressable
                key={service.id}
                style={({ pressed }) => [
                  styles.serviceCard,
                  isSelected && styles.serviceCardSelected,
                  isSelected && { borderColor: service.color },
                  pressed && styles.pressed,
                ]}
                onPress={() => setSelectedService(service)}
                accessibilityRole="button"
                accessibilityLabel={`${service.name} service`}
                accessibilityHint="Tap to select this service for cash entry"
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: isSelected ? service.color : service.color + '15' },
                  ]}
                >
                  <Ionicons
                    name={service.icon}
                    size={28}
                    color={isSelected ? COLORS.card : service.color}
                  />
                </View>
                <Text
                  style={[
                    styles.serviceName,
                    isSelected && { color: service.color, fontWeight: '700' },
                  ]}
                >
                  {service.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Section 2: Enter Amount & Preset Buttons */}
        {selectedService && (
          <View style={styles.paymentSection}>
            <View style={styles.selectedBanner}>
              <Ionicons name="checkmark-circle" size={18} color={selectedService.color} />
              <Text style={[styles.selectedBannerText, { color: selectedService.color }]}>
                Selected: {selectedService.name}
              </Text>
            </View>

            <Text style={styles.inputLabel}>Enter Amount ({settings.currency})</Text>

            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.textMuted}
              accessibilityLabel="Amount received"
              accessibilityHint="Type custom amount or select a quick preset below"
              autoFocus
            />

            {/* Quick Price Presets */}
            <Text style={styles.presetLabel}>Quick Presets:</Text>
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

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.recordBtn,
                pressed && styles.recordBtnPressed,
              ]}
              onPress={handleRecordIncome}
              accessibilityRole="button"
              accessibilityLabel={`Record ${settings.currency} ${amount || 0} for ${selectedService.name}`}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.card} />
              <Text style={styles.recordBtnText}>Record Cash Inflow</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
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
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 110,
    ...SHADOWS.small,
  },
  serviceCardSelected: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.green,
  },
  pressed: {
    opacity: 0.75,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  paymentSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.small,
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  selectedBannerText: {
    fontSize: 14,
    fontWeight: '700',
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
    height: 56,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    borderWidth: 1,
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
