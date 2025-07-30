import TextToSpeechService from "./TextToSpeechService";

class VoiceRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.initialized = false;
    this.processingCommand = false;
    this.wakeWords = {
      start: "start listening",
      stop: "stop listening",
    };
    this.callbacks = {
      onStart: () => {},
      onEnd: () => {},
      onResult: () => {},
      onError: () => {},
    };
    this.autoRestart = true; // Change default to true
    this.isActive = false; // Add this line to track if commands should be processed
    this.lastTranscript = ""; // Add this line to store the last transcript
    this.audioContext = null;
    this.isAudioReady = false;
    this.commandQueue = [];
    this.isProcessingQueue = false;
  }

  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      throw new Error(
        "Microphone access denied. Please allow microphone access and try again."
      );
    }
  }

  async init() {
    if (this.initialized) return;

    if (
      !("SpeechRecognition" in window) &&
      !("webkitSpeechRecognition" in window)
    ) {
      throw new Error(
        "Speech Recognition not supported. Please use Chrome or Edge."
      );
    }

    try {
      await this.requestMicrophonePermission();
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onStart();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onEnd();
        // Always restart to listen for wake words
        if (this.autoRestart) {
          setTimeout(() => {
            if (!this.isListening) {
              this.start();
            }
          }, 1000);
        }
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript
          .trim()
          .toLowerCase();
        console.log("Heard:", transcript);
        this.callbacks.onResult(transcript);
      };

      this.recognition.onerror = (event) => {
        this.callbacks.onError({
          error: event.error,
          message: this.getErrorMessage(event.error),
        });
      };

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize:", error);
      throw error;
    }
  }

  async initAudio() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Create and play a silent sound to unlock audio on mobile
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      } catch (err) {
        console.error("Error creating audio context:", err);
      }
    }

    if (this.audioContext && this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (err) {
        console.error("Error resuming audio context:", err);
      }
    }

    this.isAudioReady = true;
    return this.isAudioReady;
  }

  async speak(text) {
    if (!this.isAudioReady) {
      console.warn("Audio not ready. Attempting to initialize...");
      await this.initAudio();
    }

    return new Promise((resolve) => {
      // Store current listening state
      const wasListening = this.isListening;

      // Stop listening to prevent feedback loop
      if (this.isListening) {
        this.stop();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const alternateVoice = voices.find(
          (voice) =>
            voice.name.includes("Google") || voice.name.includes("Microsoft")
        );
        if (alternateVoice) utterance.voice = alternateVoice;
      }

      utterance.rate = 1.1; // Slightly faster rate for command responses

      utterance.onend = () => {
        setTimeout(() => {
          // Resume listening if it was listening before
          if (wasListening) {
            this.start();
          }
          resolve();
        }, 300); // Increased delay to ensure audio is completely finished
      };

      utterance.onerror = () => {
        // Resume listening even if there's an error
        if (wasListening) {
          this.start();
        }
        resolve();
      };

      speechSynthesis.speak(utterance);
    });
  }

  async start() {
    if (!this.initialized) {
      await this.init();
    }

    if (!this.isListening && this.recognition) {
      try {
        await this.recognition.start();
        return true;
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error);
        }
        return false;
      }
    }
    return false;
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
        return true;
      } catch (error) {
        console.error("Stop error:", error);
        return false;
      }
    }
    return false;
  }

  getErrorMessage(error) {
    const errorMessages = {
      "no-speech": "I didn't hear anything. Please try speaking again.",
      "audio-capture":
        "No microphone was found. Please ensure your microphone is connected.",
      "not-allowed":
        "Microphone access was denied. Please allow microphone access and try again.",
      network: "There was a network error. Please check your connection.",
      aborted: "Speech recognition was aborted.",
      default: "An error occurred with speech recognition.",
    };
    return errorMessages[error] || errorMessages.default;
  }

  subscribe(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Add method to control auto-restart
  setAutoRestart(value) {
    this.autoRestart = value;
  }

  activate() {
    if (!this.isActive) {
      console.log("Activating voice commands");
      this.isActive = true;
      if (this.callbacks.onActivate) {
        this.callbacks.onActivate();
      }
    }
  }

  deactivate() {
    if (this.isActive) {
      console.log("Deactivating voice commands");
      this.isActive = false;
      if (this.callbacks.onDeactivate) {
        this.callbacks.onDeactivate();
      }
    }
  }

  isCommandsActive() {
    return this.isActive;
  }

  isAudioEnabled() {
    return this.isAudioReady;
  }

  async processCommands(transcript, commands) {
    // Pause speech right when user says "start listening"
    if (transcript.includes("start listening")) {
      if (
        TextToSpeechService.isSpeakingNow() &&
        !TextToSpeechService.isPausedNow()
      ) {
        TextToSpeechService.pause();
      }
      this.activate();
      await this.speak("Voice commands activated");
      return true;
    }

    if (!this.isActive) return false;

    this.commandQueue.push({ transcript, commands });
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
    return true;
  }

  async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.commandQueue.length > 0) {
      const { transcript, commands } = this.commandQueue.shift();
      let commandExecuted = false;

      for (const command of commands) {
        const keywords = Array.isArray(command.keyword)
          ? command.keyword
          : [command.keyword];
        const isMatch = keywords.some((keyword) =>
          transcript.toLowerCase().includes(keyword.toLowerCase())
        );

        if (isMatch) {
          try {
            await command.action(transcript);
            commandExecuted = true;
            break;
          } catch (err) {
            console.error("Command execution error:", err);
          }
        }
      }

      if (!commandExecuted) {
        // Notify user, then say "continuing" and resume reading if it was paused
        await this.speak("Command not recognized. Continuing.");
        if (TextToSpeechService.isPausedNow()) {
          TextToSpeechService.resume();
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    this.isProcessingQueue = false;
  }
}

const instance = new VoiceRecognitionService();
export default instance;
