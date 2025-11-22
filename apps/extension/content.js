// Content script to extract page content
console.log("MyAINote Clipper content script loaded");

function extractContent() {
    const title = document.title;
    const url = window.location.href;
    const html = document.body.innerHTML;

    // Basic extraction for now. 
    // In Phase 2, we will use readability.js here or on the server side.

    return {
        title,
        url,
        html: html.substring(0, 1000) + "..." // Truncate for now
    };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extract") {
        const data = extractContent();
        sendResponse(data);
    }
    return true;
});
