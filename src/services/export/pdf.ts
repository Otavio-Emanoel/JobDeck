import type { Resume } from '../../types/resume';
import type { TemplateDoc, TemplateNode } from '../../types/template';

function escapeHtml(str: string) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sectionDivider() {
  return '<hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;"/>';
}

function guessMime(uri: string) {
  const u = (uri || '').toLowerCase();
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

async function toDataUri(uri?: string | null) {
  if (!uri) return null as string | null;
  try {
    const FS: any = await import('expo-file-system');
    async function read(path: string) {
      return await FS.readAsStringAsync(path, { encoding: 'base64' });
    }
    let base64: string | null = null;
    try {
      base64 = await read(uri);
    } catch {
      const tmp = `${(FS as any).cacheDirectory}img-${Date.now()}.jpg`;
      try {
        await FS.copyAsync({ from: uri, to: tmp });
        base64 = await read(tmp);
      } catch {
        base64 = null;
      }
    }
    if (!base64) return null;
    return `data:${guessMime(uri)};base64,${base64}`;
  } catch {
    return null;
  }
}

function renderTemplateNodes(nodes: TemplateNode[], opts?: { scale?: number }) {
  const s = opts?.scale ?? 1;
  const flow: string[] = [];
  const abs: string[] = [];
  for (const n of nodes) {
    if (n.type === 'title') {
      flow.push(`<h2 style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#111827;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(n.text)}</h2>`);
    } else if (n.type === 'paragraph') {
      flow.push(`<p style="margin:0 0 10px 0;color:#111827;line-height:20px;font-size:14px;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(n.text)}</p>`);
    } else if (n.type === 'image') {
      const w = Math.max(24, Math.min(550, Math.round(n.width * s)));
      const h = Math.max(24, Math.min(800, Math.round(n.height * s)));
      const img = `<img src="${escapeHtml(n.uri)}" style="width:${w}px;height:${h}px;object-fit:cover;border-radius:6px;" />`;
      if (typeof n.x === 'number' && typeof n.y === 'number') {
        const x = Math.max(0, Math.round(n.x * s));
        const y = Math.max(0, Math.round(n.y * s));
        abs.push(`<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;">${img}</div>`);
      } else {
        flow.push(`<div style="margin:6px 0;">${img}</div>`);
      }
    }
  }
  return { flowHtml: flow.join(''), absoluteHtml: abs.join('') };
}

function generateHTML(resume: Resume, opts?: { avatarDataUri?: string }) {
  const p = resume.personal ?? ({} as Resume['personal']);
  const edu = resume.education ?? [];
  const exp = resume.experiences ?? [];
  const skills = resume.skills ?? [];
  const languages = resume.languages ?? [];

  const avatar = opts?.avatarDataUri
    ? `<img src="${opts.avatarDataUri}" style="width:180px;height:180px;border-radius:9999px;object-fit:cover;" />`
    : '';

  const objectiveHtml = p.summary ? `<p style="margin:8px 0 0 0;color:#111827;">${escapeHtml(p.summary)}</p>` : '<p style="margin:8px 0 0 0;color:#6B7280;">Sem objetivo informado.</p>';

  const eduHtml = edu
    .map(
      (e) => `
        <div style="margin:10px 0;">
          <div style="font-weight:700;color:#111827;">${escapeHtml(e.degree)}${e.institution ? ` - ${escapeHtml(e.institution)}` : ''}</div>
          <div style="color:#6B7280; font-size:12px;">${e.startDate ? `Início ${escapeHtml(e.startDate)}` : ''}${e.startDate && e.endDate ? ' - ' : ''}${e.endDate ? `conclusão ${escapeHtml(e.endDate)}` : ''}</div>
        </div>`
    )
    .join('');

  const expHtml = exp
    .map(
      (e) => `
        <div style="margin:12px 0;">
          <div style="font-weight:700;color:#111827;">${(e.startDate || e.endDate) ? `${escapeHtml(e.startDate || '')}${e.endDate ? ' - ' + escapeHtml(e.endDate) : ''}` : ''} ${e.role ? '• ' + escapeHtml(e.role) : ''}</div>
          ${e.company ? `<div style="color:#111827;">${escapeHtml(e.company)}</div>` : ''}
          ${e.description ? `<div style="color:#374151; font-size:14px; line-height:20px;">${escapeHtml(e.description)}</div>` : ''}
        </div>`
    )
    .join('');

  const skillsHtml = skills.length
    ? `<ul style="columns:2;list-style:disc;padding-left:18px;color:#111827;margin:0;">${skills
        .map((s) => `<li style="margin:6px 0;">${escapeHtml(s.name)}</li>`)
        .join('')}</ul>`
    : '<div style="color:#6B7280;">Sem habilidades informadas.</div>';

  const contactItems = [
    p.location ? `📍 ${escapeHtml(p.location)}` : '',
    p.phone ? `📞 ${escapeHtml(p.phone)}` : '',
    p.email ? `✉️ ${escapeHtml(p.email)}` : '',
    p.website ? `🔗 ${escapeHtml(p.website)}` : '',
  ].filter(Boolean);

  const contactHtml = contactItems.length
    ? contactItems.map((c) => `<div style="margin:4px 0; color:#111827;">${c}</div>`).join('')
    : '<div style="color:#6B7280;">Sem contatos informados.</div>';

  const role = (p as any).role || '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @page { size: A4; margin: 24px; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111827; }
    .card { border:1px solid #E5E7EB; border-radius:12px; overflow:hidden; }
    .top { background:#D3D3D3; padding:24px; display:flex; gap:24px; align-items:center; }
    .name { font-size:36px; font-weight:800; margin:0; }
    .role { font-size:20px; color:#374151; margin:4px 0 12px 0; }
    .divider { border-top:2px solid #111827; width:100%; max-width:520px; margin:8px 0 10px 0; }
    .content { padding: 20px 24px 24px 24px; }
    .section { margin: 4px 0 0 0; }
    .section-title { font-weight:800; font-size:20px; margin:0 0 6px 0; }
    .muted { color:#6B7280; }
  </style>
</head>
<body>
  <div class="card">
    <div class="top">
      <div>${avatar}</div>
      <div style="flex:1;">
        <div class="name">${escapeHtml(p.fullName || 'Seu Nome')}</div>
        ${role ? `<div class="role">${escapeHtml(role)}</div>` : ''}
        <div class="divider"></div>
        <div>${contactHtml}</div>
      </div>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">OBJETIVO</div>
        ${objectiveHtml}
      </div>
      ${sectionDivider()}
      <div class="section">
        <div class="section-title">FORMAÇÃO</div>
        ${eduHtml || '<div class="muted">Sem formação informada.</div>'}
      </div>
      ${sectionDivider()}
      <div class="section">
        <div class="section-title">EXPERIÊNCIAS</div>
        ${expHtml || '<div class="muted">Sem experiências informadas.</div>'}
      </div>
      ${sectionDivider()}
      <div class="section">
        <div class="section-title">HABILIDADES</div>
        ${skillsHtml}
        ${languages.length ? `<div style="margin-top:12px;"><strong>Idiomas:</strong> ${languages.map(escapeHtml).join(', ')}</div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function exportToPdf(resume: Resume) {
  const avatarDataUri = await toDataUri(resume.personal?.avatarUri);
  const html = generateHTML(resume, { avatarDataUri: avatarDataUri ?? undefined });
  const { printToFileAsync } = await import('expo-print');
  const file = await printToFileAsync({ html });
  return file.uri as unknown as string;
}

export async function shareFile(uri: string) {
  const Sharing: any = await import('expo-sharing');
  const available = await Sharing.isAvailableAsync?.();
  if (available) {
    await Sharing.shareAsync(uri);
  }
}

export async function exportTemplateToPdf(doc: TemplateDoc, opts?: { canvasWidth?: number; targetWidth?: number }) {
  // Converter imagens de nodes para data URI se forem file:// ou content://
  const FS: any = await import('expo-file-system');
  const nodes: TemplateNode[] = [];
  for (const n of doc.nodes) {
    if (n.type === 'image' && (n.uri.startsWith('file:') || n.uri.startsWith('content:'))) {
      try {
        const base64 = await FS.readAsStringAsync(n.uri, { encoding: 'base64' });
        const mime = n.uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
        nodes.push({ ...n, uri: `data:${mime};base64,${base64}` });
      } catch {
        nodes.push(n);
      }
    } else {
      nodes.push(n);
    }
  }

  const targetWidth = opts?.targetWidth ?? 700; // largura útil dentro da página
  const base = opts?.canvasWidth && opts.canvasWidth > 0 ? opts.canvasWidth : targetWidth;
  const scale = targetWidth / base; // fator para converter posições do preview -> PDF

  const { flowHtml, absoluteHtml } = renderTemplateNodes(nodes, { scale });

  // Layouts diferentes por template
  const id = (doc as any).templateId as string;
  let bodyInner = '';
  if (id === 'classic') {
    bodyInner = `
      <div class="card">
        <div style="height:96px;background:#D1D5DB;"></div>
        <div class="content" style="position:relative;padding:16px;">
          ${flowHtml}
          ${absoluteHtml}
        </div>
      </div>`;
  } else if (id === 'modern') {
    bodyInner = `
      <div class="card" style="display:flex;flex-direction:row;">
        <div style="width:160px;background:#DBEAFE;min-height:1000px;"></div>
        <div class="content" style="position:relative;padding:16px;flex:1;">
          ${flowHtml}
          ${absoluteHtml}
        </div>
      </div>`;
  } else {
    // minimal
    bodyInner = `
      <div class="card">
        <div class="content" style="position:relative;padding:16px;">
          ${flowHtml}
          ${absoluteHtml}
        </div>
      </div>`;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  @page { size: A4; margin: 24px; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color:#111827; margin:0; }
  .page { width: ${targetWidth}px; margin: 24px auto; }
  .card { position: relative; border:1px solid #E5E7EB; border-radius:12px; background:#FFFFFF; min-height: 1000px; width: 100%; overflow:hidden; }
</style>
</head>
<body>
  <div class="page">
    ${bodyInner}
  </div>
</body>
</html>`;

  const { printToFileAsync } = await import('expo-print');
  const file = await printToFileAsync({ html });
  return file.uri as unknown as string;
}
