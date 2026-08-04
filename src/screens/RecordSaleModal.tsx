import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { SuccessModal } from '../components/SuccessModal';

export const RecordSaleModal = ({ navigation }: any) => {
  const { products, recordSale, settings } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 8;

  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{
    title: string;
    subtitle: string;
    amount: string;
    badgeText: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
  }>({
    title: '',
    subtitle: '',
    amount: '',
    badgeText: '',
    iconName: 'checkmark-circle',
    iconColor: COLORS.green,
  });

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

  const [quantitySold, setQuantitySold] = useState<string>('1');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isCredit, setIsCredit] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [productError, setProductError] = useState('');
  const [qtyError, setQtyError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [customerError, setCustomerError] = useState('');

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  // RS-03: depend only on selectedProductId so the effect doesn't fire when the
  // product object reference changes (e.g. after a stock adjustment).
  useEffect(() => {
    if (selectedProduct) {
      setCustomPrice(selectedProduct.sellPrice.toString());
    }
  }, [selectedProductId]); // eslint-disable-line react-hooks/exhaustive-deps

  const { currentPriceNum, totalSaleAmount, estimatedProfit } = useMemo(() => {
    const pNum = parseFloat(customPrice) || 0;
    const qNum = parseInt(quantitySold, 10) || 0;
    const total = selectedProduct ? pNum * qNum : 0;
    const profit = selectedProduct
      ? (pNum - selectedProduct.buyPrice) * qNum
      : 0;

    return {
      currentPriceNum: pNum,
      totalSaleAmount: total,
      estimatedProfit: profit,
    };
  }, [customPrice, selectedProduct, quantitySold]);

  const handleConfirmSale = useCallback(() => {
    let isValid = true;
    setProductError('');
    setQtyError('');
    setPriceError('');
    setCustomerError('');

    if (!selectedProduct) {
      setProductError('Please select a product.');
      isValid = false;
    }

    const qty = parseInt(quantitySold, 10);
    if (!selectedProduct || isNaN(qty) || qty <= 0 || qty > selectedProduct.quantity) {
      setQtyError(`Enter quantity (1-${selectedProduct?.quantity || 0}).`);
      isValid = false;
    }

    if (isNaN(currentPriceNum) || currentPriceNum < 0) {
      setPriceError('Enter valid price.');
      isValid = false;
    }

    if (isCredit && !customerName.trim()) {
      setCustomerError('Customer name required for credit.');
      isValid = false;
    }

    if (!isValid) return;

    // RS-01: recordSale is a synchronous Zustand action — removed fake async delay.
    const success = recordSale(
      selectedProduct!.id,
      qty,
      currentPriceNum,
      isCredit,
      customerName,
      customerPhone
    );

    if (success) {
      setSuccessInfo({
        title: isCredit ? 'Credit Sale Logged' : 'Sale Completed',
        subtitle: isCredit
          ? `Sold ${qty} unit(s) to ${customerName} on Credit.`
          : `Sold ${qty} unit(s) of ${selectedProduct!.name}. Inventory & Cashbook updated!`,
        amount: `+${settings.currency} ${totalSaleAmount.toLocaleString()}`,
        badgeText: isCredit ? 'CREDIT DEBT LOGGED' : 'CASHBOOK CREDITED',
        iconName: isCredit ? 'document-text' : 'checkmark-circle',
        iconColor: isCredit ? COLORS.amber : COLORS.green,
      });
      setShowSuccessModal(true);
    }
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
  ]);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
        >
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Record Sale</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* PS-03: 'height' on Android keeps the amount input visible above the keyboard */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {availableProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.amber} />
            <Text style={styles.emptyTitle}>No Stock Available</Text>
          </View>
        ) : (
          <>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Product</Text>
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={productSearch}
                    onChangeText={(t) => { setProductSearch(t); setProductError(''); }}
                  />
                </View>
                {productError ? <Text style={styles.errorText}>{productError}</Text> : null}
            </View>

            <View style={styles.productList}>
              {availableProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map((p) => {
                  const isSelected = p.id === selectedProductId;
                  return (
                    <Pressable
                      key={p.id}
                      style={[styles.productCard, isSelected && styles.productCardSelected, productError && styles.inputError]}
                      onPress={() => { setSelectedProductId(p.id); setProductError(''); }}
                    >
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{p.name}</Text>
                        <Text style={styles.productSub}>{p.quantity} left</Text>
                      </View>
                      <Ionicons name={isSelected ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={isSelected ? COLORS.green : COLORS.textMuted} />
                    </Pressable>
                  );
                })}
            </View>

            {selectedProduct && (
              <View style={styles.sectionCard}>
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Qty</Text>
                        <TextInput
                            style={[styles.input, qtyError ? styles.inputError : null]}
                            value={quantitySold}
                            onChangeText={(t) => { setQuantitySold(t); setQtyError(''); }}
                            keyboardType="number-pad"
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Price</Text>
                        <TextInput
                            style={[styles.input, priceError ? styles.inputError : null]}
                            value={customPrice}
                            onChangeText={(t) => { setCustomPrice(t); setPriceError(''); }}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>
                {qtyError || priceError ? <Text style={styles.errorText}>{qtyError || priceError}</Text> : null}

                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Payment Type</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable style={[styles.paymentModeBtn, !isCredit ? styles.cashActive : styles.inactiveMode]} onPress={() => setIsCredit(false)}>
                      <Text style={[styles.modeText, { color: !isCredit ? COLORS.green : COLORS.textSecondary }]}>Cash</Text>
                    </Pressable>
                    <Pressable style={[styles.paymentModeBtn, isCredit ? styles.creditActive : styles.inactiveMode]} onPress={() => setIsCredit(true)}>
                      <Text style={[styles.modeText, { color: isCredit ? COLORS.amber : COLORS.textSecondary }]}>Credit</Text>
                    </Pressable>
                  </View>
                </View>

                {isCredit && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Customer Name</Text>
                    <TextInput
                      style={[styles.textInput, customerError ? styles.inputError : null]}
                      value={customerName}
                      onChangeText={(t) => { setCustomerName(t); setCustomerError(''); }}
                    />
                    {customerError ? <Text style={styles.errorText}>{customerError}</Text> : null}
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.8 }]}
                  onPress={handleConfirmSale}
                  accessibilityRole="button"
                  accessibilityLabel="Complete sale"
                >
                  <Text style={styles.confirmBtnText}>Complete Sale</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccessModal}
        title={successInfo.title}
        subtitle={successInfo.subtitle}
        amount={successInfo.amount}
        badgeText={successInfo.badgeText}
        iconName={successInfo.iconName}
        iconColor={successInfo.iconColor}
        primaryBtnText="Done"
        onPrimaryPress={() => navigation.goBack()}
        onClose={() => { setShowSuccessModal(false); navigation.goBack(); }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: COLORS.card, borderBottomWidth: 1, borderColor: COLORS.divider },
  closeBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  scrollContent: { padding: 20, paddingBottom: 110 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  inputGroup: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, color: COLORS.textPrimary },
  productList: { gap: 8, marginBottom: 24, maxHeight: 260 },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.divider },
  productCardSelected: { borderColor: COLORS.green, backgroundColor: COLORS.greenBg },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  productSub: { fontSize: 12, color: COLORS.textSecondary },
  sectionCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 18, ...SHADOWS.small },
  input: { backgroundColor: COLORS.inputBg, borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 16, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.divider },
  textInput: { backgroundColor: COLORS.inputBg, borderRadius: 10, paddingHorizontal: 14, height: 44, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.divider },
  paymentModeBtn: { flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cashActive: { backgroundColor: COLORS.greenBg, borderColor: COLORS.green },
  creditActive: { backgroundColor: COLORS.amberBg, borderColor: COLORS.amber },
  inactiveMode: { backgroundColor: COLORS.inputBg, borderColor: COLORS.divider },
  modeText: { fontWeight: '700', fontSize: 13 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.green, borderRadius: 14, height: 52 },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  emptyContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  pressed: { opacity: 0.7 },
  inputError: { borderColor: COLORS.red },
  errorText: { color: COLORS.red, fontSize: 12, marginTop: 4 },
});
