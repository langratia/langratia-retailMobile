import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { TransactionType } from '../types';
import { COLORS } from '../theme/theme';

export const AddTransactionModal = ({ route, navigation }: any) => {
  const defaultType: TransactionType = route.params?.defaultType || 'income';
  const { addTransaction, settings } = useAppStore();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(type === 'income' ? 'Sales' : 'Rent');

  const incomeCategories = ['Sales', 'Services', 'Investments', 'Other Income'];
  const expenseCategories = ['Rent', 'Utilities', 'Stock Purchase', 'Salaries', 'Other Expense'];

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive transaction amount.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description for this transaction.');
      return;
    }

    addTransaction({
      type,
      amount: numAmount,
      description,
      category,
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Modal Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
          <Text style={styles.saveHeaderBtn}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Income / Expense Toggle Switch */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              type === 'income' && styles.incomeActive,
            ]}
            onPress={() => {
              setType('income');
              setCategory('Sales');
            }}
          >
            <Ionicons
              name="download-outline"
              size={18}
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
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              type === 'expense' && styles.expenseActive,
            ]}
            onPress={() => {
              setType('expense');
              setCategory('Rent');
            }}
          >
            <Ionicons
              name="upload-outline"
              size={18}
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
          </TouchableOpacity>
        </View>

        {/* Amount */}
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

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder={type === 'income' ? 'e.g. Cash Sale' : 'e.g. Shop Rent'}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && (type === 'income' ? styles.incomeChipActive : styles.expenseChipActive),
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && { color: type === 'income' ? COLORS.green : COLORS.red, fontWeight: '700' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  saveHeaderBtn: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.green,
  },
  scrollContent: {
    padding: 20,
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
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 6,
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
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
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
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
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
});
