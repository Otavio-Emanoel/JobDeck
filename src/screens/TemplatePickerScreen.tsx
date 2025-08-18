import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

type Props = { onBack?: () => void; onPick?: (templateId: string) => void };

const TEMPLATES = [
  { id: 'classic', name: 'Clássico (Arial)' },
  { id: 'modern', name: 'Moderno (2 colunas)' },
  { id: 'minimal', name: 'Minimalista' },
];

const Preview = ({ id }: { id: string }) => {
  return (
    <View style={styles.previewCard}>
      <View style={[styles.previewHeader, id === 'classic' ? styles.gray : id === 'modern' ? styles.blue : styles.white]} />
      <View style={styles.previewLine} />
      <View style={styles.previewParagraph} />
      <View style={styles.previewParagraph} />
    </View>
  );
};

export default function TemplatePickerScreen({ onBack, onPick }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolher template</Text>
      <FlatList
        data={TEMPLATES}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onPick?.(item.id)}>
            <Preview id={item.id} />
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardHint}>Toque para editar nesse modelo</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  title: { marginTop: 16, textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#111827' },
  card: { marginHorizontal: 16, marginBottom: 12, padding: 16, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardHint: { marginTop: 8, color: '#6B7280' },
  back: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: '#2F80ED', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  backText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  previewCard: { height: 120, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  previewHeader: { height: 40, backgroundColor: '#E5E7EB' },
  previewLine: { height: 6, margin: 8, backgroundColor: '#E5E7EB', borderRadius: 3 },
  previewParagraph: { height: 8, marginHorizontal: 8, marginBottom: 6, backgroundColor: '#F3F4F6', borderRadius: 3 },
  gray: { backgroundColor: '#D1D5DB' },
  blue: { backgroundColor: '#DBEAFE' },
  white: { backgroundColor: '#F3F4F6' },
});
