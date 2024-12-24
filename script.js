const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;

const consoleDiv = document.getElementById('console');
const micBtn = document.getElementById('start-btn');
const clearBtn = document.getElementById('clear-btn');
const spinner = document.getElementById('spinner');
const speechDisplay = document.getElementById('speech-display'); // To show the spoken words

const wakeUpPhrase = "hello zara"; 
const devModePhrase = "hey zara switch to developer mode";

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

const getWeather = async (city = 'London') => {
    const apiKey = 'b1fd6e14799699504191b6bdbcadfc35'; // Ensure your API key is valid
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found.");
            }
            throw new Error("Failed to fetch weather data.");
        }

        const data = await response.json();
        const description = data.weather[0].description;
        const temperature = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);

        speak(`The weather in ${city} is currently ${description} with a temperature of ${temperature}°C, feeling like ${feelsLike}°C.`);
    } catch (error) {
        speak(`Sorry, I couldn't fetch the weather data. ${error.message}`);
    }
};

// Handle the Wake-up Phrase Detection
const detectWakeUpPhrase = (transcript) => {
    const normalizedTranscript = transcript.toLowerCase().replace(/[^a-z\s]/g, '').trim(); // Normalize the input
    
    logMessage(`You said: ${transcript}`); // Log the spoken words to the console
    speechDisplay.textContent = `You said: ${transcript}`; // Display the spoken words on the screen

    if (normalizedTranscript === wakeUpPhrase) {
        const hours = new Date().getHours();
        let greeting = "Good Morning";
        
        // Change greeting based on the time of day
        if (hours >= 12 && hours < 17) {
            greeting = "Good Afternoon";
        } else if (hours >= 17) {
            greeting = "Good Evening";
        }

        speak(`${greeting} Boss! How can I assist you today?`);
        recognition.stop();  // Stop current recognition session
        startListeningForCommands();  // Start listening for commands after wake-up
    }  else {
        speak("Sorry, that's not the correct access word.");
    }
};

// Function to parse time from a string (Basic example, can be improved)
const parseTime = (timeString) => {
    const timePattern = /(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/; // Matches time like "2:30 PM"
    const match = timeString.match(timePattern);

    if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3] ? match[3].toUpperCase() : null;

        if (period === 'PM' && hours < 12) {
            hours += 12; // Convert to 24-hour format if PM
        } else if (period === 'AM' && hours === 12) {
            hours = 0; // Handle midnight case
        }

        return { hours, minutes };
    }
    return null;
};

// Function to set the reminder
const setReminder = (command) => {
    const match = command.match(/remind me to (.+) at (\d{1,2}:\d{2} ?[APap][Mm])/);

    if (match) {
        const task = match[1];
        const timeString = match[2];
        const time = parseTime(timeString);

        if (time) {
            const reminderTime = new Date();
            reminderTime.setHours(time.hours, time.minutes, 0, 0);

            // If the time is already passed today, set the reminder for the next day
            if (reminderTime <= new Date()) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }

            const timeToWait = reminderTime - new Date();
            setTimeout(() => {
                speak(`Reminder: ${task}`);
                logMessage(`Reminder: ${task}`);
            }, timeToWait);

            speak(`Okay! I will remind you to ${task} at ${timeString}.`);
            logMessage(`Reminder set: ${task} at ${timeString}`);
        } else {
            speak("Sorry, I couldn't understand the time format.");
        }
    } else {
        speak("Please specify the task and time in the format 'remind me to [task] at [time]'.");
    }
};


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
        if (command.includes('india')) {
            getWeather('New Delhi');  // Default to New Delhi for country input
        } else {
            getWeather(city || 'London');
        }
    }  else if (command.includes('open youtube')) {
        window.open('https://www.youtube.com', '_blank'); // Opens YouTube in a new tab
        speak("Opening YouTube.");
    } else if (command.includes('open facebook')) {
        window.open('https://www.facebook.com', '_blank'); // Opens Facebook in a new tab
        speak("Opening Facebook.");
    } else if (command.includes('open twitter')) {
        window.open('https://www.twitter.com', '_blank'); // Opens Twitter in a new tab
        speak("Opening Twitter.");
    } else if (command.includes('open instagram')) {
        window.open('https://www.instagram.com', '_blank'); // Opens Instagram in a new tab
        speak("Opening Instagram.");
    }
    else if (command.includes('open whatsapp')) {
        window.open('https://web.whatsapp.com', '_blank'); // Opens WhatsApp Web in a new tab
        speak("Opening WhatsApp.");
    } else if (command.includes('open linkedin')) {
        window.open('https://www.linkedin.com', '_blank');
        speak("Opening LinkedIn.");
    }
     else if (command.includes('open calculator')) {
        window.open('https://www.google.com/search?q=calculator', '_blank'); // Opens Google Calculator
        speak("Opening Calculator.");
    }else if ('hey zara switch to developer mode') {
        speak("Switching to Developer Mode.");
        window.location.href = "dev.html"; // Redirect to dev.html when the phrase is detected
    }
      // Google Search Command
      else if (command.includes('search for') || command.includes('google') || command.includes('search google')) {
        let searchQuery = '';
        if (command.includes('search for')) {
            searchQuery = command.replace('search for', '').trim(); // Extract search query after "search for"
        } else if (command.includes('google') || command.includes('search google')) {
            searchQuery = command.replace('google', '').replace('search google', '').trim(); // Extract query after "google" or "search google"
        }
        
        if (searchQuery) {
            const searchURL = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
            window.open(searchURL, '_blank'); // Opens Google search in a new tab
            speak(`Searching Google for ${searchQuery}.`);
        } else {
            speak("Please provide a search query.");
        }
    } // Reminder Handling
    else if (command.includes('remind me to')) {
        setReminder(command); // Set a reminder if command matches
    }
    else {
        getAnswerFromAPI(command); // Send query to AI
    }
};

// Start listening for commands after wake-up
const startListeningForCommands = () => {
    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
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

// Start Listening for the wake-up phrase initially
micBtn.addEventListener('click', () => {
    micBtn.disabled = true;
    micBtn.textContent = 'Listening...';
    recognition.start();
});

// Detect Wake-Up Phrase in the speech
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    detectWakeUpPhrase(transcript);
};
