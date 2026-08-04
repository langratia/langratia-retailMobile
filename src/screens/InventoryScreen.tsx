import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { ProductItemCard } from '../components/ProductItemCard';
import { Product } from '../types';

export const InventoryScreen = ({ route, navigation }: any) => {
  const { products, settings, adjustStock } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(
    route?.params?.filterLowStock ? 'Low Stock' : 'All'
  );
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'price'>('name');

  useEffect(() => {
    if (route?.params?.filterLowStock) {
      setCategoryFilter('Low Stock');
    }
  }, [route?.params?.filterLowStock]);

  const toggleSort = useCallback(() => {
    if (sortBy === 'name') setSortBy('quantity');
    else if (sortBy === 'quantity') setSortBy('price');
    else setSortBy('name');
  }, [sortBy]);

  // 1. Stats Computations (Memoized)
  const { totalProductsCount, totalUnitsCount, totalInventoryValue } = useMemo(() => {
    const pCount = products.length;
    const uCount = products.reduce((acc, p) => acc + p.quantity, 0);
    const iVal = products.reduce((acc, p) => acc + p.quantity * p.buyPrice, 0);
    return {
      totalProductsCount: pCount,
      totalUnitsCount: uCount,
      totalInventoryValue: iVal,
    };
  }, [products]);

  // 2. Filtered & Sorted Products (Memoized)
  const sortedProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCategory = true;
      if (categoryFilter === 'Low Stock') {
        matchesCategory = p.quantity <= settings.lowStockThreshold;
      } else if (categoryFilter !== 'All') {
        matchesCategory = p.category === categoryFilter;
      }

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'quantity') return b.quantity - a.quantity;
      if (sortBy === 'price') return b.sellPrice - a.sellPrice;
      return a.name.localeCompare(b.name);
    });
  }, [products, searchQuery, categoryFilter, sortBy, settings.lowStockThreshold]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.quantity <= settings.lowStockThreshold).length;
  }, [products, settings.lowStockThreshold]);

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductItemCard
        product={item}
        currency={settings.currency}
        onAddStock={() => adjustStock(item.id, 1)}
        onRemoveStock={() => adjustStock(item.id, -1)}
        onEdit={() => navigation.navigate('AddEditProduct', { product: item })}
        onPressDetails={() => navigation.navigate('ProductDetails', { productId: item.id })}
      />
    ),
    [settings.currency, adjustStock, navigation]
  );

  const renderListHeader = useMemo(
    () => (
      <View style={styles.headerComponentContainer}>
        {/* Search Bar & Filter Toggle */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products or categories..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search products"
              accessibilityHint="Type a product name or category to filter list"
            />
            {searchQuery !== '' && (
              <Pressable
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search input"
              >
                <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
              </Pressable>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [styles.filterBtn, pressed && styles.pressed]}
            onPress={toggleSort}
            accessibilityRole="button"
            accessibilityLabel={`Sort products by ${sortBy}`}
            accessibilityHint="Toggles sorting between name, stock quantity, and price"
          >
            <Ionicons name="options-outline" size={20} color={COLORS.green} />
          </Pressable>
        </View>

        {/* Single Consolidated Executive Inventory Hero Card (No Grid, No Horizontal Scroll) */}
        <View style={styles.inventoryHeroCard}>
          {/* Top Primary Stock Value Row */}
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.heroLabel}>Total Inventory Value</Text>
              <Text
                style={styles.heroStockValue}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
              >
                {settings.currency} {totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={styles.heroIconCircle}>
              <Ionicons name="wallet-outline" size={20} color={COLORS.purple} />
            </View>
          </View>

          <View style={styles.heroDivider} />

          {/* 3-Column Metrics Bar (Products • Units • Low Stock) */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>Products</Text>
              <Text style={styles.heroStatVal} numberOfLines={1}>{totalProductsCount}</Text>
            </View>

            <View style={styles.heroStatDivider} />

            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>Stock Units</Text>
              <Text style={[styles.heroStatVal, { color: COLORS.green }]} numberOfLines={1}>
                {totalUnitsCount}
              </Text>
            </View>

            <View style={styles.heroStatDivider} />

            <Pressable
              style={({ pressed }) => [
                styles.heroStatCol,
                categoryFilter === 'Low Stock' && styles.lowStockActiveCol,
                pressed && styles.pressed,
              ]}
              onPress={() => setCategoryFilter(categoryFilter === 'Low Stock' ? 'All' : 'Low Stock')}
              accessibilityRole="button"
              accessibilityLabel={`Low stock items: ${lowStockCount}. Tap to filter list`}
            >
              <View style={styles.lowStockLabelRow}>
                <Ionicons name="warning-outline" size={12} color={COLORS.amber} />
                <Text style={[styles.heroStatLabel, { color: COLORS.amber, fontWeight: '700' }]}>
                  Low Stock
                </Text>
              </View>
              <Text style={[styles.heroStatVal, { color: COLORS.amber }]} numberOfLines={1}>
                {lowStockCount} {categoryFilter === 'Low Stock' ? '✓' : ''}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Category & Low Stock Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}
        >
          {['All', 'Low Stock'].map((cat) => {
            const isActive = categoryFilter === cat;
            const isLowStock = cat === 'Low Stock';
            return (
              <Pressable
                key={cat}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? isLowStock
                        ? COLORS.amberBg
                        : COLORS.greenBg
                      : COLORS.card,
                    borderColor: isActive
                      ? isLowStock
                        ? COLORS.amber
                        : COLORS.green
                      : COLORS.divider,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={() => setCategoryFilter(cat)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${cat} ${isLowStock ? `(${lowStockCount} items)` : ''}`}
              >
                {isLowStock && (
                  <Ionicons
                    name="warning-outline"
                    size={14}
                    color={isActive ? COLORS.amber : COLORS.textSecondary}
                  />
                )}
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive
                      ? isLowStock
                        ? COLORS.amber
                        : COLORS.green
                      : COLORS.textSecondary,
                  }}
                >
                  {cat} {isLowStock ? `(${lowStockCount})` : ''}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Products List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listHeaderTitle}>
            All Products ({sortedProducts.length})
          </Text>
          <Pressable
            style={({ pressed }) => [styles.sortDropdown, pressed && styles.pressed]}
            onPress={toggleSort}
            accessibilityRole="button"
            accessibilityLabel={`Sort order: ${sortBy}`}
          >
            <Text style={styles.sortText}>
              Sort: {sortBy === 'name' ? 'Name' : sortBy === 'quantity' ? 'Stock Qty' : 'Price'}
            </Text>
            <Ionicons name="swap-vertical" size={14} color={COLORS.green} />
          </Pressable>
        </View>
      </View>
    ),
    [
      searchQuery,
      sortBy,
      totalProductsCount,
      totalUnitsCount,
      totalInventoryValue,
      settings.currency,
      categoryFilter,
      lowStockCount,
      sortedProducts.length,
      toggleSort,
    ]
  );

  const renderEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>
          {products.length === 0 ? 'Your Inventory is Empty' : 'No Products Found'}
        </Text>
        <Text style={styles.emptySub}>
          {products.length === 0
            ? 'Tap the + button to add your first product to the catalog.'
            : 'Try adjusting your search query or clear your category filter.'}
        </Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <Header title="Inventory" showNotification={true} />

      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
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
    paddingBottom: 110,
  },
  headerComponentContainer: {
    marginBottom: 8,
    marginTop: 16,
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
    height: 48,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  pressed: {
    opacity: 0.7,
  },
  inventoryHeroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.small,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroStockValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.purple,
  },
  heroIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 12,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroStatCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
    borderRadius: 8,
  },
  lowStockActiveCol: {
    backgroundColor: COLORS.amberBg,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.divider,
  },
  heroStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  heroStatVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  lowStockLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
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
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sortText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
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
