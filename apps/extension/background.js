// Background service worker
console.log("MyAINote Clipper background script loaded");

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveContent") {
    console.log("Received content to save:", request.data);
    // TODO: Send to Tauri app via localhost
    // fetch('http://localhost:1420/save', { ... })
    sendResponse({ status: "received" });
  }
  return true;
});
