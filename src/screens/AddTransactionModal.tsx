import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { TransactionType } from '../types';
import { COLORS, SHADOWS } from '../theme/theme';

import { SuccessModal } from '../components/SuccessModal';

const PRESET_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

export const AddTransactionModal = ({ route, navigation }: any) => {
  const defaultType: TransactionType = route.params?.defaultType || 'income';
  const { addTransaction, settings } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 8;

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState('');
  const [descError, setDescError] = useState('');
  // AT-01: Maintain separate category state per transaction type so toggling
  // type does not wipe the user's previously selected category.
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState(
    defaultType === 'income' ? 'Sales' : 'Sales'
  );
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState(
    defaultType === 'expense' ? 'Rent' : 'Rent'
  );

  // Computed category = the one for the currently active type
  const category = type === 'income' ? selectedIncomeCategory : selectedExpenseCategory;
  const setCategory = (cat: string) => {
    if (type === 'income') setSelectedIncomeCategory(cat);
    else setSelectedExpenseCategory(cat);
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ title: string; subtitle: string; amount: string; isExpense: boolean }>({
    title: '',
    subtitle: '',
    amount: '',
    isExpense: false,
  });

  const incomeCategories = useMemo(
    () => ['Sales', 'Services', 'Investments', 'Printery Services', 'Other Income'],
    []
  );

  const expenseCategories = useMemo(
    () => ['Rent', 'Utilities', 'Stock Purchase', 'Salaries', 'Transport', 'Other Expense'],
    []
  );

  const categories = useMemo(
    () => (type === 'income' ? incomeCategories : expenseCategories),
    [type, incomeCategories, expenseCategories]
  );

  const handleSave = useCallback(() => {
    let isValid = true;
    setAmountError('');
    setDescError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Please enter a valid positive transaction amount.');
      isValid = false;
    }
    if (!description.trim()) {
      setDescError('Please enter a description for this transaction.');
      isValid = false;
    }

    if (!isValid) return;

    addTransaction({
      type,
      amount: numAmount,
      description,
      category,
    });

    const isExp = type === 'expense';
    setSuccessInfo({
      title: isExp ? 'Expense Logged' : 'Income Recorded',
      subtitle: `${description} (${category}) recorded to cashbook.`,
      amount: `${isExp ? '-' : '+'}${settings.currency} ${numAmount.toLocaleString()}`,
      isExpense: isExp,
    });
    setShowSuccessModal(true);
  }, [amount, description, type, category, addTransaction, settings.currency]);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Modal Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Close transaction modal"
        >
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        {/* AT-02: Removed duplicate header Save button — the full-width body button is the sole submit action */}
        <View style={{ width: 26 }} />
      </View>

      {/* PS-03: behavior='height' for Android prevents keyboard obscuring amount input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Income / Expense Toggle Switch */}
        <View style={styles.toggleRow}>
          <Pressable
            style={({ pressed }) => [
              styles.toggleBtn,
              type === 'income' && styles.incomeActive,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              setType('income');
              // AT-01: switching to income restores the previously selected income category
            }}
            accessibilityRole="button"
            accessibilityLabel="Income Inflow transaction type"
          >
            <Ionicons
              name="download-outline"
              size={20}
              color={type === 'income' ? COLORS.green : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                type === 'income' && { color: COLORS.green, fontWeight: '700' },
              ]}
            >
              Income Inflow (+)
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.toggleBtn,
              type === 'expense' && styles.expenseActive,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              setType('expense');
              // AT-01: switching to expense restores the previously selected expense category
            }}
            accessibilityRole="button"
            accessibilityLabel="Expense Outflow transaction type"
          >
            <Ionicons
              name="arrow-up-circle-outline"
              size={20}
              color={type === 'expense' ? COLORS.red : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                type === 'expense' && { color: COLORS.red, fontWeight: '700' },
              ]}
            >
              Expense Outflow (-)
            </Text>
          </Pressable>
        </View>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount ({settings.currency})</Text>
          <TextInput
            style={[styles.amountInput, amountError ? styles.inputError : null]}
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              if (amountError) setAmountError('');
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor={COLORS.textMuted}
            accessibilityLabel="Transaction amount"
          />
          {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
        </View>

        {/* Quick Amount Presets */}
        <View style={styles.presetSection}>
          <Text style={styles.presetLabel}>Quick Presets:</Text>
          <View style={styles.presetsRow}>
            {PRESET_AMOUNTS.map((preset) => {
              const isPresetSelected = amount === preset.toString();
              return (
                <Pressable
                  key={preset}
                  style={({ pressed }) => [
                    styles.presetChip,
                    isPresetSelected && (type === 'income' ? styles.incomePresetActive : styles.expensePresetActive),
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setAmount(preset.toString())}
                  accessibilityRole="button"
                  accessibilityLabel={`Preset amount ${preset} ${settings.currency}`}
                >
                  <Text
                    style={[
                      styles.presetText,
                      isPresetSelected && { color: type === 'income' ? COLORS.green : COLORS.red, fontWeight: '800' },
                    ]}
                  >
                    {preset >= 1000 ? `${preset / 1000}k` : preset}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder={type === 'income' ? 'e.g. Cash Sale / Service Charge' : 'e.g. Shop Rent / Electricity'}
            placeholderTextColor={COLORS.textMuted}
            accessibilityLabel="Transaction description"
          />
        </View>

        {/* Category Chips */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => {
              const isSelected = category === cat;
              return (
                <Pressable
                  key={cat}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    isSelected && (type === 'income' ? styles.incomeChipActive : styles.expenseChipActive),
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setCategory(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={`Category ${cat}`}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && {
                        color: type === 'income' ? COLORS.green : COLORS.red,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Form Body Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveBodyBtn,
            { backgroundColor: type === 'income' ? COLORS.green : COLORS.red },
            pressed && styles.saveBodyBtnPressed,
          ]}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel={`Save ${type === 'income' ? 'Income' : 'Expense'} transaction`}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.card} />
          <Text style={styles.saveBodyBtnText}>
            Record {type === 'income' ? 'Income Inflow' : 'Expense Outflow'}
          </Text>
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Tactile Success Pop Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title={successInfo.title}
        subtitle={successInfo.subtitle}
        amount={successInfo.amount}
        badgeText={successInfo.isExpense ? 'Cashbook Expense Logged' : 'Cashbook Inflow Logged'}
        iconName={successInfo.isExpense ? 'receipt' : 'cash'}
        iconColor={successInfo.isExpense ? COLORS.red : COLORS.green}
        primaryBtnText="Done"
        onPrimaryPress={() => navigation.goBack()}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />
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
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  saveHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  saveHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.green,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 6,
    ...SHADOWS.small,
  },
  incomeActive: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
  },
  expenseActive: {
    backgroundColor: COLORS.redBg,
    borderColor: COLORS.red,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  presetSection: {
    marginBottom: 20,
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
    flexWrap: 'wrap',
  },
  presetChip: {
    flex: 1,
    minWidth: 54,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  incomePresetActive: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
  },
  expensePresetActive: {
    backgroundColor: COLORS.redBg,
    borderColor: COLORS.red,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
    justifyContent: 'center',
  },
  incomeChipActive: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
  },
  expenseChipActive: {
    backgroundColor: COLORS.redBg,
    borderColor: COLORS.red,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  saveBodyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    height: 52,
    gap: 8,
    marginTop: 8,
    ...SHADOWS.small,
  },
  saveBodyBtnPressed: {
    opacity: 0.85,
  },
  saveBodyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.card,
  },
  pressed: {
    opacity: 0.7,
  },
  inputError: {
    borderColor: COLORS.red,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 12,
    marginTop: 4,
  },
});
