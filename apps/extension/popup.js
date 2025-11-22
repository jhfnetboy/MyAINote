document.addEventListener('DOMContentLoaded', async () => {
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');
    const titleInput = document.getElementById('title');
    const urlInput = document.getElementById('url');

    // Initialize UI with current tab info
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            titleInput.value = tab.title || '';
            urlInput.value = tab.url || '';
        }
    } catch (e) {
        console.error("Failed to get tab info:", e);
    }

    saveBtn.addEventListener('click', async () => {
        setStatus('Extracting content...', 'loading');
        saveBtn.disabled = true;

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab?.id) {
                throw new Error("No active tab found");
            }

            // Try to send message first
            try {
                const response = await sendMessageToTab(tab.id, { action: "extract" });
                await handleExtractionResponse(response);
            } catch (err) {
                // If message fails, try to inject script and retry
                console.log("Message failed, attempting injection...", err);
                setStatus('Injecting script...', 'loading');

                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });

                // Retry message after injection
                // Give it a small delay to initialize
                await new Promise(r => setTimeout(r, 100));

                const response = await sendMessageToTab(tab.id, { action: "extract" });
                await handleExtractionResponse(response);
            }

        } catch (err) {
            console.error(err);
            setStatus("Error: " + err.message, 'error');
            saveBtn.disabled = false;
        }
    });

    function sendMessageToTab(tabId, message) {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }

    async function handleExtractionResponse(response) {
        if (!response) {
            throw new Error("No response from content script");
        }

        setStatus('Sending to App...', 'loading');

        // Use user-edited title if available
        const payload = {
            ...response,
            title: titleInput.value || response.title
        };

        // Send to local server
        try {
            const res = await fetch('http://localhost:3030/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.status === 'success') {
                setStatus("Saved successfully!", 'success');
                setTimeout(() => window.close(), 1500);
            } else {
                throw new Error(result.status);
            }
        } catch (e) {
            throw new Error("Failed to connect to App. Is it running? (" + e.message + ")");
        }
    }

    function setStatus(msg, type) {
        statusDiv.textContent = msg;
        statusDiv.className = 'status ' + type;
    }
});
