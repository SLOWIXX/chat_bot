document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const submitBtn = chatForm.querySelector('button');

    function addMessageToUI(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        
        messageDiv.innerHTML = message.replace(/\n/g, '<br>');
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('loading');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        chatMessages.appendChild(loadingDiv);
        scrollToBottom();
        return loadingDiv;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    let chatHistory = [];

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const message = userInput.value.trim();
        if (!message) return;

        addMessageToUI(message, true);
        
        userInput.value = '';
        userInput.disabled = true;
        submitBtn.disabled = true;

        const loadingIndicator = addLoadingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message, history: chatHistory })
            });

            const data = await response.json();

            loadingIndicator.remove();

            if (response.ok) {
                addMessageToUI(data.reply, false);
                
                chatHistory.push({ role: 'user', parts: [{ text: message }] });
                chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
            } else {
                addMessageToUI(`Erreur: ${data.error}`, false);
            }

        } catch (error) {
            loadingIndicator.remove();
            addMessageToUI("Erreur de connexion au serveur.", false);
            console.error('Fetch error:', error);
        } finally {
            userInput.disabled = false;
            submitBtn.disabled = false;
            userInput.focus();
        }
    });
});
