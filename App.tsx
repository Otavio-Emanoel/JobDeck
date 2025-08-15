import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import EditorScreen from './src/screens/EditorScreen';
import SavedResumesScreen from './src/screens/SavedResumesScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import { ResumeProvider } from './src/contexts/ResumeProvider';

type Route = 'home' | 'editor' | 'saved' | 'preview' | 'edit';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [route, setRoute] = useState<Route>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ResumeProvider>
      <View style={styles.container}>
        {isLoading ? (
          <SplashScreen />
        ) : route === 'home' ? (
          <HomeScreen onNewResume={() => setRoute('editor')} onViewSaved={() => setRoute('saved')} />
        ) : route === 'editor' ? (
          <EditorScreen onDone={() => setRoute('home')} onViewSaved={() => setRoute('saved')} />
        ) : route === 'saved' ? (
          <SavedResumesScreen
            onBack={() => setRoute('home')}
            onPreview={(id) => { setSelectedId(id); setRoute('preview'); }}
            onEdit={(id) => { setSelectedId(id); setRoute('edit'); }}
          />
        ) : route === 'preview' && selectedId ? (
          <PreviewScreen id={selectedId} onBack={() => setRoute('saved')} />
        ) : route === 'edit' && selectedId ? (
          <EditorScreen onDone={() => setRoute('saved')} onViewSaved={() => setRoute('saved')} editingId={selectedId} />
        ) : (
          <HomeScreen onNewResume={() => setRoute('editor')} onViewSaved={() => setRoute('saved')} />
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
