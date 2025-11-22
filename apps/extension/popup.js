document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    saveBtn.addEventListener('click', async () => {
        statusDiv.textContent = "Extracting...";

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.id) {
                statusDiv.textContent = "Error: No active tab";
                return;
            }

            // Send message to content script to extract data
            const response = await chrome.tabs.sendMessage(tab.id, { action: "extract" });

            if (response) {
                statusDiv.textContent = "Sending to App...";
                console.log("Extracted:", response);

                // Send to background script (or directly to localhost if CSP allows)
                chrome.runtime.sendMessage({ action: "saveContent", data: response }, (res) => {
                    statusDiv.textContent = "Saved! (Mock)";
                });
            } else {
                statusDiv.textContent = "Error: No response from content script";
            }
        } catch (err) {
            console.error(err);
            statusDiv.textContent = "Error: " + err.message;
        }
    });
});
