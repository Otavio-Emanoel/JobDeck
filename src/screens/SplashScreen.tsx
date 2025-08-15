import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Text, Animated, Easing } from 'react-native';

export default function SplashScreen() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1500, 
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, 
    }).start();
  }, [progress]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240], 
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/splash-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>JobDeck</Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: barWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressTrack: {
    marginTop: 24,
    width: 240,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2F80ED',
    borderRadius: 4,
  },
});