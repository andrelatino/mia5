// Modificación para agregar "memoria" al asistente
import APILLMHub from 'https://amanpriyanshu.github.io/API-LLM-Hub/unified-llm-api.js';
import { downloadSpeech } from './speak.js';

let aiAssistant;

async function initializeAI() {
    const apiKey = document.getElementById("textInput").value;
    aiAssistant = new APILLMHub({
        provider: 'anthropic',
        apiKey: apiKey,
        model: 'claude-3-5-haiku-latest',
        maxTokens: 300,
        temperature: 0.7
    });
    
    await aiAssistant.initialize();
}

function agregarATranscripciones(transcript, esUsuario) {
    let transcripciones = JSON.parse(localStorage.getItem('transcripciones')) || [];
    let mensaje = {
        role: esUsuario ? "user" : "assistant",
        content: transcript
    };
    transcripciones.push(mensaje);
    localStorage.setItem('transcripciones', JSON.stringify(transcripciones));
    
    actualizarConversaciones();
}

function actualizarConversaciones() {
    let transcripciones = JSON.parse(localStorage.getItem('transcripciones')) || [];
    let conversacionesHTML = transcripciones.map(mensaje => {
        return mensaje.role === "user" ? `<p class="usuario">${mensaje.content}</p>` : `<p class="asistente">${mensaje.content}</p>`;
    }).join('');
    document.getElementById('conversaciones').innerHTML = conversacionesHTML;
}

let recognition;
let listening = false;

function startRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        console.error('Speech recognition not supported');
        return;
    }

    // Stop any existing recognition
    if (recognition) {
        stopRecognition();
    }

    recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript.trim();
        if (transcript) {
            agregarATranscripciones(transcript, true); // Usuario
            iniciarConversacionClaude(transcript);
        }
    };

    recognition.onstart = () => {
        listening = true;
        console.log('Speech recognition started');
    };

    recognition.onend = () => {
        if (listening) {
            try {
                recognition.start();
            } catch (error) {
                console.error('Error restarting recognition:', error);
                listening = false;
            }
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        listening = false;
    };

    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting recognition:', error);
    }
}

function stopRecognition() {
    listening = false;
    if (recognition) {
        try {
            recognition.stop();
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    }
}

async function iniciarConversacionClaude(mensajeUsuario) {
    try {
        // Stop recognition before processing
        stopRecognition();

        // Recuperar mensajes anteriores para mantener la conversación
        let mensajesClaude = JSON.parse(localStorage.getItem('transcripciones')) || [];

        // Añadir el mensaje del usuario actual
        mensajesClaude.push({ role: "user", content: mensajeUsuario });

        // Preparar el contexto del sistema
        const systemPrompt = "Eres un asistente de chat en español, te llamas Marcos y eres el Asistente personal de André, saludalo siempre al empezar la conversación";
        
        // Enviar mensaje usando API-LLM-Hub
        if (!aiAssistant) {
            await initializeAI();
        }

        const respuestaClaude = await aiAssistant.sendMessage(mensajeUsuario, {
            systemPrompt: systemPrompt
        });

        agregarATranscripciones(respuestaClaude, false); // Asistente
        console.log('respuestaClaude: ' + respuestaClaude);
        
        // Use Web Speech API for text-to-speech with error handling
        try {
            // Wait for speech to complete before restarting recognition
            await downloadSpeech('web', 'default', respuestaClaude);
            
            // Restart speech recognition after speech synthesis ends
            startRecognition();
        } catch (error) {
            console.error('Error in speech synthesis:', error);
            // Restart recognition even if speech synthesis fails
            startRecognition();
        }
    } catch (error) {
        console.error('Error in conversation:', error);
        // Ensure recognition is restarted even if there's an error
        startRecognition();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startButton').addEventListener('click', startRecognition);
    document.getElementById('stopButton').addEventListener('click', stopRecognition);
    document.getElementById('sendButton').addEventListener('click', async () => {
        try {
            await initializeAI();
        } catch (error) {
            console.error('Error initializing AI:', error);
        }
    });

    // Initial conversations update
    actualizarConversaciones();
});

// Export functions if needed
export { startRecognition, stopRecognition, iniciarConversacionClaude };
