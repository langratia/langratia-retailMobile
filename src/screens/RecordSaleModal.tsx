import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

export const RecordSaleModal = ({ navigation }: any) => {
  const { products, recordSale, settings } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 8;

  // 1. Available Stock Products (Memoized)
  const availableProducts = useMemo(
    () => products.filter((p) => p.quantity > 0),
    [products]
  );

  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    availableProducts[0]?.id || ''
  );

  // Filtered available products based on search query
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return availableProducts;
    const q = productSearch.toLowerCase();
    return availableProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [availableProducts, productSearch]);

  const [quantitySold, setQuantitySold] = useState<number>(1);
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const [customPrice, setCustomPrice] = useState<string>(
    selectedProduct ? selectedProduct.sellPrice.toString() : ''
  );
  const [isCredit, setIsCredit] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (selectedProduct) {
      setCustomPrice(selectedProduct.sellPrice.toString());
    }
  }, [selectedProductId, selectedProduct]);

  // Calculations (Memoized)
  const { currentPriceNum, totalSaleAmount, estimatedProfit } = useMemo(() => {
    const pNum = parseFloat(customPrice) || 0;
    const total = selectedProduct ? pNum * quantitySold : 0;
    const profit = selectedProduct
      ? (pNum - selectedProduct.buyPrice) * quantitySold
      : 0;

    return {
      currentPriceNum: pNum,
      totalSaleAmount: total,
      estimatedProfit: profit,
    };
  }, [customPrice, selectedProduct, quantitySold]);

  const handleConfirmSale = useCallback(() => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a product to record a sale.');
      return;
    }

    if (quantitySold > selectedProduct.quantity) {
      Alert.alert(
        'Insufficient Stock',
        `Only ${selectedProduct.quantity} units available in stock.`
      );
      return;
    }

    if (isNaN(currentPriceNum) || currentPriceNum < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid selling price.');
      return;
    }

    if (isCredit && !customerName.trim()) {
      Alert.alert('Customer Info Required', 'Please enter the customer name for credit sales.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const success = recordSale(
        selectedProduct.id,
        quantitySold,
        currentPriceNum,
        isCredit,
        customerName,
        customerPhone
      );
      setIsSubmitting(false);

      if (success) {
        Alert.alert(
          isCredit ? 'Credit Sale Recorded! 📝' : 'Sale Recorded! 🎉',
          isCredit
            ? `Sold ${quantitySold} unit(s) to ${customerName} on Credit. Outstanding: ${settings.currency} ${totalSaleAmount.toLocaleString()}.`
            : `Sold ${quantitySold} unit(s) of ${selectedProduct.name}. Stock updated and cashbook credited with ${settings.currency} ${totalSaleAmount.toLocaleString()}.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }, 400);
  }, [
    selectedProduct,
    quantitySold,
    currentPriceNum,
    isCredit,
    customerName,
    customerPhone,
    recordSale,
    settings.currency,
    totalSaleAmount,
    navigation,
  ]);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Modal Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Close modal"
        >
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Record Sale</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {availableProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.amber} />
            <Text style={styles.emptyTitle}>No Stock Available</Text>
            <Text style={styles.emptySub}>
              All products are currently out of stock. Please add stock before recording sales.
            </Text>
          </View>
        ) : (
          <>
            {/* Product Search & Selection Header */}
            <Text style={styles.label}>Select Product</Text>

            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search in-stock products..."
                placeholderTextColor={COLORS.textMuted}
                value={productSearch}
                onChangeText={setProductSearch}
                accessibilityLabel="Search product list"
              />
              {productSearch !== '' && (
                <Pressable onPress={() => setProductSearch('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Product Selection List */}
            <View style={styles.productList}>
              {filteredProducts.length === 0 ? (
                <Text style={styles.noSearchMatch}>No items match your search.</Text>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = p.id === selectedProductId;
                  return (
                    <Pressable
                      key={p.id}
                      style={({ pressed }) => [
                        styles.productCard,
                        isSelected && styles.productCardSelected,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => {
                        setSelectedProductId(p.id);
                        setQuantitySold(1);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${p.name}, Price: ${settings.currency} ${p.sellPrice}, ${p.quantity} units left`}
                      accessibilityHint="Selects this product for checkout"
                    >
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{p.name}</Text>
                        <Text style={styles.productSub}>
                          Unit Price: {settings.currency}{p.sellPrice.toLocaleString()} • {p.quantity} units left
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={24}
                        color={isSelected ? COLORS.green : COLORS.textMuted}
                      />
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* Checkout Section Card */}
            {selectedProduct && (
              <View style={styles.sectionCard}>
                {/* Custom Sell Price Field */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Selling Price per Unit ({settings.currency})</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>
                    Default cost: {settings.currency} {selectedProduct.buyPrice.toLocaleString()}
                  </Text>
                  <TextInput
                    style={styles.priceInput}
                    value={customPrice}
                    onChangeText={setCustomPrice}
                    keyboardType="decimal-pad"
                    placeholder="Enter selling price"
                    accessibilityLabel="Unit selling price"
                  />
                </View>

                {/* Payment Mode Selector */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Payment Type</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.paymentModeBtn,
                        !isCredit ? styles.cashActive : styles.inactiveMode,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => setIsCredit(false)}
                      accessibilityRole="button"
                      accessibilityLabel="Cash Sale payment mode"
                    >
                      <Text
                        style={[
                          styles.modeText,
                          { color: !isCredit ? COLORS.green : COLORS.textSecondary },
                        ]}
                      >
                        💵 Cash Sale
                      </Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.paymentModeBtn,
                        isCredit ? styles.creditActive : styles.inactiveMode,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => setIsCredit(true)}
                      accessibilityRole="button"
                      accessibilityLabel="Credit Sale payment mode"
                    >
                      <Text
                        style={[
                          styles.modeText,
                          { color: isCredit ? COLORS.amber : COLORS.textSecondary },
                        ]}
                      >
                        📝 Credit Sale (Debt)
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Credit Sale Customer Details */}
                {isCredit && (
                  <View style={{ marginBottom: 16, gap: 10 }}>
                    <View>
                      <Text style={styles.label}>Customer Name *</Text>
                      <TextInput
                        style={styles.textInput}
                        value={customerName}
                        onChangeText={setCustomerName}
                        placeholder="e.g. John Kampala"
                        placeholderTextColor={COLORS.textMuted}
                        accessibilityLabel="Customer name"
                      />
                    </View>
                    <View>
                      <Text style={styles.label}>Customer Phone Number (Optional)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={customerPhone}
                        onChangeText={setCustomerPhone}
                        keyboardType="phone-pad"
                        placeholder="e.g. 0770000000"
                        placeholderTextColor={COLORS.textMuted}
                        accessibilityLabel="Customer phone number"
                      />
                    </View>
                  </View>
                )}

                {/* Quantity Stepper & Quick Increment Chips */}
                <Text style={styles.label}>Quantity Sold</Text>
                <View style={styles.qtyRow}>
                  <Pressable
                    style={({ pressed }) => [styles.qtyBtn, pressed && styles.pressed]}
                    onPress={() => setQuantitySold(Math.max(1, quantitySold - 1))}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease quantity"
                  >
                    <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
                  </Pressable>

                  <Text style={styles.qtyText}>{quantitySold}</Text>

                  <Pressable
                    style={({ pressed }) => [styles.qtyBtn, pressed && styles.pressed]}
                    onPress={() =>
                      setQuantitySold(
                        Math.min(selectedProduct.quantity, quantitySold + 1)
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Increase quantity"
                  >
                    <Ionicons name="add" size={20} color={COLORS.textPrimary} />
                  </Pressable>
                </View>

                {/* Quick Quantity Presets */}
                <View style={styles.qtyPresetRow}>
                  {[1, 2, 5].map((addQty) => (
                    <Pressable
                      key={addQty}
                      style={({ pressed }) => [styles.qtyChip, pressed && styles.pressed]}
                      onPress={() =>
                        setQuantitySold(Math.min(selectedProduct.quantity, addQty))
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Set quantity to ${addQty}`}
                    >
                      <Text style={styles.qtyChipText}>Set to {addQty}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* Calculation Summary Box */}
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Sale Amount:</Text>
                    <Text style={styles.summaryValue}>
                      {settings.currency}{totalSaleAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Estimated Net Profit:</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.green }]}>
                      +{settings.currency}{estimatedProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </Text>
                  </View>
                </View>

                {/* Confirm Sale Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.confirmBtn,
                    (isSubmitting || pressed) && { opacity: 0.8 },
                  ]}
                  onPress={handleConfirmSale}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel="Complete sale transaction"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={COLORS.card} />
                  ) : (
                    <>
                      <Ionicons name="cart-outline" size={22} color={COLORS.card} />
                      <Text style={styles.confirmBtnText}>Complete Sale</Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  noSearchMatch: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  productList: {
    gap: 8,
    marginBottom: 24,
    maxHeight: 260,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  productCardSelected: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenBg,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  productSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    ...SHADOWS.small,
  },
  priceInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  paymentModeBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cashActive: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
  },
  creditActive: {
    backgroundColor: COLORS.amberBg,
    borderColor: COLORS.amber,
  },
  inactiveMode: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.divider,
  },
  modeText: {
    fontWeight: '700',
    fontSize: 13,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 10,
  },
  qtyBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  qtyPresetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  qtyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  qtyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  summaryBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    borderRadius: 14,
    height: 52,
    gap: 8,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.card,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  pressed: {
    opacity: 0.8,
  },
});
