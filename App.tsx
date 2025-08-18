import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import EditorScreen from './src/screens/EditorScreen';
import SavedResumesScreen from './src/screens/SavedResumesScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import TemplatePickerScreen from './src/screens/TemplatePickerScreen';
import TemplateEditorScreen from './src/screens/TemplateEditorScreen';
import { ResumeProvider } from './src/contexts/ResumeProvider';
import { getResume, getTemplateDoc } from './src/services/storage';
import type { TemplateDoc } from './src/types/template';

type Route = 'home' | 'editor' | 'saved' | 'preview' | 'edit' | 'templates' | 'template-editor';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [route, setRoute] = useState<Route>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateEditingId, setTemplateEditingId] = useState<string | null>(null);
  const [templateInitialDoc, setTemplateInitialDoc] = useState<TemplateDoc | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  async function handleEditTemplate(id: string) {
    const item = await getTemplateDoc(id);
    if (item && item.kind === 'template') {
      setSelectedTemplate(item.template.templateId);
      setTemplateInitialDoc(item.template);
      setTemplateEditingId(id);
      setRoute('template-editor');
    }
  }

  function handlePickTemplate(id: string) {
    setSelectedTemplate(id);
    setTemplateEditingId(null);
    setTemplateInitialDoc(null);
    setRoute('template-editor');
  }

  return (
    <ResumeProvider>
      <View style={styles.container}>
        {isLoading ? (
          <SplashScreen />
        ) : route === 'home' ? (
          <HomeScreen onNewResume={() => setRoute('editor')} onViewSaved={() => setRoute('saved')} onPickTemplate={() => setRoute('templates')} />
        ) : route === 'editor' ? (
          <EditorScreen onDone={() => setRoute('home')} onViewSaved={() => setRoute('saved')} onBack={() => setRoute('home')} />
        ) : route === 'saved' ? (
          <SavedResumesScreen
            onBack={() => setRoute('home')}
            onPreview={(id) => { setSelectedId(id); setRoute('preview'); }}
            onEdit={(id) => { setSelectedId(id); setRoute('edit'); }}
            onEditTemplate={handleEditTemplate}
          />
        ) : route === 'preview' && selectedId ? (
          <PreviewScreen id={selectedId} onBack={() => setRoute('saved')} />
        ) : route === 'edit' && selectedId ? (
          <EditorScreen onDone={() => setRoute('saved')} onViewSaved={() => setRoute('saved')} editingId={selectedId} onBack={() => setRoute('saved')} />
        ) : route === 'templates' ? (
          <TemplatePickerScreen onBack={() => setRoute('home')} onPick={handlePickTemplate} />
        ) : route === 'template-editor' ? (
          <TemplateEditorScreen
            templateId={selectedTemplate || 'classic'}
            editingId={templateEditingId || undefined}
            initialDoc={templateInitialDoc || undefined}
            onBack={() => {
              setTemplateEditingId(null);
              setTemplateInitialDoc(null);
              setSelectedTemplate(null);
              setRoute('home');
            }}
            onSaved={() => {
              setTemplateEditingId(null);
              setTemplateInitialDoc(null);
              setSelectedTemplate(null);
              setRoute('saved');
            }}
          />
        ) : (
          <HomeScreen onNewResume={() => setRoute('editor')} onViewSaved={() => setRoute('saved')} onPickTemplate={() => setRoute('templates')} />
        )}
        <StatusBar style="auto" />
      </View>
    </ResumeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
