import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EditorScreen() {
  return (
    <View style={styles.container}>
      <Text>Editor de Currículo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
