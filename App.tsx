import React, { useState, useEffect, useRef } from 'react';
import {
  StatusBar,
  View,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS } from './src/theme/theme';

const { width, height } = Dimensions.get('window');

function CustomSplash({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hold for 1.4 seconds, then fade out over 0.4 seconds
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(onDone);
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity }]}>
      <Image
        source={require('./assets/ivanBanner.png')}
        style={styles.splashImage}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [splashDone, setSplashDone] = useState(false);

  // While fonts are loading, show nothing (native OS splash is still visible)
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />

        {/* Main app — always rendered but hidden behind splash until ready */}
        {splashDone && (
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        )}

        {/* Custom branded splash — ivanBanner stays 1.4s then fades out */}
        {!splashDone && (
          <CustomSplash onDone={() => setSplashDone(true)} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0F4F8',
    zIndex: 999,
  },
  splashImage: {
    width,
    height,
  },
});
