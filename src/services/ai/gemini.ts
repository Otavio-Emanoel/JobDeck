import { GEMINI_API_KEY } from '@env';

// Placeholder de integração com Gemini. Substitua por chamadas reais de API.
export async function generateHtmlFromPrompt(prompt: string): Promise<string> {
  const key = GEMINI_API_KEY?.trim();
  if (!key) {
    // Fallback: conteúdo estático quando não há chave
    const boiler = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\"/>\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>\n<title>Portfólio</title>\n<style>body{font-family:Arial,Helvetica,sans-serif;margin:0;padding:24px;background:#f7f7f8;color:#111}header{padding:24px;border-radius:12px;background:#111;color:#fff;margin-bottom:24px}section{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px}a.btn{display:inline-block;background:#2F80ED;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:700}</style>\n</head>\n<body>\n<header>\n  <h1>Meu Portfólio</h1>\n  <p>Gerado a partir do prompt: ${prompt.replace(/</g,'&lt;')}</p>\n</header>\n<section>\n  <h2>Sobre mim</h2>\n  <p>Adicione sua biografia aqui.</p>\n</section>\n<section>\n  <h2>Projetos</h2>\n  <ul>\n    <li>Projeto A</li>\n    <li>Projeto B</li>\n    <li>Projeto C</li>\n  </ul>\n  <a class=\"btn\" href=\"#\">Contato</a>\n</section>\n</body>\n</html>`;
    return boiler;
  }

  try {
    const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `Gere apenas HTML completo de um portfólio. Regras: \n- Inclua <!DOCTYPE html> e <html>...\n- CSS embutido simples\n- Sem scripts externos\n- Tema moderno\n\nPrompt: ${prompt}` },
            ],
          },
        ],
      }),
    });
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text === 'string' && text.trim()) {
      return text;
    }
  } catch (e) {
    // noop -> cai para fallback
  }

  // Fallback caso a chamada falhe
  return `<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\"/>\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>\n<title>Portfólio</title>\n<style>body{font-family:Arial,Helvetica,sans-serif;margin:0;padding:24px;background:#f7f7f8;color:#111}header{padding:24px;border-radius:12px;background:#111;color:#fff;margin-bottom:24px}section{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px}a.btn{display:inline-block;background:#2F80ED;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:700}</style>\n</head>\n<body>\n<header>\n  <h1>Meu Portfólio</h1>\n  <p>Gerado a partir do prompt: ${prompt.replace(/</g,'&lt;')}</p>\n</header>\n<section>\n  <h2>Sobre mim</h2>\n  <p>Falha ao chamar a API. Mostrando fallback.</p>\n</section>\n</body>\n</html>`;
}
