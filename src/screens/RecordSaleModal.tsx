import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

export const RecordSaleModal = ({ navigation }: any) => {
  const { products, recordSale, settings } = useAppStore();

  const availableProducts = products.filter((p) => p.quantity > 0);

  const [selectedProductId, setSelectedProductId] = useState<string>(
    availableProducts[0]?.id || ''
  );
  const [quantitySold, setQuantitySold] = useState<number>(1);
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const [customPrice, setCustomPrice] = useState<string>(
    selectedProduct ? selectedProduct.sellPrice.toString() : ''
  );

  useEffect(() => {
    if (selectedProduct) {
      setCustomPrice(selectedProduct.sellPrice.toString());
    }
  }, [selectedProductId]);

  const handleConfirmSale = () => {
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

    const priceNum = parseFloat(customPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid selling price.');
      return;
    }

    const success = recordSale(selectedProduct.id, quantitySold, priceNum);
    if (success) {
      Alert.alert(
        'Sale Recorded! 🎉',
        `Sold ${quantitySold} unit(s) of ${selectedProduct.name}. Stock updated and cashbook credited with ${settings.currency} ${(priceNum * quantitySold).toFixed(2)}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const currentPriceNum = parseFloat(customPrice) || 0;
  const totalSaleAmount = selectedProduct ? currentPriceNum * quantitySold : 0;
  const estimatedProfit = selectedProduct
    ? (currentPriceNum - selectedProduct.buyPrice) * quantitySold
    : 0;

  return (
    <View style={styles.container}>
      {/* Modal Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Sale</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            {/* Product Selection List */}
            <Text style={styles.label}>Select Product</Text>
            <View style={styles.productList}>
              {availableProducts.map((p) => {
                const isSelected = p.id === selectedProductId;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.productCard,
                      isSelected && styles.productCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedProductId(p.id);
                      setQuantitySold(1);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{p.name}</Text>
                      <Text style={styles.productSub}>
                        Unit Price: {settings.currency}{p.sellPrice.toFixed(2)} • {p.quantity} units left
                      </Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={isSelected ? COLORS.green : COLORS.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quantity Selector */}
            {selectedProduct && (
              <View style={styles.sectionCard}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Selling Price per Unit ({settings.currency})</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>
                    Buying price: {settings.currency} {selectedProduct.buyPrice}
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: COLORS.inputBg,
                      borderRadius: 10,
                      paddingHorizontal: 14,
                      height: 48,
                      fontSize: 16,
                      fontWeight: '600',
                      color: COLORS.textPrimary,
                      borderWidth: 1,
                      borderColor: COLORS.divider,
                    }}
                    value={customPrice}
                    onChangeText={setCustomPrice}
                    keyboardType="decimal-pad"
                    placeholder="Enter selling price"
                  />
                </View>

                <Text style={styles.label}>Quantity Sold</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantitySold(Math.max(1, quantitySold - 1))}
                  >
                    <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
                  </TouchableOpacity>

                  <Text style={styles.qtyText}>{quantitySold}</Text>

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() =>
                      setQuantitySold(
                        Math.min(selectedProduct.quantity, quantitySold + 1)
                      )
                    }
                  >
                    <Ionicons name="add" size={20} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Calculation Summary Box */}
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Sale Amount:</Text>
                    <Text style={styles.summaryValue}>
                      {settings.currency}{totalSaleAmount.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Estimated Net Profit:</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.green }]}>
                      +{settings.currency}{estimatedProfit.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Confirm Sale Button */}
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmSale}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cart-outline" size={22} color={COLORS.card} />
                  <Text style={styles.confirmBtnText}>Complete Sale</Text>
                </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  productList: {
    gap: 10,
    marginBottom: 24,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
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
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 12,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
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
});
