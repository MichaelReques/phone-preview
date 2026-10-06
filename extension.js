const vscode = require('vscode');

let panel = null;

function getNonce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('phonePreview.open', () => openPanel(context))
  );

  // Reload on save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      const cfg = vscode.workspace.getConfiguration('phonePreview');
      if (panel && cfg.get('autoReloadOnSave')) {
        // short delay so the dev server finishes serving the new file
        setTimeout(() => panel && panel.webview.postMessage({ type: 'reload' }), 300);
      }
    })
  );
}

function openPanel(context) {
  if (panel) {
    panel.reveal(vscode.ViewColumn.Beside);
    return;
  }

  panel = vscode.window.createWebviewPanel(
    'phonePreview',
    'Phone Preview',
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
    }
  );

  panel.webview.html = getHtml(panel.webview, context.extensionUri);
  panel.onDidDispose(() => { panel = null; }, null, context.subscriptions);
}

function getHtml(webview, extensionUri) {
  const nonce = getNonce();
  const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'panel.css'));
  const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'panel.js'));
  const defaultUrl = vscode.workspace.getConfiguration('phonePreview').get('defaultUrl');

  // frame-src permite cargar tu servidor local dentro del iframe
  const csp = [
    "default-src 'none'",
    `style-src ${webview.cspSource}`,
    `script-src 'nonce-${nonce}'`,
    'frame-src http://localhost:* http://127.0.0.1:* https:'
  ].join('; ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${cssUri}">
  <title>Phone Preview</title>
</head>
<body data-default-url="${defaultUrl}">
  <header class="bar">
    <select id="device" aria-label="Device">
      <option value="iphone15">iPhone 15</option>
      <option value="iphone15promax">iPhone 15 Pro Max</option>
      <option value="pixel10">Google Pixel 10</option>
    </select>
    <button id="rotate" title="Rotate">Rotate</button>
    <button id="scroll" title="Show or hide the scrollbar">Scroll</button>
    <button id="chrome" title="Browser bars: dark or light">Bars</button>
    <select id="zoom" aria-label="Zoom">
      <option value="fit">Fit</option>
      <option value="50">50%</option>
      <option value="75">75%</option>
      <option value="100">100%</option>
    </select>
    <input id="url" type="text" spellcheck="false" aria-label="URL">
    <button id="reload" title="Reload">Reload</button>
    <span id="size" class="size"></span>
  </header>
  <main id="stage" class="stage">
    <div id="holder" class="holder">
      <div id="frame" class="frame">
        <div id="screen" class="screen">
          <div id="status" class="status"><span id="clock" class="clock"></span><span id="sysicons" class="sysicons"></span></div>

          <!-- Chrome (Android) -->
          <div class="topbar">
            <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/></svg>
            <div class="urlpill">
              <svg class="ic sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 016 0v3"/></svg>
              <span id="hostAnd" class="host"></span>
            </div>
            <div class="tabbox">1</div>
            <svg class="ic" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </div>

          <iframe id="view" title="Preview"></iframe>

          <!-- Safari (iOS) -->
          <div class="bottombar">
            <div class="row-pill">
              <div class="urlpill ios">
                <span class="aa">AA</span>
                <span class="center">
                  <svg class="ic sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 016 0v3"/></svg>
                  <span id="hostIos" class="host"></span>
                </span>
                <svg id="reloadIos" class="ic sm clickable" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 11-2.3-5.7M20 4v5h-5"/></svg>
              </div>
            </div>
            <div class="tools">
              <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
              <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
              <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8 8l4-4 4 4M6 11H5v9h14v-9h-1"/></svg>
              <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5zM12 6v13"/></svg>
              <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/></svg>
            </div>
            <div class="homeind"><i></i></div>
          </div>

          <!-- Barra de gestos (Android) -->
          <div class="navbar"><i></i></div>

          <div id="cutout" class="cutout"></div>
        </div>
      </div>
    </div>
  </main>
  <script nonce="${nonce}" src="${jsUri}"></script>
</body>
</html>`;
}

function deactivate() {}

module.exports = { activate, deactivate };
