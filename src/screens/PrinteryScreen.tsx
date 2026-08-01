import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

export const PrinteryScreen = ({ navigation }: any) => {
  const { addTransaction, settings } = useAppStore();
  const [selectedService, setSelectedService] = useState<typeof PRINTERY_SERVICES[0] | null>(null);
  const [amount, setAmount] = useState('');

  const handleRecordIncome = () => {
    const numAmount = parseFloat(amount);
    if (!selectedService) {
      Alert.alert('Selection Error', 'Please select a service first.');
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
      [{ text: 'OK', onPress: () => {
        setAmount('');
        setSelectedService(null);
      } }]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Printery POS"
        showNotification={false}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Select Service</Text>
        
        <View style={styles.grid}>
          {PRINTERY_SERVICES.map((service) => {
            const isSelected = selectedService?.id === service.id;
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  isSelected && styles.serviceCardSelected,
                  isSelected && { borderColor: service.color }
                ]}
                onPress={() => setSelectedService(service)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: isSelected ? service.color : service.color + '15' }]}>
                  <Ionicons name={service.icon} size={28} color={isSelected ? COLORS.card : service.color} />
                </View>
                <Text style={[styles.serviceName, isSelected && { color: service.color, fontWeight: '700' }]}>
                  {service.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedService && (
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Enter Amount Received</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount ({settings.currency})</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.textMuted}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={styles.recordBtn}
              onPress={handleRecordIncome}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.card} />
              <Text style={styles.recordBtnText}>Record Cash Inflow</Text>
            </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
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
    ...SHADOWS.small,
  },
  serviceCardSelected: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.green,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 14,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 60,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
    textAlign: 'center',
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
  recordBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.card,
  },
});
