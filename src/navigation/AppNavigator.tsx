import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../theme/theme';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { CashbookScreen } from '../screens/CashbookScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LoginScreen } from '../screens/LoginScreen';

// Modals
import { AddEditProductModal } from '../screens/AddEditProductModal';
import { AddTransactionModal } from '../screens/AddTransactionModal';
import { RecordSaleModal } from '../screens/RecordSaleModal';
import { ProductDetailsModal } from '../screens/ProductDetailsModal';
import { MenuModal } from '../screens/MenuModal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.divider,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Cashbook') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
      <Tab.Screen name="Cashbook" component={CashbookScreen} options={{ title: 'Cashbook' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { settings } = useAppStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!settings.isLoggedIn ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="MenuModal" component={MenuModal} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="AddEditProduct" component={AddEditProductModal} />
            <Stack.Screen name="AddTransaction" component={AddTransactionModal} />
            <Stack.Screen name="RecordSale" component={RecordSaleModal} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsModal} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}
