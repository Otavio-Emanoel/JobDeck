import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PortfolioPreviewScreen({ html, onBack }: { html: string; onBack?: () => void }) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');

  const natural = mode === 'desktop'
    ? { width: 1366, height: 768 }
    : { width: 390, height: 844 };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={[styles.button, styles.back]} onPress={onBack}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.button} onPress={() => setMode('desktop')}>
          <Text style={styles.buttonText}>Desktop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setMode('mobile')}>
          <Text style={styles.buttonText}>Mobile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stage}>
        {mode === 'desktop' ? (
          <View style={styles.desktopFrameWrapper}>
            <View style={styles.desktopFrame}>
              <View style={styles.desktopBar}>
                <View style={styles.desktopCircles}>
                  <View style={[styles.desktopCircle, { backgroundColor: '#F87171' }]} />
                  <View style={[styles.desktopCircle, { backgroundColor: '#FBBF24' }]} />
                  <View style={[styles.desktopCircle, { backgroundColor: '#34D399' }]} />
                </View>
                <Text style={styles.desktopBarText}>jobdeck.app — Portfólio</Text>
              </View>
              <ScaledCanvas naturalWidth={natural.width} naturalHeight={natural.height}>
                <WebView
                  originWhitelist={["*"]}
                  source={{ html }}
                  style={{ width: natural.width, height: natural.height, backgroundColor: 'transparent' }}
                  setSupportMultipleWindows={false}
                />
              </ScaledCanvas>
            </View>
          </View>
        ) : (
          <ScaledCanvas naturalWidth={natural.width} naturalHeight={natural.height}>
            <WebView
              originWhitelist={["*"]}
              source={{ html }}
              style={{ width: natural.width, height: natural.height, backgroundColor: 'transparent' }}
              setSupportMultipleWindows={false}
            />
          </ScaledCanvas>
        )}
      </View>
    </View>
  );
}

function ScaledCanvas({ naturalWidth, naturalHeight, children }: { naturalWidth: number; naturalHeight: number; children: React.ReactNode }) {
  const maxWidth = 1024;
  const maxHeight = 640;
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
  const scaledWidth = Math.round(naturalWidth * scale);
  const scaledHeight = Math.round(naturalHeight * scale);
  const tx = -((naturalWidth - scaledWidth) / 2);
  const ty = -((naturalHeight - scaledHeight) / 2);

  return (
    <View style={[styles.canvas, { width: scaledWidth, height: scaledHeight }] }>
      <View style={{ width: naturalWidth, height: naturalHeight, transform: [{ translateX: tx }, { translateY: ty }, { scale }] }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  button: { backgroundColor: '#4B5563', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  back: { backgroundColor: '#6B7280' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#18181B', padding: 16 },
  canvas: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 0, overflow: 'hidden' },
  desktopFrameWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#18181B',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  desktopFrame: {
    backgroundColor: '#23272F',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2D3748',
    overflow: 'hidden',
    alignItems: 'stretch',
    width: 1060,
    maxWidth: '100%',
  },
  desktopBar: {
    height: 38,
    backgroundColor: '#18181B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#23272F',
  },
  desktopCircles: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 14,
  },
  desktopCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F87171',
  },
  desktopBarText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
});
