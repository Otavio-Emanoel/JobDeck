export type TemplateId = 'classic' | 'modern' | 'minimal';

export type TemplateNode =
  | { id: string; type: 'title'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'image'; uri: string; width: number; height: number; x?: number; y?: number };

export interface TemplateDoc {
  templateId: TemplateId;
  nodes: TemplateNode[];
}

