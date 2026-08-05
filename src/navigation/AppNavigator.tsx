import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
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
import { OnboardingScreen } from '../screens/OnboardingScreen';

// Modals
import { AddEditProductModal } from '../screens/AddEditProductModal';
import { AddTransactionModal } from '../screens/AddTransactionModal';
import { RecordSaleModal } from '../screens/RecordSaleModal';
import { ProductDetailsModal } from '../screens/ProductDetailsModal';
import { MenuModal } from '../screens/MenuModal';
import { StatementModal } from '../screens/StatementModal';
import { ProfitBreakdownModal } from '../screens/ProfitBreakdownModal';
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
          tabBarIcon: ({ focused, color }) => {
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

type AuthState = 'checking' | 'onboarding' | 'login' | 'app';

export function AppNavigator() {
  const { isLoggedIn, logout } = useAppStore();
  const [authState, setAuthState] = useState<AuthState>('checking');
  const backgroundTimeRef = useRef<number | null>(null);

  // ── Check SecureStore for PIN on first render ─────────────────────────────
  useEffect(() => {
    SecureStore.getItemAsync('SECURITY_PIN')
      .then((pin) => {
        if (!pin) {
          setAuthState('onboarding');
        } else {
          setAuthState('login');
        }
      })
      .catch(() => {
        // If SecureStore fails, default to login screen
        setAuthState('login');
      });
  }, []);

  // ── Sync when isLoggedIn changes ──────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn) {
      setAuthState('app');
    } else if (authState === 'app') {
      // Only revert to login (not onboarding) when logging out
      setAuthState('login');
    }
  }, [isLoggedIn]);

  // ── Background timeout logout (3-minute grace period) ─────────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        backgroundTimeRef.current = Date.now();
      } else if (nextAppState === 'active') {
        if (backgroundTimeRef.current) {
          const timeInBackground = Date.now() - backgroundTimeRef.current;
          const GRACE_PERIOD = 3 * 60 * 1000; // 3 minutes
          if (timeInBackground > GRACE_PERIOD && isLoggedIn) {
            logout();
          }
        }
        backgroundTimeRef.current = null;
      }
    });

    return () => subscription.remove();
  }, [isLoggedIn, logout]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (authState === 'checking') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  // ── Onboarding (first launch) ─────────────────────────────────────────────
  if (authState === 'onboarding') {
    return <OnboardingScreen />;
  }

  // ── Authenticated main app ────────────────────────────────────────────────
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authState === 'login' ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Reports" component={ReportsScreen} />
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="StatementModal" component={StatementModal} />
            <Stack.Screen name="ProfitBreakdown" component={ProfitBreakdownModal} />
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
