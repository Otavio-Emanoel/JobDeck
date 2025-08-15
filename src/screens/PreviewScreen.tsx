import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { getResume } from '../services/storage';

type Props = { id: string; onBack?: () => void };

export default function PreviewScreen({ id, onBack }: Props) {
  const [item, setItem] = useState<{ id: string; createdAt: number; resume: any } | null>(null);

  useEffect(() => {
    getResume(id).then(r => {
      if (r) setItem(r as any);
    });
  }, [id]);

  const r = item?.resume;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {r ? (
          <View style={styles.paper}>
            <View style={styles.header}>
              {r.personal?.avatarUri ? <Image source={{ uri: r.personal.avatarUri }} style={styles.avatar} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{r.personal?.fullName}</Text>
                {r.personal?.location ? <Text style={styles.meta}>{r.personal.location}</Text> : null}
                {r.personal?.email ? <Text style={styles.meta}>{r.personal.email}</Text> : null}
              </View>
            </View>

            {r.personal?.summary ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumo</Text>
                <Text style={styles.paragraph}>{r.personal.summary}</Text>
              </View>
            ) : null}

            {r.education && r.education.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Formação</Text>
                {r.education.map((e: any) => (
                  <View key={e.id} style={styles.itemRow}>
                    <Text style={styles.itemTitle}>{e.institution}</Text>
                    {e.degree ? <Text style={styles.itemMeta}>{e.degree}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {r.experiences && r.experiences.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Experiência</Text>
                {r.experiences.map((e: any) => (
                  <View key={e.id} style={styles.itemRow}>
                    <Text style={styles.itemTitle}>{e.company}</Text>
                    {e.role ? <Text style={styles.itemMeta}>{e.role}</Text> : null}
                    {e.description ? <Text style={styles.paragraph}>{e.description}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {r.languages && r.languages.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Idiomas</Text>
                <Text style={styles.paragraph}>{r.languages.join(', ')}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={styles.empty}>Não encontrado</Text>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 24 },
  paper: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', fontFamily: 'Arial' },
  meta: { color: '#374151', fontSize: 14, fontFamily: 'Arial' },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6, fontFamily: 'Arial' },
  paragraph: { color: '#111827', fontSize: 14, lineHeight: 20, fontFamily: 'Arial' },
  itemRow: { marginBottom: 8 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#111827', fontFamily: 'Arial' },
  itemMeta: { color: '#6B7280', fontFamily: 'Arial' },
  empty: { textAlign: 'center', color: '#6B7280' },
  back: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#2F80ED', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  backText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Arial' },
});
