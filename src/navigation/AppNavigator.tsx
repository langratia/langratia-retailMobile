import React, { useEffect } from 'react';
import { View, AppState, AppStateStatus } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../theme/theme';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { CashbookScreen } from '../screens/CashbookScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { PrinteryScreen } from '../screens/PrinteryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LoginScreen } from '../screens/LoginScreen';

// Modals
import { AddEditProductModal } from '../screens/AddEditProductModal';
import { AddTransactionModal } from '../screens/AddTransactionModal';
import { RecordSaleModal } from '../screens/RecordSaleModal';
import { ProductDetailsModal } from '../screens/ProductDetailsModal';
import { MenuModal } from '../screens/MenuModal';
import { StatementModal } from '../screens/StatementModal';
import { GlobalSpeedDial } from '../components/GlobalSpeedDial';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.green,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: COLORS.card,
            borderTopWidth: 1,
            borderTopColor: COLORS.divider,
            height: 56 + Math.max(insets.bottom, 12),
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 6,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
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
            } else if (route.name === 'Printery') {
              iconName = focused ? 'print' : 'print-outline';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
        <Tab.Screen name="Cashbook" component={CashbookScreen} options={{ title: 'Cashbook' }} />
        <Tab.Screen name="Printery" component={PrinteryScreen} options={{ title: 'Printery' }} />
      </Tab.Navigator>
      <GlobalSpeedDial />
    </View>
  );
}

export function AppNavigator() {
  // isLoggedIn is now a top-level store property (not part of settings)
  const { isLoggedIn, logout } = useAppStore();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Lock only when the app moves to the BACKGROUND — not on `inactive`.
      // On iOS, `inactive` fires during phone calls, Siri, notification shade
      // interactions, and app-switcher gestures. Logging out on `inactive`
      // would cause constant unwanted logouts during normal device usage.
      if (nextAppState === 'background') {
        if (isLoggedIn) {
          logout();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isLoggedIn, logout]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Reports" component={ReportsScreen} />
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="StatementModal" component={StatementModal} />
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
