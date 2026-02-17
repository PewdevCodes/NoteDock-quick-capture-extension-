const THEMES = ['default', 'ocean', 'sunset', 'forest', 'aurora'];

const noteEl = document.getElementById('note');
const saveBtnEl = document.getElementById('save-btn');
const screenshotBtnEl = document.getElementById('screenshot-btn');
const statusEl = document.getElementById('status');
const metaEl = document.getElementById('meta');
const themeBtnEl = document.getElementById('theme-btn');
const todoInputEl = document.getElementById('todo-input');
const addTodoBtnEl = document.getElementById('add-todo-btn');
const todoListEl = document.getElementById('todo-list');
const todoProgressEl = document.getElementById('todo-progress');
const historyListEl = document.getElementById('history-list');
const historyEmptyEl = document.getElementById('history-empty');
const clearAllBtnEl = document.getElementById('clear-all-btn');

noteEl.focus();

function showStatus(message) {
  statusEl.textContent = message;
  setTimeout(() => {
    statusEl.textContent = '';
  }, 2000);
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function loadTheme() {
  chrome.storage.local.get({ theme: 'default' }, (data) => {
    if (data.theme !== 'default') {
      document.body.setAttribute('data-theme', data.theme);
    } else {
      document.body.removeAttribute('data-theme');
    }
  });
}

function cycleTheme() {
  chrome.storage.local.get({ theme: 'default' }, (data) => {
    const idx = THEMES.indexOf(data.theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    chrome.storage.local.set({ theme: next }, () => {
      if (next !== 'default') {
        document.body.setAttribute('data-theme', next);
      } else {
        document.body.removeAttribute('data-theme');
      }
    });
  });
}

function updateMeta() {
  chrome.storage.local.get({ notes: [], images: [] }, (data) => {
    const noteCount = data.notes.length;
    const imageCount = data.images.length;
    const parts = [];
    if (noteCount > 0)
      parts.push(`${noteCount} note${noteCount !== 1 ? 's' : ''}`);
    if (imageCount > 0)
      parts.push(`${imageCount} screenshot${imageCount !== 1 ? 's' : ''}`);

    if (parts.length > 0) {
      let text = parts.join(' \u00b7 ');
      const lastNote = data.notes[data.notes.length - 1];
      if (lastNote) {
        text += ` \u00b7 last: ${formatTime(lastNote.timestamp)}`;
      }
      metaEl.textContent = text;
    } else {
      metaEl.textContent = '';
    }
  });
}

function renderTodos() {
  chrome.storage.local.get({ todos: [] }, (data) => {
    const todos = data.todos;
    todoListEl.innerHTML = '';

    todos.forEach((todo, i) => {
      const item = document.createElement('div');
      item.className = 'todo-item' + (todo.done ? ' done' : '');

      const checkbox = document.createElement('button');
      checkbox.className = 'todo-checkbox' + (todo.done ? ' checked' : '');
      checkbox.innerHTML = todo.done ? '\u2713' : '';
      checkbox.addEventListener('click', () => toggleTodo(i));

      const text = document.createElement('span');
      text.className = 'todo-text';
      text.textContent = todo.text;

      const del = document.createElement('button');
      del.className = 'todo-delete';
      del.innerHTML = '\u00d7';
      del.addEventListener('click', () => deleteTodo(i));

      item.appendChild(checkbox);
      item.appendChild(text);
      item.appendChild(del);
      todoListEl.appendChild(item);
    });

    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    if (total > 0) {
      const pct = Math.round((done / total) * 100);
      todoProgressEl.innerHTML =
        `${done}/${total} completed (${pct}%)` +
        '<div class="todo-progress-bar"><div class="todo-progress-fill" style="width:' +
        pct +
        '%"></div></div>';
    } else {
      todoProgressEl.textContent = '';
    }
  });
}

function addTodo() {
  const text = todoInputEl.value.trim();
  if (!text) return;
  chrome.storage.local.get({ todos: [] }, (data) => {
    data.todos.push({ text, done: false, timestamp: new Date().toISOString() });
    chrome.storage.local.set({ todos: data.todos }, () => {
      todoInputEl.value = '';
      renderTodos();
    });
  });
}

function toggleTodo(index) {
  chrome.storage.local.get({ todos: [] }, (data) => {
    if (data.todos[index]) {
      data.todos[index].done = !data.todos[index].done;
      chrome.storage.local.set({ todos: data.todos }, renderTodos);
    }
  });
}

function deleteTodo(index) {
  chrome.storage.local.get({ todos: [] }, (data) => {
    data.todos.splice(index, 1);
    chrome.storage.local.set({ todos: data.todos }, renderTodos);
  });
}

function renderHistory() {
  chrome.storage.local.get({ notes: [], images: [] }, (data) => {
    const items = [];

    data.notes.forEach((n) => {
      items.push({ type: 'note', text: n.text, url: n.url, timestamp: n.timestamp });
    });

    data.images.forEach((img) => {
      items.push({ type: 'screenshot', dataUrl: img.dataUrl, url: img.url, timestamp: img.timestamp });
    });

    items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    historyListEl.innerHTML = '';

    if (items.length === 0) {
      historyEmptyEl.style.display = '';
      clearAllBtnEl.style.display = 'none';
      return;
    }

    historyEmptyEl.style.display = 'none';
    clearAllBtnEl.style.display = '';

    items.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'history-item';

      const typeEl = document.createElement('div');
      typeEl.className = 'history-type';
      typeEl.textContent = item.type;
      el.appendChild(typeEl);

      if (item.type === 'screenshot' && item.dataUrl) {
        const img = document.createElement('img');
        img.className = 'history-thumb';
        img.src = item.dataUrl;
        el.appendChild(img);
      }

      if (item.text) {
        const textEl = document.createElement('div');
        textEl.className = 'history-text';
        textEl.textContent = item.text.length > 120 ? item.text.slice(0, 120) + '...' : item.text;
        el.appendChild(textEl);
      }

      if (item.url) {
        const urlEl = document.createElement('div');
        urlEl.className = 'history-url';
        urlEl.textContent = item.url;
        el.appendChild(urlEl);
      }

      const timeEl = document.createElement('div');
      timeEl.className = 'history-time';
      timeEl.textContent = formatTime(item.timestamp);
      el.appendChild(timeEl);

      historyListEl.appendChild(el);
    });
  });
}

// --- Tabs ---
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');

    if (tab.dataset.tab === 'todos') renderTodos();
    if (tab.dataset.tab === 'history') renderHistory();
    if (tab.dataset.tab === 'capture') noteEl.focus();
  });
});

// --- Theme ---
themeBtnEl.addEventListener('click', cycleTheme);

// --- Save Note ---
saveBtnEl.addEventListener('click', () => {
  const text = noteEl.value.trim();
  if (!text) {
    showStatus('Nothing to save.');
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url || '';
    const entry = {
      text,
      url,
      timestamp: new Date().toISOString(),
    };

    chrome.storage.local.get({ notes: [] }, (data) => {
      data.notes.push(entry);
      chrome.storage.local.set({ notes: data.notes }, () => {
        noteEl.value = '';
        showStatus('Saved!');
        updateMeta();
      });
    });
  });
});

// --- Screenshot ---
screenshotBtnEl.addEventListener('click', () => {
  screenshotBtnEl.disabled = true;
  chrome.runtime.sendMessage({ action: 'captureScreenshot' }, (response) => {
    screenshotBtnEl.disabled = false;
    if (response?.success) {
      showStatus('Screenshot saved!');
      updateMeta();
    } else {
      showStatus('Screenshot failed.');
    }
  });
});

// --- Todos ---
addTodoBtnEl.addEventListener('click', addTodo);
todoInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

// --- Clear All ---
clearAllBtnEl.addEventListener('click', () => {
  if (confirm('Delete all saved notes, screenshots, and todos?')) {
    chrome.storage.local.set({ notes: [], images: [], todos: [] }, () => {
      renderHistory();
      renderTodos();
      updateMeta();
      showStatus('All data cleared.');
    });
  }
});

// --- Init ---
loadTheme();
updateMeta();
