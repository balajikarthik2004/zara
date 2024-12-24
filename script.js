const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;

const consoleDiv = document.getElementById('console');
const micBtn = document.getElementById('start-btn');
const clearBtn = document.getElementById('clear-btn');
const spinner = document.getElementById('spinner');
const speechDisplay = document.getElementById('speech-display'); // To show the spoken words

// Get available voices and select a sweet, feminine one
let voices = [];
const setVoice = () => {
    voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.toLowerCase().includes(''));
    if (voice) {
        speechSynthesis.voice = voice;
    }
};

// Initialize the voice on page load
speechSynthesis.onvoiceschanged = setVoice;

// Enhanced Speech Output
const speak = (message, pitch = 1.2, rate = 0.9) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.pitch = pitch; // Control pitch (higher pitch for sweeter voice)
    utterance.rate = rate; // Control speaking rate (slightly faster for a smooth voice)
    if (speechSynthesis.voice) {
        utterance.voice = speechSynthesis.voice; // Use the selected sweet voice
    }
    speechSynthesis.speak(utterance);
    logMessage(`Zara: ${message}`);
};

// Enhanced Console Logging
const logMessage = (message) => {
    const time = new Date().toLocaleTimeString();
    const p = document.createElement('p');
    p.textContent = `[${time}] ${message}`;
    consoleDiv.appendChild(p);
    consoleDiv.scrollTop = consoleDiv.scrollHeight; // Auto-scroll
};

// Clear Console
clearBtn.addEventListener('click', () => {
    consoleDiv.innerHTML = '';
});

// Process Commands
const processCommand = (command) => {
    command = command.toLowerCase();
    logMessage(`You: ${command}`);
    spinner.style.display = 'none';

    if (command.includes('hello')) {
        speak("Hello Boss, how can I assist you today?");
    } else if (command.includes('time')) {
        const currentTime = new Date().toLocaleTimeString();
        speak(`The current time is ${currentTime}.`);
    } else if (command.includes('date')) {
        const currentDate = new Date().toLocaleDateString();
        speak(`Today's date is ${currentDate}.`);
    } else if (command.includes('weather')) {
        const city = command.split('in').pop().trim(); // Extract city from command
        getWeather(city || 'London');
    } else if (command.includes('open youtube')) {
        window.open('https://www.youtube.com', '_blank');
        speak("Opening YouTube.");
    } else if (command.includes('remind me to')) {
        setReminder(command);
    } else {
        speak("Sorry, I didn't catch that.");
    }
};

// Start Listening for Commands
const startListening = () => {
    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        speechDisplay.textContent = `You said: ${command}`;
        processCommand(command);
    };

    recognition.start();
};

// Speech Recognition Handlers
recognition.onstart = () => {
    spinner.style.display = 'block';
};

recognition.onerror = (event) => {
    logMessage(`Error: ${event.error}`);
    spinner.style.display = 'none';
};

recognition.onend = () => {
    micBtn.disabled = false;
    micBtn.textContent = '🎤 Start Listening';
};

// Start Listening when the button is clicked
micBtn.addEventListener('click', () => {
    micBtn.disabled = true;
    micBtn.textContent = 'Listening...';
    startListening();
});
