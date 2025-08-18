import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { saveResume } from '../services/storage';
import type { Resume } from '../types/resume';

type Props = { templateId: string; onBack?: () => void; onSaved?: () => void };

type Block =
  | { id: string; type: 'h1'; text: string }
  | { id: string; type: 'h2'; text: string }
  | { id: string; type: 'p'; text: string };

function uid() { return Math.random().toString(36).slice(2); }

export default function TemplateEditorScreen({ templateId, onBack, onSaved }: Props) {
  const initial: Block[] = useMemo(() => [
    { id: uid(), type: 'h1', text: 'Seu Nome' },
    { id: uid(), type: 'p', text: 'Resumo profissional ou objetivo.' },
    { id: uid(), type: 'h2', text: 'Experiência' },
    { id: uid(), type: 'p', text: 'Cargo — Empresa — Período' },
    { id: uid(), type: 'h2', text: 'Formação' },
    { id: uid(), type: 'p', text: 'Curso — Instituição — Período' },
  ], [templateId]);

  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  function addBlock(type: Block['type']) {
    setBlocks((b) => [...b, { id: uid(), type, text: type.startsWith('h') ? 'Título' : 'Texto' }]);
  }

  async function save() {
    // Converte o conteúdo em uma estrutura Resume básica
    const name = blocks.find(b => b.type === 'h1')?.text || 'Sem nome';
    const summary = blocks.find(b => b.type === 'p')?.text || undefined;
    const resume: Resume = {
      personal: { fullName: name, email: '', summary, avatarUri },
      experiences: [],
      education: [],
      skills: [],
    };
    await saveResume(resume);
    onSaved?.();
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.preview, templateId === 'classic' ? styles.classic : templateId === 'modern' ? styles.modern : styles.minimal]}>
          {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatar} /> : null}
          {blocks.map((b) => (
            <TextInput
              key={b.id}
              style={[styles.input, b.type === 'h1' ? styles.h1 : b.type === 'h2' ? styles.h2 : styles.p]}
              value={b.text}
              onChangeText={(t) => setBlocks((list) => list.map(x => x.id === b.id ? { ...x, text: t } : x))}
              placeholder={b.type.startsWith('h') ? 'Título' : 'Digite...'}
              multiline
            />
          ))}
        </View>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.btn} onPress={() => addBlock('h1')}><Text style={styles.btnTxt}>H1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => addBlock('h2')}><Text style={styles.btnTxt}>H2</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => addBlock('p')}><Text style={styles.btnTxt}>Texto</Text></TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.bottomBtn, styles.secondary]} onPress={onBack}><Text style={styles.bottomTxt}>Voltar</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.bottomBtn, styles.primary]} onPress={save}><Text style={styles.bottomTxt}>Salvar</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { padding: 16, paddingBottom: 100 },
  preview: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  classic: { },
  modern: { },
  minimal: { },
  avatar: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 12 },
  input: { paddingVertical: 6, color: '#111827' },
  h1: { fontSize: 26, fontWeight: '800' },
  h2: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  p: { fontSize: 14, lineHeight: 20 },
  toolbar: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btnTxt: { color: '#111827', fontWeight: '700' },
  bottomBar: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', gap: 8 },
  bottomBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  bottomTxt: { color: '#FFFFFF', fontWeight: '700' },
  primary: { backgroundColor: '#2F80ED' },
  secondary: { backgroundColor: '#6B7280' },
});
