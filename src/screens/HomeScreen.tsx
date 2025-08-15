import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>JobDeck</Text>
      <Text style={styles.subtitle}>Crie, edite e exporte seu currículo</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9}>
          <Text style={styles.primaryButtonText}>Novo currículo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
          <Text style={styles.secondaryButtonText}>Escolher template</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} activeOpacity={0.6}>
          <Text style={styles.linkButtonText}>Importar currículo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', padding: 24 },
  logo: { width: 120, height: 120 },
  title: { marginTop: 16, fontSize: 28, fontWeight: '700', color: '#1F2937' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#6B7280' },
  actions: { marginTop: 32, width: '100%', maxWidth: 320 },
  primaryButton: { backgroundColor: '#2F80ED', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: { marginTop: 12, paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2F80ED', backgroundColor: '#FFFFFF' },
  secondaryButtonText: { color: '#2F80ED', fontSize: 16, fontWeight: '600' },
  linkButton: { marginTop: 12, alignItems: 'center' },
  linkButtonText: { color: '#4B5563', fontSize: 14, textDecorationLine: 'underline' },
});
