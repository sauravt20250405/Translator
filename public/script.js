const languages = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German", "hi": "Hindi",
    "zh": "Chinese", "ar": "Arabic", "ru": "Russian", "ja": "Japanese", "ko": "Korean",
    "pt": "Portuguese", "it": "Italian", "tr": "Turkish", "nl": "Dutch", "pl": "Polish",
    "sv": "Swedish", "vi": "Vietnamese", "th": "Thai", "id": "Indonesian", "he": "Hebrew",
    "el": "Greek", "cs": "Czech", "uk": "Ukrainian", "no": "Norwegian", "da": "Danish",
    "fi": "Finnish", "ro": "Romanian", "hu": "Hungarian", "sk": "Slovak", "bg": "Bulgarian",
    "pa": "Punjabi", "bn": "Bengali", "ta": "Tamil", "te": "Telugu", "mr": "Marathi",
    "gu": "Gujarati", "kn": "Kannada", "ml": "Malayalam", "ur": "Urdu", "fa": "Persian"
};

const sourceSelect = document.getElementById('sourceLang');
const targetSelect = document.getElementById('targetLang');

// Inject the languages dynamically into your HTML selectors
Object.entries(languages).forEach(([code, name]) => {
    const srcOpt = document.createElement('option');
    srcOpt.value = code;
    srcOpt.textContent = name;
    if(code === 'en') srcOpt.selected = true;
    sourceSelect.appendChild(srcOpt);

    const tgtOpt = document.createElement('option');
    tgtOpt.value = code;
    tgtOpt.textContent = name;
    if(code === 'es') tgtOpt.selected = true;
    targetSelect.appendChild(tgtOpt);
});

// --- TRANSLATION FETCH EXECUTION (FIXED DIRECT PROXY) ---
document.getElementById('translateBtn').addEventListener('click', async () => {
    const text = document.getElementById('inputText').value;
    const sourceLanguage = sourceSelect.value === 'autodetect' ? 'auto' : sourceSelect.value;
    const targetLanguage = targetSelect.value;
    const outputText = document.getElementById('outputText');

    if (!text.trim()) return alert('Please enter text to translate.');

    outputText.placeholder = 'Translating...';
    outputText.value = '';

    try {
        // High-resilience direct single-fetch translation endpoint
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data && data[0]) {
            let translatedSentence = "";
            // Iterates and joins sentences together cleanly
            data[0].forEach(phrase => {
                if (phrase[0]) translatedSentence += phrase[0];
            });
            outputText.value = translatedSentence;
        } else {
            outputText.placeholder = 'Translation failed.';
        }
    } catch (error) {
        console.error("Translation Error:", error);
        outputText.placeholder = 'An error occurred.';
    }
});

// --- MICROPHONE CAPTURE (Speech-To-Text) ---
const micBtn = document.getElementById('micBtn');
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    let isListening = false;

    micBtn.addEventListener('click', () => {
        if (!isListening) {
            let selectedLang = sourceSelect.value; 
            
            if (selectedLang === 'autodetect' || !selectedLang) {
                recognition.lang = 'en-US';
            } else if (selectedLang === 'en') {
                recognition.lang = 'en-US';
            } else if (selectedLang === 'hi') {
                recognition.lang = 'hi-IN'; 
            } else if (selectedLang === 'pa') {
                recognition.lang = 'pa-IN'; 
            } else {
                recognition.lang = `${selectedLang}-${selectedLang.toUpperCase()}`; 
            }

            try {
                recognition.start();
            } catch (err) {
                console.error("Starting recognition failed:", err);
            }
        } else {
            recognition.stop();
        }
    });

    recognition.onstart = () => {
        isListening = true;
        micBtn.textContent = '🛑';
    };

    recognition.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        document.getElementById('inputText').value = resultText;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'network') {
            alert("Speech network timeout. Try selecting your language explicitly instead of 'Auto Detect'.");
        }
    };

    recognition.onend = () => { 
        isListening = false;
        micBtn.textContent = '🎤';
    };
} else {
    micBtn.style.display = 'none';
}

// --- SPEAKER OUT (Text-To-Speech) ---
document.getElementById('speakBtn').addEventListener('click', () => {
    const textToSpeak = document.getElementById('outputText').value;
    const targetLang = targetSelect.value;

    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLang;
    window.speechSynthesis.speak(utterance);    
});