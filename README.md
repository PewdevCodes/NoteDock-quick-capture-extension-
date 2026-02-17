# NoteDock — Quick Capture Browser Extension

**NoteDock** is a lightweight browser extension that lets you instantly save notes, links, and screenshots while browsing — without switching tabs or opening external apps.  
Click the extension, write your thought, save it, and keep moving.

Everything runs locally inside your browser for speed and simplicity.

---

## ✨ Features

- 📝 Quick note capture from any website
- 🔗 Automatically saves the current page URL with your note
- 📸 Capture a screenshot of the active tab
- ⚡ Fast popup interface
- 🔒 Local-first storage (no servers, no tracking)

---

## 📂 Project Structure

quick-capture-extension/
│
├── icons/           # Extension icons
├── background.js    # Background service worker (handles screenshots)
├── manifest.json    # Extension configuration
├── popup.html       # Popup UI
├── popup.js         # Popup logic
├── style.css        # Styling


---

## 🚀 Installation (Manual / Developer Mode)

Since NoteDock is not published on the Chrome Web Store, install it manually:

1. Download or clone this repository.
2. Open Chrome and go to:

```

chrome://extensions

```

3. Enable **Developer Mode** (top right).
4. Click **Load unpacked**.
5. Select the `quick-capture-extension` folder.

The NoteDock icon should now appear in your toolbar.

---

## 🧠 How to Use

1. Open any website.
2. Click the NoteDock extension icon.
3. Write your note in the popup.
4. Click **Save** to store it.
5. Click **Capture Image** to save a screenshot of the page.

Notes and images are stored locally in your browser.

---

## 🔐 Privacy

- No data collection
- No external servers
- No tracking
- All information stays in local browser storage

---

## 🛠 Tech Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript
- HTML + CSS
- Chrome Storage API

---

## 📌 Notes

This project is a lightweight productivity tool built for quick capture workflows.  
Feel free to fork, modify, or improve the extension.

---

