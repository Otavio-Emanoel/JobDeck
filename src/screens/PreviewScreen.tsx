import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { getResume } from '../services/storage';
import { exportToPdf, shareFile } from '../services/export/pdf';
import { captureRef } from 'react-native-view-shot';

type Props = { id: string; onBack?: () => void };

export default function PreviewScreen({ id, onBack }: Props) {
  const [item, setItem] = useState<{ id: string; createdAt: number; resume: any } | null>(null);
  const paperRef = useRef<View | null>(null);

  useEffect(() => {
    getResume(id).then(r => {
      if (r) setItem(r as any);
    });
  }, [id]);

  const r = item?.resume;

  async function exportImage(format: 'png' | 'jpg') {
    if (!paperRef.current) return;
    try {
      const uri = await captureRef(paperRef, { format, quality: 1 });
      await shareFile(String(uri));
    } catch (e) {
      console.warn('Falha ao exportar imagem', e);
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {r ? (
          <View style={styles.paper} ref={paperRef as any}>
            <View style={styles.topHeader}>
              {r.personal?.avatarUri ? (
                <Image source={{ uri: r.personal.avatarUri }} style={styles.topAvatar} />
              ) : (
                <View style={[styles.topAvatar, { backgroundColor: '#F9FAFB' }]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.bigName}>{r.personal?.fullName || 'Seu Nome'}</Text>
                {r.personal?.role ? <Text style={styles.role}>{r.personal.role}</Text> : null}
                <View style={styles.topDivider} />
                {r.personal?.location ? <Text style={styles.meta}>{r.personal.location}</Text> : null}
                {r.personal?.phone ? <Text style={styles.meta}>{r.personal.phone}</Text> : null}
                {r.personal?.email ? <Text style={styles.meta}>{r.personal.email}</Text> : null}
                {r.personal?.website ? <Text style={styles.meta}>{r.personal.website}</Text> : null}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>INFORMAÇÕES</Text>
              <Text style={styles.paragraph}>{r.personal?.summary || 'Sem objetivo informado.'}</Text>
            </View>
            <View style={styles.sectionLine} />

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>FORMAÇÃO</Text>
              {r.education && r.education.length ? (
                r.education.map((e: any) => (
                  <View key={e.id} style={styles.itemRow}>
                    <Text style={styles.itemTitle}>{e.degree ? `${e.degree}` : ''} {e.institution ? `- ${e.institution}` : ''}</Text>
                    <Text style={styles.itemMeta}>
                      {e.startDate ? `Início ${e.startDate}` : ''}{e.startDate && e.endDate ? ' - ' : ''}{e.endDate ? `conclusão ${e.endDate}` : ''}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.itemMeta}>Sem formação informada.</Text>
              )}
            </View>
            <View style={styles.sectionLine} />

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>EXPERIÊNCIAS</Text>
              {r.experiences && r.experiences.length ? (
                r.experiences.map((e: any) => (
                  <View key={e.id} style={styles.itemRow}>
                    <Text style={styles.itemTitle}>{e.startDate || e.endDate ? `${e.startDate || ''}${e.endDate ? ` - ${e.endDate}` : ''}` : ''} {e.role ? `• ${e.role}` : ''}</Text>
                    {e.company ? <Text style={styles.paragraph}>{e.company}</Text> : null}
                    {e.description ? <Text style={styles.paragraph}>{e.description}</Text> : null}
                  </View>
                ))
              ) : (
                <Text style={styles.itemMeta}>Sem experiências informadas.</Text>
              )}
            </View>
            <View style={styles.sectionLine} />

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>HABILIDADES</Text>
              {r.skills && r.skills.length ? (
                <View style={{ rowGap: 6 }}>
                  {r.skills.map((s: any, idx: number) => (
                    <Text key={idx} style={styles.paragraph}>• {s.name}</Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.itemMeta}>Sem habilidades informadas.</Text>
              )}
            </View>
          </View>
        ) : (
          <Text style={styles.empty}>Não encontrado</Text>
        )}
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.bottomButton, styles.secondary]} onPress={onBack}>
          <Text style={styles.bottomText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomButton, styles.gray]} onPress={() => exportImage('png')}>
          <Text style={styles.bottomText}>PNG</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomButton, styles.gray]} onPress={() => exportImage('jpg')}>
          <Text style={styles.bottomText}>JPEG</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, styles.primary]}
          onPress={async () => {
            if (!r) return;
            try {
              const uri = await exportToPdf(r);
              await shareFile(String(uri));
            } catch (e) {
              console.warn('Falha ao exportar', e);
            }
          }}
        >
          <Text style={styles.bottomText}>PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    padding: 16,
    paddingBottom: 110,
  },
  paper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topHeader: {
    backgroundColor: '#d3d3d3ff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  topAvatar: {
    width: 132,
    height: 132,
    borderRadius: 999,
  },
  bigName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    fontFamily: 'Arial',
  },
  role: {
    fontSize: 18,
    color: '#374151',
    marginTop: 4,
    marginBottom: 8,
    fontFamily: 'Arial',
  },
  topDivider: {
    height: 2,
    backgroundColor: '#111827',
    width: '100%',
    maxWidth: 520,
    marginVertical: 8,
  },
  meta: {
    color: '#111827',
    fontSize: 14,
    fontFamily: 'Arial',
  },
  sectionBlock: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    fontFamily: 'Arial',
  },
  paragraph: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Arial',
  },
  itemRow: {
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Arial',
  },
  itemMeta: {
    color: '#6B7280',
    fontFamily: 'Arial',
  },
  empty: {
    textAlign: 'center',
    color: '#6B7280',
  },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bottomText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Arial',
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  gray: {
    backgroundColor: '#9CA3AF',
  },
  primary: {
    backgroundColor: '#2F80ED',
  },
});