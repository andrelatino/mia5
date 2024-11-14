// Text-to-Speech functionality using Web Speech API

let voices = [];

function loadVoices() {
    return new Promise((resolve, reject) => {
        // Ensure voices are loaded across different browsers
        function checkVoices() {
            voices = window.speechSynthesis.getVoices();
            console.log('Loaded voices:', voices.map(v => `${v.name} (${v.lang})`));
            
            if (voices.length > 0) {
                resolve(voices);
            } else {
                reject(new Error('No voices available'));
            }
        }
        
        // Different browsers handle voice loading differently
        if ('onvoiceschanged' in window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = checkVoices;
        }
        
        // Immediate check and multiple attempts
        checkVoices();
        
        // Fallback mechanism with multiple attempts
        setTimeout(checkVoices, 100);
        setTimeout(checkVoices, 500);
        setTimeout(checkVoices, 1000);
    });
}

function getAvailableVoices() {
    return window.speechSynthesis.getVoices();
}

function saveVoiceToLocalStorage(voiceName) {
    localStorage.setItem('SELECTED_VOICE', voiceName);
}

function loadVoiceFromLocalStorage() {
    return localStorage.getItem('SELECTED_VOICE');
}

// New functions for Pitch and Rate
function savePitchToLocalStorage(pitch) {
    localStorage.setItem('VOICE_PITCH', pitch);
}

function saveRateToLocalStorage(rate) {
    localStorage.setItem('VOICE_RATE', rate);
}

function loadPitchFromLocalStorage() {
    return parseFloat(localStorage.getItem('VOICE_PITCH')) || 1.0;
}

function loadRateFromLocalStorage() {
    return parseFloat(localStorage.getItem('VOICE_RATE')) || 1.0;
}

async function downloadSpeech(model, voiceType, input) {
    return await trySpeechSynthesis(input, voiceType);
}

async function trySpeechSynthesis(input, voiceType = 'default') {
    try {
        // Ensure voices are loaded
        await loadVoices();
        
        // Use Web Speech API for text-to-speech
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            return new Promise((resolve, reject) => {
                const utterance = new SpeechSynthesisUtterance(input);
                
                // Get voice from select element
                const voiceSelect = document.getElementById('voiceSelect');
                const selectedVoiceName = voiceSelect ? voiceSelect.value : null;
                
                if (selectedVoiceName) {
                    // Find the voice that matches the selected name
                    const selectedVoice = voices.find(v => v.name === selectedVoiceName);
                    
                    if (selectedVoice) {
                        utterance.voice = selectedVoice;
                        utterance.lang = selectedVoice.lang;
                        console.log('Using selected voice:', selectedVoice.name, selectedVoice.lang);
                    } else {
                        console.error(`No matching voice found for "${selectedVoiceName}"`);
                        reject(new Error(`No matching voice found for "${selectedVoiceName}"`));
                        return;
                    }
                } else {
                    console.error('No voice selected');
                    reject(new Error('No voice selected'));
                    return;
                }
                
                // Load pitch and rate from localStorage
                utterance.pitch = loadPitchFromLocalStorage();
                utterance.rate = loadRateFromLocalStorage();
                
                console.log(`Using pitch: ${utterance.pitch}, rate: ${utterance.rate}`);
                
                // Add event listeners for speech events
                utterance.onend = () => {
                    console.log('Speech playback has ended.');
                    resolve();
                };
                
                utterance.onerror = (event) => {
                    console.error('Speech synthesis error:', event);
                    fallbackTextToSpeech(input);
                    reject(event);
                };
                
                // Speak the text
                try {
                    window.speechSynthesis.speak(utterance);
                } catch (speakError) {
                    console.error('Error calling speechSynthesis.speak():', speakError);
                    reject(speakError);
                }
            });
        } else {
            console.warn('Web Speech API not supported');
            fallbackTextToSpeech(input);
            throw new Error('Web Speech API not supported');
        }
    } catch (error) {
        console.error('Error in text-to-speech:', error);
        fallbackTextToSpeech(input);
        throw error;
    }
}

function fallbackTextToSpeech(text) {
    // Basic console log fallback if speech synthesis fails completely
    console.log('Fallback TTS:', text);
    
    // Optional: Implement alternative TTS method or user notification
    if (typeof showErrorNotification === 'function') {
        showErrorNotification('Speech synthesis unavailable');
    }
}

// Ensure voices are loaded on module initialization
loadVoices().catch(error => {
    console.error('Initial voice loading failed:', error);
});

// Export the function if needed in module context
export { 
    downloadSpeech, 
    fallbackTextToSpeech, 
    getAvailableVoices, 
    saveVoiceToLocalStorage, 
    loadVoiceFromLocalStorage,
    savePitchToLocalStorage,
    saveRateToLocalStorage,
    loadPitchFromLocalStorage,
    loadRateFromLocalStorage
};
