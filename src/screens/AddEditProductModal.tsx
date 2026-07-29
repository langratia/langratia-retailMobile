import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { ProductCategory } from '../types';
import { COLORS } from '../theme/theme';

export const AddEditProductModal = ({ route, navigation }: any) => {
  const existingProduct = route.params?.product;
  const isEditing = !!existingProduct;

  const { addProduct, updateProduct, settings } = useAppStore();

  const [name, setName] = useState(existingProduct?.name || '');
  const [category, setCategory] = useState<ProductCategory>(
    existingProduct?.category || 'Smartphones'
  );
  const [buyPrice, setBuyPrice] = useState(
    existingProduct ? existingProduct.buyPrice.toString() : ''
  );
  const [sellPrice, setSellPrice] = useState(
    existingProduct ? existingProduct.sellPrice.toString() : ''
  );
  const [quantity, setQuantity] = useState(
    existingProduct ? existingProduct.quantity.toString() : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: ProductCategory[] = ['Smartphones', 'Feature Phones', 'Accessories', 'Audio', 'Storage', 'Wearables', 'Electronics', 'General'];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a product name.');
      return;
    }
    const bPrice = parseFloat(buyPrice);
    const sPrice = sellPrice.trim() ? parseFloat(sellPrice) : bPrice;
    const qty = parseInt(quantity, 10);

    if (isNaN(bPrice) || isNaN(qty)) {
      Alert.alert('Validation Error', 'Please enter valid numerical values for Buying Price and Quantity.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (isEditing) {
        updateProduct(existingProduct.id, {
          name,
          category,
          buyPrice: bPrice,
          sellPrice: sPrice,
          quantity: qty,
        });
      } else {
        addProduct({
          name,
          category,
          buyPrice: bPrice,
          sellPrice: sPrice,
          quantity: qty,
        });
      }
      setIsSubmitting(false);

      Alert.alert(
        'Success! 🎉',
        isEditing ? `${name} updated successfully!` : `${name} added to inventory!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 400);
  };

  return (
    <View style={styles.container}>
      {/* Modal Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Samsung A16 (128GB)"
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
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prices Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Buying Price ({settings.currency})</Text>
            <TextInput
              style={styles.input}
              value={buyPrice}
              onChangeText={setBuyPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Default Sell Price (Optional)</Text>
            <TextInput
              style={styles.input}
              value={sellPrice}
              onChangeText={setSellPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Initial Stock Quantity (Units)</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="0"
            keyboardType="number-pad"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Primary Save Button inside form body */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.green,
            borderRadius: 14,
            height: 52,
            gap: 8,
            marginTop: 12,
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.card} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.card} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.card }}>
                {isEditing ? 'Update Product' : 'Save Product'}
              </Text>
            </>
          )}
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
  saveHeaderBtn: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.green,
  },
  scrollContent: {
    padding: 20,
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
  categoryChipActive: {
    backgroundColor: COLORS.blueBg,
    borderColor: COLORS.blue,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.blue,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
