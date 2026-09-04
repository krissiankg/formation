const vscode = require('vscode');
const https = require('https');

function activate(context) {
  // Provider pour le webview latéral
  const provider = new ForgeIaChatViewProvider(context.extensionUri, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ForgeIaChatViewProvider.viewType, provider)
  );

  // Commande : Configurer clé
  context.subscriptions.push(
    vscode.commands.registerCommand('forgeia.configureKey', async () => {
      const config = vscode.workspace.getConfiguration('forgeia');
      const currentKey = config.get('apiKey') || '';
      const key = await vscode.window.showInputBox({
        title: 'Forge IA — Clé Étudiant',
        prompt: 'Entrez votre clé personnelle (disponible dans votre Espace Apprenant)',
        value: currentKey,
        ignoreFocusOut: true
      });
      if (key !== undefined) {
        await config.update('apiKey', key.trim(), vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('Forge IA : Clé étudiant enregistrée avec succès !');
        provider.updateAuthStatus();
      }
    })
  );

  // Commande : Expliquer le code
  context.subscriptions.push(
    vscode.commands.registerCommand('forgeia.explainCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection.trim()) {
        vscode.window.showWarningMessage('Forge IA : Veuillez d\'abord sélectionner du code.');
        return;
      }
      await vscode.commands.executeCommand('forgeia.chatView.focus');
      provider.sendPrompt(`Explique en détail ce code et son fonctionnement en français :\n\`\`\`${editor.document.languageId}\n${selection}\n\`\`\``);
    })
  );

  // Commande : Corriger le code
  context.subscriptions.push(
    vscode.commands.registerCommand('forgeia.fixCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection.trim()) {
        vscode.window.showWarningMessage('Forge IA : Veuillez d\'abord sélectionner du code.');
        return;
      }
      await vscode.commands.executeCommand('forgeia.chatView.focus');
      provider.sendPrompt(`Analyse ce code, repère les bugs éventuels, optimise-le et fournis une version propre et corrigée en français :\n\`\`\`${editor.document.languageId}\n${selection}\n\`\`\``);
    })
  );
}

class ForgeIaChatViewProvider {
  static viewType = 'forgeia.chatView';

  constructor(extensionUri, context) {
    this._extensionUri = extensionUri;
    this._context = context;
    this._view = undefined;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'sendMessage':
          await this._handleUserMessage(data.text);
          break;
        case 'openSettings':
          await vscode.commands.executeCommand('forgeia.configureKey');
          break;
        case 'insertCode':
          this._insertCodeIntoEditor(data.code);
          break;
      }
    });
  }

  updateAuthStatus() {
    if (this._view) {
      const config = vscode.workspace.getConfiguration('forgeia');
      const hasKey = Boolean(config.get('apiKey'));
      this._view.webview.postMessage({ type: 'authUpdate', hasKey });
    }
  }

  sendPrompt(prompt) {
    if (this._view) {
      this._view.webview.postMessage({ type: 'prefill', text: prompt });
      this._handleUserMessage(prompt);
    }
  }

  _insertCodeIntoEditor(code) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Aucun éditeur ouvert pour insérer le code.');
      return;
    }
    editor.edit((editBuilder) => {
      editBuilder.insert(editor.selection.active, code);
    });
  }

  async _handleUserMessage(userPrompt) {
    const config = vscode.workspace.getConfiguration('forgeia');
    const apiUrl = config.get('apiUrl') || 'https://ia.guelichweb.store/v1';
    const apiKey = config.get('apiKey');
    const model = config.get('model') || 'deepseek/deepseek-chat';

    if (!apiKey) {
      this._view.webview.postMessage({
        type: 'botMessage',
        text: '⚠️ **Clé Étudiant manquante** : Cliquez sur "Configurer ma clé" ci-dessus ou dans votre Espace Apprenant pour l\'activer.'
      });
      return;
    }

    this._view.webview.postMessage({ type: 'typing', isTyping: true });

    try {
      const responseText = await this._callGateway(apiUrl, apiKey, model, userPrompt);
      this._view.webview.postMessage({ type: 'typing', isTyping: false });
      this._view.webview.postMessage({ type: 'botMessage', text: responseText });
    } catch (err) {
      this._view.webview.postMessage({ type: 'typing', isTyping: false });
      this._view.webview.postMessage({
        type: 'botMessage',
        text: `❌ Erreur de connexion à la passerelle IA : ${err.message}`
      });
    }
  }

  _callGateway(apiUrl, apiKey, model, prompt) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${apiUrl}/chat/completions`);
      const body = JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'Tu es Forge IA Assistant, l\'assistant de programmation officiel de la formation FORGE IA. Tu réponds de manière experte, claire, pédagogique et directement utilisable en français.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false
      });

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(rawData);
              const content = parsed.choices?.[0]?.message?.content || 'Aucune réponse reçue.';
              resolve(content);
            } catch (e) {
              reject(new Error('Erreur de parsing de la réponse'));
            }
          } else {
            reject(new Error(`Code HTTP ${res.statusCode} — ${rawData.slice(0, 100)}`));
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.write(body);
      req.end();
    });
  }

  _getHtmlForWebview(webview) {
    const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'icon.png'));
    const config = vscode.workspace.getConfiguration('forgeia');
    const hasKey = Boolean(config.get('apiKey'));

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forge IA Assistant</title>
  <style>
    :root {
      --accent: #aa9158;
      --bg: var(--vscode-sideBar-background);
      --text: var(--vscode-foreground);
    }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      margin: 0;
      padding: 12px;
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--vscode-sideBar-border);
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      letter-spacing: 0.05em;
    }
    .brand img {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }
    .badge {
      font-size: 10px;
      background: rgba(170, 145, 88, 0.2);
      color: #dfc888;
      padding: 2px 6px;
      border-radius: 10px;
      border: 1px solid rgba(170, 145, 88, 0.4);
    }
    .btn-config {
      background: none;
      border: 1px solid var(--vscode-button-border, #444);
      color: var(--text);
      cursor: pointer;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .btn-config:hover {
      background: var(--vscode-button-hoverBackground);
    }
    #chat-log {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-right: 4px;
      margin-bottom: 10px;
    }
    .msg {
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 12px;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .msg.user {
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      align-self: flex-end;
      max-width: 85%;
    }
    .msg.bot {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-widget-border);
      align-self: flex-start;
      max-width: 95%;
    }
    .typing {
      font-style: italic;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      display: none;
    }
    .input-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    textarea {
      width: 100%;
      height: 65px;
      box-sizing: border-box;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 6px;
      padding: 8px;
      font-family: inherit;
      font-size: 12px;
      resize: none;
    }
    textarea:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
    }
    .btn-send {
      background: #aa9158;
      color: #171d17;
      font-weight: 700;
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-send:hover {
      background: #c5ad75;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <img src="${iconUri}" alt="Logo" />
      <span>FORGE IA</span>
    </div>
    <div style="display:flex; align-items:center; gap:6px;">
      <span class="badge" id="authBadge">${hasKey ? 'Connecté' : 'Non configuré'}</span>
      <button class="btn-config" id="btnConfig" title="Changer de clé">⚙️ Clé</button>
    </div>
  </div>

  <div id="chat-log">
    <div class="msg bot">👋 Bienvenue sur **Forge IA Assistant** !<br>Je suis connecté à la passerelle d'IA privée de votre formation. Posez-moi une question, sélectionnez du code ou demandez-moi de générer votre application.</div>
  </div>

  <div class="typing" id="typingIndicator">Forge IA réfléchit...</div>

  <div class="input-box">
    <textarea id="promptInput" placeholder="Posez une question ou décrivez votre besoin... (Entrée pour envoyer)"></textarea>
    <div class="actions">
      <button class="btn-send" id="btnSend">Envoyer</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const chatLog = document.getElementById('chat-log');
    const promptInput = document.getElementById('promptInput');
    const btnSend = document.getElementById('btnSend');
    const btnConfig = document.getElementById('btnConfig');
    const typingIndicator = document.getElementById('typingIndicator');
    const authBadge = document.getElementById('authBadge');

    function appendMessage(text, role) {
      const div = document.createElement('div');
      div.className = 'msg ' + role;
      div.innerText = text;
      chatLog.appendChild(div);
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    btnConfig.addEventListener('click', () => {
      vscode.postMessage({ type: 'openSettings' });
    });

    btnSend.addEventListener('click', () => {
      const text = promptInput.value.trim();
      if (!text) return;
      appendMessage(text, 'user');
      promptInput.value = '';
      vscode.postMessage({ type: 'sendMessage', text });
    });

    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        btnSend.click();
      }
    });

    window.addEventListener('message', (event) => {
      const message = event.data;
      switch (message.type) {
        case 'botMessage':
          appendMessage(message.text, 'bot');
          break;
        case 'typing':
          typingIndicator.style.display = message.isTyping ? 'block' : 'none';
          chatLog.scrollTop = chatLog.scrollHeight;
          break;
        case 'authUpdate':
          authBadge.innerText = message.hasKey ? 'Connecté' : 'Non configuré';
          break;
        case 'prefill':
          appendMessage(message.text, 'user');
          break;
      }
    });
  </script>
</body>
</html>`;
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
