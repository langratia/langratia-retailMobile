import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { ProductItemCard } from '../components/ProductItemCard';

export const InventoryScreen = ({ route, navigation }: any) => {
  const { products, settings, adjustStock } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(
    route?.params?.filterLowStock ? 'Low Stock' : 'All'
  );
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'price'>('name');

  const toggleSort = () => {
    if (sortBy === 'name') setSortBy('quantity');
    else if (sortBy === 'quantity') setSortBy('price');
    else setSortBy('name');
  };

  React.useEffect(() => {
    if (route?.params?.filterLowStock) {
      setCategoryFilter('Low Stock');
    }
  }, [route?.params?.filterLowStock]);

  // Stats Computations
  const totalProductsCount = products.length;
  const totalUnitsCount = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.quantity * p.buyPrice,
    0
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (categoryFilter === 'Low Stock') {
      matchesCategory = p.quantity <= settings.lowStockThreshold;
    } else if (categoryFilter !== 'All') {
      matchesCategory = p.category === categoryFilter;
    }

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'quantity') return b.quantity - a.quantity;
    if (sortBy === 'price') return b.sellPrice - a.sellPrice;
    return a.name.localeCompare(b.name);
  });

  return (
    <View style={styles.container}>
      <Header
        title="Inventory"
        showNotification={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subHeader}>Manage your products and stock</Text>

        {/* Search Bar & Filter Toggle */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7} onPress={toggleSort}>
            <Ionicons name="options-outline" size={20} color={COLORS.green} />
          </TouchableOpacity>
        </View>

        {/* 3 Metrics Cards Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsRow}
          style={{ marginBottom: 12 }}
        >
          <View style={{ width: 140 }}>
            <StatCard
              title="Total Products"
              value={totalProductsCount.toString()}
              trendText="Active products"
              iconName="cube-outline"
              iconColor={COLORS.blue}
              iconBgColor={COLORS.blueBg}
            />
          </View>
          <View style={{ width: 140 }}>
            <StatCard
              title="Total Units"
              value={totalUnitsCount.toString()}
              trendText="Units in stock"
              iconName="grid-outline"
              iconColor={COLORS.green}
              iconBgColor={COLORS.greenBg}
            />
          </View>
          <View style={{ width: 160 }}>
            <StatCard
              title="Inventory Value"
              value={`${settings.currency}${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
              trendText="Stock value (cost)"
              iconName="logo-usd"
              iconColor={COLORS.purple}
              iconBgColor={COLORS.purpleBg}
            />
          </View>
        </ScrollView>

        {/* Category & Low Stock Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', gap: 8, marginVertical: 12 }}
        >
          {['All', 'Low Stock', 'Smartphones', 'Feature Phones', 'Accessories', 'Audio', 'Storage', 'Wearables', 'Electronics', 'General'].map((cat) => {
            const isActive = categoryFilter === cat;
            const isLowStock = cat === 'Low Stock';
            return (
              <TouchableOpacity
                key={cat}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isActive
                    ? isLowStock
                      ? COLORS.amberBg
                      : COLORS.greenBg
                    : COLORS.card,
                  borderWidth: 1,
                  borderColor: isActive
                    ? isLowStock
                      ? COLORS.amber
                      : COLORS.green
                    : COLORS.divider,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
                onPress={() => setCategoryFilter(cat)}
                activeOpacity={0.7}
              >
                {isLowStock && <Ionicons name="warning-outline" size={14} color={isActive ? COLORS.amber : COLORS.textSecondary} />}
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive
                      ? isLowStock
                        ? COLORS.amber
                        : COLORS.green
                      : COLORS.textSecondary,
                  }}
                >
                  {cat} {isLowStock ? `(${products.filter(p => p.quantity <= settings.lowStockThreshold).length})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Products List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>
            All Products ({sortedProducts.length})
          </Text>
          <TouchableOpacity style={styles.sortDropdown} onPress={toggleSort} activeOpacity={0.7}>
            <Text style={styles.sortText}>
              Sort: {sortBy === 'name' ? 'Name' : sortBy === 'quantity' ? 'Stock Qty' : 'Price'}
            </Text>
            <Ionicons name="swap-vertical" size={14} color={COLORS.green} />
          </TouchableOpacity>
        </View>

        {/* Products List */}
        {sortedProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySub}>Try adjusting your search query or add a new product.</Text>
          </View>
        ) : (
          sortedProducts.map((product) => (
            <ProductItemCard
              key={product.id}
              product={product}
              currency={settings.currency}
              onAddStock={() => adjustStock(product.id, 1)}
              onRemoveStock={() => adjustStock(product.id, -1)}
              onEdit={() => navigation.navigate('AddEditProduct', { product })}
              onPressDetails={() => navigation.navigate('ProductDetails', { productId: product.id })}
            />
          ))
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
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  subHeader: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
