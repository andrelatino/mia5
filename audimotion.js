// load module from Skypack CDN
import AudioMotionAnalyzer from 'https://cdn.skypack.dev/audiomotion-analyzer?min';

// Function to initialize AudioMotion with audio source
function initAudioMotion() {
    const audioEl = document.getElementById('speechAudio');
    
    // Check if audio element exists
    if (!audioEl) {
        console.error('Audio element not found');
        return null;
    }

    // Instantiate analyzer
    const audioMotion = new AudioMotionAnalyzer(
        document.getElementById('container'),
        {
            source: audioEl,
            height: 500,
            mode: 10,
            channelLayout: 'single',
            frequencyScale: 'bark',
            gradient: 'rainbow',
            linearAmplitude: true,
            linearBoost: 1.8,
            lineWidth: 4,
            maxFreq: 20000,
            minFreq: 20,
            mirror: 0,
            overlay: false,
            radial: false,
            reflexAlpha: 1,
            reflexBright: 1,
            reflexFit: true,
            reflexRatio: .5,
            showPeaks: true,
            showScaleX: false,
            weightingFilter: 'D'
        }
    );

    // Add event listeners to ensure visualization works with speech synthesis
    window.speechSynthesis.addEventListener('start', () => {
        audioMotion.resume();
    });

    window.speechSynthesis.addEventListener('end', () => {
        audioMotion.pause();
    });

    return audioMotion;
}

// Obtain the modal and modal content
var modal = document.getElementById("modal");
var modalContent = document.querySelector(".modal-content");

// Obtain the button that opens the modal
var btn = document.getElementById("openModal");

// Obtain the element <span> that closes the modal
var span = document.getElementsByClassName("close")[0];

// Open the modal and add the class for animation
btn.onclick = function() {
  modal.style.display = "block";
}

// Close the modal and remove the class for animation
span.onclick = function() {
  modal.style.display = "none"; 
}

function saveToLocalStorage() {
    var textInputValue = document.getElementById("textInput").value;
    localStorage.setItem('OPENAI_API_KEY', textInputValue);
    alert('API Key saved successfully!');
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("sendButton").addEventListener('click', saveToLocalStorage);
    
    // Initialize AudioMotion when the page loads
    initAudioMotion();
});

// Export the initialization function if needed
export { initAudioMotion };
