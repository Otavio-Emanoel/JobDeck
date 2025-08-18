import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { loadResumes, type SavedItem, removeItem } from '../services/storage';

type Props = {
  onBack?: () => void;
  onPreview?: (id: string) => void;
  onEdit?: (id: string) => void;
  onEditTemplate?: (id: string) => void;
};

export default function SavedResumesScreen({ onBack, onPreview, onEdit, onEditTemplate }: Props) {
  const [items, setItems] = useState<SavedItem[]>([]);

  async function refresh() {
    const list = await loadResumes();
    setItems(list);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleRemove(id: string) {
    Alert.alert('Remover', 'Deseja remover este item?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => { await removeItem(id); await refresh(); } },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Itens salvos</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              {item.kind === 'resume' ? (
                <>
                  <Text style={styles.cardTitle}>Currículo {item.id}</Text>
                  <Text style={styles.cardSubtitle}>{new Date(item.createdAt).toLocaleString()}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>Template: {(item as any).template?.templateId ?? 'Desconhecido'}</Text>
                  <Text style={styles.cardSubtitle}>{new Date(item.createdAt).toLocaleString()}</Text>
                </>
              )}
            </View>
            <View style={styles.cardActions}>
              {item.kind === 'resume' ? (
                <>
                  <TouchableOpacity style={[styles.smallButton, styles.preview]} onPress={() => onPreview && onPreview(item.id)}>
                    <Text style={styles.smallButtonText}>Ver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallButton, styles.edit]} onPress={() => onEdit && onEdit(item.id)}>
                    <Text style={styles.smallButtonText}>Editar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={[styles.smallButton, styles.edit]} onPress={() => onEditTemplate && onEditTemplate(item.id)}>
                    <Text style={styles.smallButtonText}>Editar</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={[styles.smallButton, styles.remove]} onPress={() => handleRemove(item.id)}>
                <Text style={styles.smallButtonText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum item salvo</Text>}
        contentContainerStyle={items.length ? undefined : { flex: 1, alignItems: 'center', justifyContent: 'center' }}
      />
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    paddingBottom: 24 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  card: { 
    padding: 14, 
    borderRadius: 12, 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827' 
  },
  cardSubtitle: { 
    marginTop: 4, 
    color: '#6B7280' 
  },
  cardActions: { 
    flexDirection: 'row', 
    gap: 8 
  },
  smallButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  smallButtonText: { 
    color: '#FFFFFF', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  preview: { 
    backgroundColor: '#6B7280' 
  },
  edit: { 
    backgroundColor: '#2F80ED' 
  },
  remove: {
    backgroundColor: '#EF4444'
  },
  empty: { 
    color: '#6B7280' 
  },
  backButton: { 
    marginTop: 12, 
    backgroundColor: '#2F80ED', 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  backButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },
});
