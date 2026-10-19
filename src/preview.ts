// Local preview that mimics GitHub's profile README frame: images only, no scripts inside the SVGs.
export function previewHtml(sections: { file: string; href: string; alt: string }[]) {
  const imgs = sections
    .map((s) => `<a href="${s.href}"><img src="${s.file}" alt="${s.alt}" width="100%"></a>`)
    .join('\n      ');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Profile Preview</title>
<style>
  body{margin:0;background:#0d1117;color:#e6edf3;font:14px -apple-system,Segoe UI,sans-serif}
  header{position:sticky;top:0;z-index:1;display:flex;gap:8px;align-items:center;padding:10px 16px;background:#010409;border-bottom:1px solid #30363d}
  header b{margin-right:auto;font-weight:600}
  button{background:#21262d;color:#e6edf3;border:1px solid #30363d;border-radius:6px;padding:5px 12px;font:inherit;cursor:pointer}
  button[aria-pressed=true]{border-color:#F53F06;color:#F53F06}
  main{display:flex;justify-content:center;padding:32px 16px}
  .box{width:100%;max-width:806px;border:1px solid #30363d;border-radius:6px;padding:24px;box-sizing:border-box;transition:max-width .3s}
  .box.mobile{max-width:380px;padding:16px}
  .path{font:12px ui-monospace,monospace;margin-bottom:16px}
  .readme img{display:block;max-width:100%;margin-bottom:16px}
</style></head>
<body>
  <header><b>tam11a / README.md preview</b>
    <button id="replay">Replay</button>
    <button id="desk" aria-pressed="true">Desktop</button>
    <button id="mob" aria-pressed="false">Mobile</button>
  </header>
  <main><div class="box" id="box"><div class="path"><b>tam11a</b> / README.md</div>
    <div class="readme">
      ${imgs}
    </div></div></main>
<script>
  const box = document.getElementById('box');
  const set = (m) => { box.classList.toggle('mobile', m); desk.setAttribute('aria-pressed', !m); mob.setAttribute('aria-pressed', m); };
  desk.onclick = () => set(false); mob.onclick = () => set(true);
  replay.onclick = () => document.querySelectorAll('.readme img').forEach((i) => i.src = i.src.split('?')[0] + '?t=' + Date.now());
</script>
</body></html>`;
}
