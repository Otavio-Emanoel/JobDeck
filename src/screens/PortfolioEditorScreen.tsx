import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { generateHtmlFromPrompt } from '../services/ai/gemini';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function PortfolioEditorScreen({ onBack, onPreview }: { onBack?: () => void; onPreview?: (html: string) => void }) {
  const [html, setHtml] = useState(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Portfólio</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 24px;
      background: #f7f7f8;
      color: #111;
    }
    header {
      padding: 24px;
      border-radius: 12px;
      background: #111;
      color: #fff;
      margin-bottom: 24px;
    }
    section {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    a.btn {
      display: inline-block;
      background: #2F80ED;
      color: #fff;
      padding: 10px 14px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <header>
    <h1>Meu Portfólio</h1>
    <p>Bem-vindo(a)!</p>
  </header>
  <section>
    <h2>Sobre mim</h2>
    <p>Edite este HTML ou gere um novo com IA.</p>
  </section>
</body>
</html>
  `);
  const [prompt, setPrompt] = useState('Crie um portfólio moderno com header, seção sobre e projetos.');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const last = await AsyncStorage.getItem('portfolio_html');
      if (last) setHtml(last);
    })();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      AsyncStorage.setItem('portfolio_html', html).catch(() => {});
    }, 400);
    return () => clearTimeout(id);
  }, [html]);

  async function handleGenerate() {
    try {
      setIsLoading(true);
      const out = await generateHtmlFromPrompt(prompt);
      setHtml(out);
    } catch (e) {
      Alert.alert('Erro', 'Falha na geração.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownload() {
    try {
      const path = FileSystem.cacheDirectory + `portfolio-${Date.now()}.html`;
      await FileSystem.writeAsStringAsync(path, html, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert('Baixar', 'Compartilhamento não disponível neste dispositivo.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o arquivo.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={[styles.button, styles.back]} onPress={onBack}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[styles.button, styles.gen]} onPress={handleGenerate} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Gerando…' : 'Gerar com IA'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.preview]} onPress={() => onPreview?.(html)}>
          <Text style={styles.buttonText}>Pré-visualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.download]} onPress={handleDownload}>
          <Text style={styles.buttonText}>Baixar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.editorWrapper} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Prompt</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Descreva o portfólio que deseja…"
        />
        <Text style={styles.label}>HTML</Text>
        <TextInput
          style={[styles.input, styles.monaco]}
          multiline
          value={html}
          onChangeText={setHtml}
          placeholder="Cole/edite seu HTML aqui"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderColor: '#E5E7EB', marginTop: 40 },
  button: { backgroundColor: '#4B5563', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  back: { backgroundColor: '#6B7280' },
  gen: { backgroundColor: '#8B5CF6' },
  preview: { backgroundColor: '#2F80ED' },
  download: { backgroundColor: '#10B981' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  editorWrapper: { padding: 16, gap: 10 },
  label: { fontWeight: '700', color: '#111827' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, backgroundColor: '#F9FAFB', color: '#111827' },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  monaco: { minHeight: 380, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 13 },
});
