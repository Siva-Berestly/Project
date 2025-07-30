import VoiceRecognitionService from "./VoiceRecognitionService";

class TextToSpeechService {
  constructor() {
    this.utterance = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentText = "";
    this.onStartCallback = null;
    this.onEndCallback = null;
    this.onPauseCallback = null;
    this.onResumeCallback = null;
    this.onBoundaryCallback = null;
    this.audioContext = null;
    this.isAudioReady = false;
    this._vrWasListening = false;
    this._vrAutoRestartBackup = null;
    this._vrCommandsActiveBackup = false;
  }

  async initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
    this.isAudioReady = true;

    // Initialize a dummy utterance that will make speech synthesis ready for use
    // This helps circumvent browser restrictions requiring user interaction
    this.prepareAudioForUse();
  }

  prepareAudioForUse() {
    // Create and quickly speak an empty utterance to initialize the speech synthesis API
    const dummyUtterance = new SpeechSynthesisUtterance("");
    dummyUtterance.volume = 0; // Silent
    dummyUtterance.rate = 10; // Super fast
    dummyUtterance.onend = () => {
      console.log("Speech synthesis initialized and ready for use");
      this.isAudioReady = true;
    };
    speechSynthesis.speak(dummyUtterance);

    // Also initialize voice list to ensure it's loaded
    window.speechSynthesis.getVoices();
  }

  registerCallbacks({
    onStart = () => {},
    onEnd = () => {},
    onPause = () => {},
    onResume = () => {},
    onBoundary = () => {},
  }) {
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;
    this.onPauseCallback = onPause;
    this.onResumeCallback = onResume;
    this.onBoundaryCallback = onBoundary;
  }

  speak(text) {
    // Stop recognition to prevent self-triggering
    try {
      // Record prior voice recognition state
      this._vrWasListening = VoiceRecognitionService.isListening;
      this._vrCommandsActiveBackup = VoiceRecognitionService.isCommandsActive();
      if (this._vrWasListening) {
        this._vrAutoRestartBackup = VoiceRecognitionService.autoRestart;
        VoiceRecognitionService.setAutoRestart(false);
        // Deactivate commands and stop recognition to prevent self-triggering
        VoiceRecognitionService.deactivate();
        VoiceRecognitionService.stop();
      }
    } catch (e) {
      console.error("Error disabling voice recognition during TTS:", e);
    }
    if (!this.isAudioReady) {
      console.warn("Audio not ready. Attempting to initialize...");
      this.prepareAudioForUse();
      setTimeout(() => this.speak(text), 100);
      return false;
    }

    if (speechSynthesis.speaking && this.isSpeaking) {
      this.stop();
    }

    this.currentText = text;
    const utterance = new SpeechSynthesisUtterance(text);
    this.utterance = utterance;

    // Use a distinct voice for text reading if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer a natural-sounding voice for content reading
      const naturalVoice = voices.find(
        (voice) =>
          voice.name.includes("Neural") || voice.name.includes("Premium")
      );
      if (naturalVoice) utterance.voice = naturalVoice;
    }

    // Slower, more comfortable pace for content reading
    utterance.rate = 0.8;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      if (this.onStartCallback) this.onStartCallback();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onEndCallback) this.onEndCallback();
      // Resume voice recognition after TTS
      if (this._vrWasListening) {
        VoiceRecognitionService.setAutoRestart(this._vrAutoRestartBackup);
        VoiceRecognitionService.start()
          .then(() => {
            // Restore command active state
            if (this._vrCommandsActiveBackup) {
              VoiceRecognitionService.activate();
            } else {
              VoiceRecognitionService.deactivate();
            }
          })
          .catch((e) =>
            console.error("Error re-enabling voice recognition after TTS:", e)
          );
      }
    };

    utterance.onboundary = (event) => {
      if (this.onBoundaryCallback) this.onBoundaryCallback(event);
    };

    speechSynthesis.speak(utterance);
    return true;
  }

  async speakWithPriority(text) {
    if (this.isSpeakingNow()) {
      this.pause(); // Pause ongoing speech
    }
    await new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      speechSynthesis.speak(utterance);
    });
    if (this.isPausedNow()) {
      this.resume(); // Resume paused speech
    }
  }

  pause() {
    if (speechSynthesis.speaking && !this.isPaused) {
      speechSynthesis.pause();
      this.isPaused = true;
      if (this.onPauseCallback) this.onPauseCallback();
      return true;
    }
    return false;
  }

  resume() {
    if (speechSynthesis.speaking && this.isPaused) {
      speechSynthesis.resume();
      this.isPaused = false;
      if (this.onResumeCallback) this.onResumeCallback();
      return true;
    }
    return false;
  }

  stop() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      if (this.onEndCallback) this.onEndCallback();
      return true;
    }
    return false;
  }

  restart() {
    if (this.currentText) {
      this.stop();
      return this.speak(this.currentText);
    }
    return false;
  }

  isSpeakingNow() {
    return this.isSpeaking;
  }

  isPausedNow() {
    return this.isPaused;
  }
}

const instance = new TextToSpeechService();
export default instance;
