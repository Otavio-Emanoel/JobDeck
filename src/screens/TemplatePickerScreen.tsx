import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

type Props = { onBack?: () => void; onPick?: (templateId: string) => void };

const TEMPLATES = [
  { id: 'classic', name: 'Clássico (Arial)' },
  { id: 'modern', name: 'Moderno (2 colunas)' },
  { id: 'minimal', name: 'Minimalista' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  title: { marginTop: 16, textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#111827' },
  card: { marginHorizontal: 16, marginBottom: 12, padding: 16, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardHint: { marginTop: 8, color: '#6B7280' },
  back: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: '#2F80ED', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  backText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  previewBox: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12 },
  previewHeader: { height: 40, borderRadius: 6, marginBottom: 8 },
  previewLineWide: { height: 10, backgroundColor: '#D1D5DB', borderRadius: 4, marginBottom: 6 },
  previewLine: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 6 },
  previewDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
});

const PREVIEW = {
  classic: (
    <View style={styles.previewBox}>
      <View style={[styles.previewHeader, { backgroundColor: '#D3D3D3' }]} />
      <View style={styles.previewLineWide} />
      <View style={styles.previewLine} />
      <View style={styles.previewDivider} />
      <View style={styles.previewLineWide} />
      <View style={styles.previewLine} />
    </View>
  ),
  modern: (
    <View style={styles.previewBox}>
      <View style={[styles.previewHeader, { backgroundColor: '#111827' }]} />
      <View style={styles.row}>
        <View style={[styles.previewLineWide, { flex: 1 }]} />
        <View style={{ width: 6 }} />
        <View style={[styles.previewLine, { flex: 1 }]} />
      </View>
      <View style={styles.previewDivider} />
      <View style={styles.row}>
        <View style={[styles.previewLine, { flex: 1 }]} />
        <View style={{ width: 6 }} />
        <View style={[styles.previewLineWide, { flex: 1 }]} />
      </View>
    </View>
  ),
  minimal: (
    <View style={styles.previewBox}>
      <View style={styles.previewLineWide} />
      <View style={styles.previewLine} />
      <View style={styles.previewLine} />
      <View style={styles.previewLine} />
    </View>
  ),
} as const;

export default function TemplatePickerScreen({ onBack, onPick }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolher template</Text>
      <FlatList
        data={TEMPLATES}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onPick?.(item.id)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={{ height: 8 }} />
            {PREVIEW[item.id as keyof typeof PREVIEW]}
            <Text style={styles.cardHint}>Toque para editar</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
