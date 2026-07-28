import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { Badge } from '../components/Badge';

export const ProductDetailsModal = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { products, settings, adjustStock, deleteProduct } = useAppStore();

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Product not found.</Text>
      </View>
    );
  }

  const marginPerUnit = product.sellPrice - product.buyPrice;
  const totalCost = product.quantity * product.buyPrice;
  const totalRevenue = product.quantity * product.sellPrice;

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProduct(product.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={handleDelete} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={22} color={COLORS.red} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Product Card */}
        <View style={styles.mainCard}>
          <View style={styles.iconBox}>
            <Ionicons
              name={product.category === 'Smartphones' ? 'phone-portrait-outline' : 'cube-outline'}
              size={36}
              color={COLORS.blue}
            />
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.categoryText}>Category: {product.category}</Text>
          
          <View style={{ marginTop: 10 }}>
            <Badge quantity={product.quantity} lowStockThreshold={settings.lowStockThreshold} />
          </View>
        </View>

        {/* Pricing & Stock Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Financials & Inventory</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Buying Price (Cost):</Text>
            <Text style={styles.rowValue}>{settings.currency}{product.buyPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Selling Price:</Text>
            <Text style={styles.rowValue}>{settings.currency}{product.sellPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Profit Margin Per Unit:</Text>
            <Text style={[styles.rowValue, { color: COLORS.green }]}>
              +{settings.currency}{marginPerUnit.toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Current Quantity:</Text>
            <Text style={styles.rowValue}>{product.quantity} units</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Stock Value (Cost):</Text>
            <Text style={[styles.rowValue, { color: COLORS.purple }]}>
              {settings.currency}{totalCost.toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Potential Stock Revenue:</Text>
            <Text style={[styles.rowValue, { color: COLORS.blue }]}>
              {settings.currency}{totalRevenue.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.greenBg, borderColor: COLORS.green }]}
            onPress={() => adjustStock(product.id, 1)}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.green} />
            <Text style={[styles.actionText, { color: COLORS.green }]}>Add 1 Unit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.redBg, borderColor: COLORS.red }]}
            onPress={() => adjustStock(product.id, -1)}
          >
            <Ionicons name="remove-circle-outline" size={20} color={COLORS.red} />
            <Text style={[styles.actionText, { color: COLORS.red }]}>Remove 1 Unit</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AddEditProduct', { product })}
        >
          <Ionicons name="pencil" size={18} color={COLORS.card} />
          <Text style={styles.editBtnText}>Edit Product</Text>
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
  scrollContent: {
    padding: 20,
  },
  emptyText: {
    padding: 20,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  mainCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.small,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    gap: 12,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    height: 50,
    gap: 8,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.card,
  },
});
