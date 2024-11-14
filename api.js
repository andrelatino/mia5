// API Key Management for Anthropic Claude

function loadFromLocalStorage() {
    // Try to get the Anthropic API key from localStorage
    const apiKey = localStorage.getItem('ANTHROPIC_API_KEY');
  
    // Check if the value exists
    if (apiKey !== null) {
      // If exists, set it as the value of the text input
      document.getElementById("textInput").value = apiKey;
    } else {
      console.log('No API Key found in Local Storage.');
    }
}

function saveToLocalStorage() {
    const apiKeyInput = document.getElementById("textInput").value;
    
    // Validate API key (basic check)
    if (apiKeyInput && apiKeyInput.startsWith('sk-ant-')) {
        localStorage.setItem('ANTHROPIC_API_KEY', apiKeyInput);
        alert('Anthropic API Key saved successfully!');
    } else {
        alert('Invalid Anthropic API Key. Please check and try again.');
    }
}

// Load API key on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    
    // Add event listener to save button
    const sendButton = document.getElementById("sendButton");
    if (sendButton) {
        sendButton.addEventListener('click', saveToLocalStorage);
    }
});

// Export functions if needed in module context
export { loadFromLocalStorage, saveToLocalStorage };
