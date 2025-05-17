// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    platform: process.platform,
    // Send a message to the main process
    send: (channel, data) => {
      // Whitelist channels
      const validChannels = ['toMain', 'saveSettings', 'requestUpdate'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive a message from the main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'updateAvailable', 'settingsSaved'];
      if (validChannels.includes(channel)) {
        // Remove the event to avoid memory leaks
        ipcRenderer.removeAllListeners(channel);
        // Add a new listener
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);

// Notify when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  // Example of how to display app version or environment info
  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});
  