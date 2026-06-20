(function () {
  const vscode = acquireVsCodeApi();

  let state = { mode: 'default', chips: [], sessionActive: false };
  let wasEverActive = false;

  const welcomeScreen  = document.getElementById('welcome-screen');
  const mainPanel      = document.getElementById('main-panel');
  const chipsArea      = document.getElementById('chips-area');
  const input          = document.getElementById('input');
  const btnSend        = document.getElementById('btn-send');
  const btnSlash       = document.getElementById('btn-slash');
  const btnModel       = document.getElementById('btn-model');
  const modeSelect     = document.getElementById('mode-select');
  const btnRestart     = document.getElementById('btn-restart');
  const btnNew         = document.getElementById('btn-new-session');
  const btnStartSession = document.getElementById('btn-start-session');

  // ── Render ──────────────────────────────────────────────

  function renderView() {
    const showWelcome = !state.sessionActive && !wasEverActive;
    welcomeScreen.style.display = showWelcome ? 'flex' : 'none';
    mainPanel.style.display     = showWelcome ? 'none' : 'flex';
  }

  function renderChips() {
    if (state.chips.length === 0) {
      chipsArea.innerHTML = '<span class="chips-placeholder">Select code in editor · press Alt+G to add context</span>';
      return;
    }
    chipsArea.innerHTML = state.chips.map(chip => `
      <span class="chip" title="${escHtml(chip.text)}">
        <span class="chip__label">${escHtml(chip.label)}</span>
        <button class="chip-remove" data-id="${chip.id}" aria-label="Remove">×</button>
      </span>
    `).join('');
  }

  function renderMode() {
    modeSelect.value  = state.mode;
    modeSelect.disabled = state.sessionActive;
    btnRestart.hidden = !state.sessionActive;
  }

  function updateSendBtn() {
    if (!state.sessionActive && wasEverActive) {
      btnSend.disabled    = false;
      btnSend.textContent = 'new session';
      btnSend.title       = 'Start a new session with current mode';
    } else {
      btnSend.disabled    = input.value.trim() === '';
      btnSend.textContent = '→';
      btnSend.title       = 'Send (Enter)';
    }
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Events ──────────────────────────────────────────────

  input.addEventListener('input', updateSendBtn);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (!state.sessionActive && wasEverActive) {
        vscode.postMessage({ type: 'startSession' });
      } else if (!btnSend.disabled) {
        sendMessage();
      }
    }
  });

  btnSend.addEventListener('click', () => {
    if (!state.sessionActive && wasEverActive) {
      vscode.postMessage({ type: 'startSession' });
    } else {
      sendMessage();
    }
  });

  btnSlash.addEventListener('click', () => {
    vscode.postMessage({ type: 'openSlashPicker' });
  });

  btnModel.addEventListener('click', () => {
    vscode.postMessage({ type: 'openModelPicker' });
  });

  btnNew.addEventListener('click', () => {
    vscode.postMessage({ type: 'newSession' });
  });

  btnRestart.addEventListener('click', () => {
    vscode.postMessage({ type: 'newSession' });
  });

  btnStartSession.addEventListener('click', () => {
    vscode.postMessage({ type: 'newSession' });
  });

  modeSelect.addEventListener('change', () => {
    state.mode = modeSelect.value;
    vscode.postMessage({ type: 'setMode', mode: state.mode });
    input.focus();
  });

  chipsArea.addEventListener('click', e => {
    const btn = e.target.closest('.chip-remove');
    if (btn) vscode.postMessage({ type: 'removeChip', id: btn.dataset.id });
  });

  function sendMessage() {
    const message = input.value.trim();
    if (!message) return;
    vscode.postMessage({ type: 'send', message });
  }

  // ── Host messages ────────────────────────────────────────

  window.addEventListener('message', e => {
    const msg = e.data;
    switch (msg.type) {
      case 'state':
        state = msg.state;
        if (state.sessionActive) wasEverActive = true;
        renderChips();
        renderMode();
        updateSendBtn();
        renderView();
        break;
      case 'chipAdded':
        state.chips.push(msg.chip);
        renderChips();
        break;
      case 'sessionStatusChanged':
        state.sessionActive = msg.active;
        if (msg.active) {
          wasEverActive = true;
          setTimeout(() => input.focus(), 100);
        }
        renderMode();
        updateSendBtn();
        renderView();
        break;
      case 'clearAfterSend':
        state.chips = [];
        input.value = '';
        renderChips();
        updateSendBtn();
        break;
    }
  });

  vscode.postMessage({ type: 'ready' });
})();
