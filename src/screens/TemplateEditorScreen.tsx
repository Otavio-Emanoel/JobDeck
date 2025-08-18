import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  Platform,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import type { TemplateDoc, TemplateId, TemplateNode } from '../types/template';
import { saveTemplateDoc, updateTemplateDoc } from '../services/storage';
import { exportTemplateToPdf, shareFile } from '../services/export/pdf';

// Tipos locais de edição visual
// h1/h2/p para textos, e image com posição e tamanho (x, y, w, h)
 type TemplateBlock =
  | { id: string; type: 'h1' | 'h2' | 'p'; text: string }
  | { id: string; type: 'image'; uri: string; x: number; y: number; w: number; h: number };

 type Props = {
  templateId: string;
  onBack?: () => void;
  onSaved?: (id: string) => void;
  editingId?: string;
  initialDoc?: TemplateDoc;
};

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function TemplateEditorScreen({ templateId, onBack, onSaved, editingId, initialDoc }: Props) {
  const previewRef = useRef<View | null>(null);
  const printRef = useRef<View | null>(null); // view separada para export de imagem (sem TextInput)
  const [canvasWidth, setCanvasWidth] = useState(0); // largura total da página
  const [contentWidth, setContentWidth] = useState(0); // largura da área de conteúdo (onde ficam os blocos)
  const [printSize, setPrintSize] = useState({ width: 0, height: 0 });
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  // Converte TemplateDoc.nodes -> blocks do editor
  const initialBlocks: TemplateBlock[] = useMemo(() => {
    if (initialDoc?.nodes) {
      return initialDoc.nodes.map((n, idx) => {
        if (n.type === 'title') {
          // Heurística simples: primeiro título como h1, demais como h2
          return { id: n.id, type: idx === 0 ? 'h1' : 'h2', text: n.text } as TemplateBlock;
        }
        if (n.type === 'paragraph') {
          return { id: n.id, type: 'p', text: n.text } as TemplateBlock;
        }
        if (n.type === 'image') {
          return {
            id: n.id,
            type: 'image',
            uri: n.uri,
            x: n.x ?? 16,
            y: n.y ?? 16,
            w: n.width,
            h: n.height,
          } as TemplateBlock;
        }
        return { id: uid(), type: 'p', text: '' } as TemplateBlock;
      });
    }
    // Default quando criando novo
    return [
      { id: uid(), type: 'h1', text: 'Seu Nome' },
      { id: uid(), type: 'p', text: 'Resumo profissional ou objetivo.' },
      { id: uid(), type: 'h2', text: 'Experiência' },
      { id: uid(), type: 'p', text: 'Cargo — Empresa — Período' },
      { id: uid(), type: 'h2', text: 'Formação' },
      { id: uid(), type: 'p', text: 'Curso — Instituição — Período' },
    ];
  }, [initialDoc]);

  const [blocks, setBlocks] = useState<TemplateBlock[]>(initialBlocks);

  function addBlock(type: Extract<TemplateBlock['type'], 'h1' | 'h2' | 'p'>) {
    setBlocks((b) => [
      ...b,
      { id: uid(), type, text: type.startsWith('h') ? 'Título' : 'Texto' } as TemplateBlock,
    ]);
  }

  async function addImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (res.canceled) return;
    const uri = res.assets?.[0]?.uri;
    if (!uri) return;
    setBlocks((b) => [
      ...b,
      { id: uid(), type: 'image', uri, x: 16, y: 16, w: 140, h: 140 },
    ]);
  }

  // Limita o movimento das imagens para não sair da área de conteúdo
  // Fator para suavizar o movimento (quanto maior, mais lento)
  const DRAG_SENSITIVITY = 10;
  const RESIZE_SENSITIVITY = 5;

  function onDrag(id: string, dx: number, dy: number) {
    setBlocks((b) =>
      b.map((blk) => {
        if (blk.id === id && blk.type === 'image') {
          const maxW = contentWidth || canvasWidth || 740;
          const maxH = 980;
          // Permite y negativo para posicionar no topo
          const newX = Math.max(0, Math.min(blk.x + dx / DRAG_SENSITIVITY, maxW - blk.w));
          const newY = Math.max(-80, Math.min(blk.y + dy / DRAG_SENSITIVITY, maxH - blk.h));
          return { ...blk, x: newX, y: newY };
        }
        return blk;
      })
    );
  }

  function onResize(id: string, dw: number, dh: number) {
    setBlocks((b) =>
      b.map((blk) => {
        if (blk.id === id && blk.type === 'image') {
          const maxW = contentWidth || canvasWidth || 740;
          const maxH = 980;
          const newW = Math.max(40, Math.min(blk.w + dw / RESIZE_SENSITIVITY, maxW - blk.x));
          const newH = Math.max(40, Math.min(blk.h + dh / RESIZE_SENSITIVITY, maxH - blk.y));
          return { ...blk, w: newW, h: newH };
        }
        return blk;
      })
    );
  }

  // Converte blocks -> TemplateDoc
  function toDoc(): TemplateDoc {
    const nodes: TemplateNode[] = blocks.map((blk) => {
      switch (blk.type) {
        case 'h1':
        case 'h2': {
          return { id: blk.id, type: 'title', text: blk.text } as TemplateNode;
        }
        case 'p': {
          return { id: blk.id, type: 'paragraph', text: blk.text } as TemplateNode;
        }
        case 'image': {
          return {
            id: blk.id,
            type: 'image',
            uri: blk.uri,
            width: blk.w,
            height: blk.h,
            x: blk.x,
            y: blk.y,
          } as TemplateNode;
        }
      }
    });
    return { templateId: (templateId as unknown) as TemplateId, nodes };
  }

  async function save() {
    const doc = toDoc();
    if (editingId) {
      await updateTemplateDoc(editingId, doc);
      onSaved?.(editingId);
    } else {
      const item = await saveTemplateDoc(doc);
      onSaved?.((item as any).id);
    }
  }

  // Usa a view "printRef" (sem TextInput) para capturar PNG/JPEG
  async function exportImage(format: 'png' | 'jpg') {
    const target = printRef.current || previewRef.current;
    if (!target) return;
    try {
      const uri = await captureRef(target, {
        format,
        quality: 1,
        result: 'tmpfile',
        backgroundColor: '#FFFFFF',
      } as any);
      await shareFile(String(uri));
    } catch (e) {
      // noop
    }
  }

  async function exportPdf() {
    try {
      const doc = toDoc();
      const base = contentWidth || canvasWidth; // prioriza a largura da área de conteúdo
      const uri = await exportTemplateToPdf(doc, { canvasWidth: base });
      await shareFile(uri);
    } catch (e) {
      // noop
    }
  }

  // Estilos por template para diferenciar visualmente
  const variant = (templateId as TemplateId) as TemplateId;
  const theme = getThemeForTemplate(variant);

  // Calcular paddings para barra superior com área segura
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

  // Altura mínima dinâmica para acomodar imagens posicionadas absolutas (evita corte)
  const headerHeight = useMemo(() => {
    const id = templateId as TemplateId;
    if (id === 'classic') return 96; // header em cima
    return 0; // modern tem sidebar; minimal sem header
  }, [templateId]);

  const imagesBottom = useMemo(() => {
    let maxY = 0;
    for (const b of blocks) {
      if ((b as any).type === 'image') {
        const top = (b as any).y || 0;
        const h = (b as any).h || 0;
        maxY = Math.max(maxY, top + h);
      }
    }
    return maxY;
  }, [blocks]);

  const dynamicMinHeight = useMemo(() => {
    // padding vertical do contentContainer geralmente 16 em classic/modern
    const contentPadding = 32;
    const base = 980; // altura base A4 útil
    return Math.max(base, headerHeight + imagesBottom + contentPadding);
  }, [headerHeight, imagesBottom]);

  return (
    <View style={styles.container}>
      {/* Toolbar com rolagem horizontal e padding seguro */}
      <View style={[styles.toolbarContainer, { paddingTop: topInset }]}> 
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarRow}>
          <TouchableOpacity style={[styles.button, styles.back]} onPress={onBack}>
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <TouchableOpacity style={styles.button} onPress={() => addBlock('h1')}>
            <Text style={styles.buttonText}>Título</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => addBlock('h2')}>
            <Text style={styles.buttonText}>Subtítulo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => addBlock('p')}>
            <Text style={styles.buttonText}>Texto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={addImage}>
            <Text style={styles.buttonText}>Imagem</Text>
          </TouchableOpacity>
          <View style={styles.sep} />
          <TouchableOpacity style={[styles.button, styles.save]} onPress={save}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => exportImage('png')}>
            <Text style={styles.buttonText}>PNG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => exportImage('jpg')}>
            <Text style={styles.buttonText}>JPEG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={exportPdf}>
            <Text style={styles.buttonText}>PDF</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} removeClippedSubviews={false}>
        <View
          style={[styles.page, { backgroundColor: theme.pageBg }]}
          onLayout={(e) => setCanvasWidth(e.nativeEvent.layout.width)}
          collapsable={false}
        >
          {/* PREVIEW visível (editável) */}
          <View
            ref={previewRef as any}
            style={[styles.card, theme.card, { minHeight: dynamicMinHeight }]}
            collapsable={false}
            onLayout={(e) => setPrintSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
          >
            {theme.header}
            <View style={theme.contentContainer} onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}>
              {blocks.map((blk) => {
                if (blk.type === 'image') {
                  return (
                    <DraggableImage key={blk.id} block={blk} onDrag={onDrag} onResize={onResize} />
                  );
                }
                return (
                  <TextInput
                    key={blk.id}
                    style={[styles.input, blk.type === 'h1' ? theme.h1 : blk.type === 'h2' ? theme.h2 : theme.p]}
                    value={blk.text}
                    onChangeText={(t) => setBlocks((b) => b.map((x) => (x.id === blk.id && x.type !== 'image' ? { ...x, text: t } : x)))}
                    multiline
                    placeholder={blk.type.startsWith('h') ? 'Título' : 'Texto'}
                  />
                );
              })}
            </View>
          </View>

          {/* VIEW DE IMPRESSÃO (no fluxo e invisível) para PNG/JPEG: usa Text no lugar de TextInput */}
          <View
            ref={printRef as any}
            style={[styles.card, theme.card, { opacity: 0.01, minHeight: dynamicMinHeight }]} // invisível, mas com mesmo layout e altura
            collapsable={false}
            pointerEvents="none"
            onLayout={(e) => setPrintSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
          >
            {theme.header}
            <View style={theme.contentContainer}>
              {blocks.map((blk) => {
                if (blk.type === 'image') {
                  return (
                    <View key={blk.id} style={[styles.abs, { left: blk.x, top: blk.y, width: blk.w, height: blk.h }]}>
                      <Image source={{ uri: blk.uri }} style={{ width: '100%', height: '100%', borderRadius: 6 }} />
                    </View>
                  );
                }
                return (
                  <Text key={blk.id} style={[styles.input, blk.type === 'h1' ? theme.h1 : blk.type === 'h2' ? theme.h2 : theme.p]}>
                    {blk.text}
                  </Text>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DraggableImage({
  block,
  onDrag,
  onResize,
}: {
  block: Extract<TemplateBlock, { type: 'image' }>;
  onDrag: (id: string, dx: number, dy: number) => void;
  onResize: (id: string, dw: number, dh: number) => void;
}) {
  const start = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const panMove = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        start.current = { x: block.x, y: block.y, w: block.w, h: block.h } as any;
      },
      onPanResponderMove: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        onDrag(block.id, g.dx, g.dy);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const resizeMove = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        start.current = { x: block.x, y: block.y, w: block.w, h: block.h } as any;
      },
      onPanResponderMove: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        onResize(block.id, g.dx, g.dy);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <View
      style={[
        styles.abs,
        { left: block.x, top: block.y, width: block.w, height: block.h },
      ]}
      {...panMove.panHandlers}
    >
      <Image source={{ uri: block.uri }} style={{ width: '100%', height: '100%', borderRadius: 6 }} />
      <View
        style={styles.resizeHandle}
        {...resizeMove.panHandlers}
      />
    </View>
  );
}

function getThemeForTemplate(id: TemplateId) {
  if (id === 'classic') {
    return {
      pageBg: '#FFFFFF',
      card: { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', padding: 0 } as any,
      header: <View style={{ height: 96, backgroundColor: '#D1D5DB' }} />,
      contentContainer: { padding: 16 } as any,
      h1: { fontSize: 30, fontWeight: '800', color: '#111827', marginBottom: 8 } as any,
      h2: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 10, marginBottom: 6 } as any,
      p: { fontSize: 14, color: '#111827', marginBottom: 8, lineHeight: 20 } as any,
    };
  }
  if (id === 'modern') {
    return {
      pageBg: '#FFFFFF',
      card: { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', padding: 0, flexDirection: 'row' } as any,
      header: <View style={{ width: 160, backgroundColor: '#DBEAFE' }} />, // sidebar fixa mais larga
      contentContainer: { padding: 16, flex: 1 } as any,
      h1: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 8 } as any,
      h2: { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 10, marginBottom: 6 } as any,
      p: { fontSize: 13.5, color: '#111827', marginBottom: 8, lineHeight: 20 } as any,
    };
  }
  // minimal
  return {
    pageBg: '#FFFFFF',
    card: { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', padding: 16 } as any,
    header: null as any,
    contentContainer: {} as any,
    h1: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 10 } as any,
    h2: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 12, marginBottom: 8 } as any,
    p: { fontSize: 16, color: '#111827', marginBottom: 10, lineHeight: 22 } as any,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  toolbarContainer: {
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  scroll: {
    padding: 16,
    alignItems: 'center',
  },
  page: {
    width: '100%',
    maxWidth: 740, // ~A4 útil no preview
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  card: {
    position: 'relative',
    minHeight: 980, // altura parecida com A4 útil
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  input: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  abs: {
    position: 'absolute',
  },
  resizeHandle: {
    position: 'absolute',
    width: 18,
    height: 18,
    right: -9,
    bottom: -9,
    backgroundColor: '#2F80ED',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#4B5563',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  back: {
    backgroundColor: '#6B7280',
  },
  save: {
    backgroundColor: '#10B981',
  },
  sep: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  spacer: {
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
