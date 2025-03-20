const FeedbackService = {
  async provideFeedback(message) {
    try {
      console.log("Feedback:", message); // Log feedback for debugging

      // Ensure voices are loaded before speaking
      if (speechSynthesis.getVoices().length === 0) {
        await new Promise((resolve) => {
          speechSynthesis.onvoiceschanged = resolve;
        });
      }

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "en-US"; // Set language
      utterance.volume = 1; // Set volume (0 to 1)
      utterance.rate = 1; // Set rate (0.1 to 10)
      utterance.pitch = 1; // Set pitch (0 to 2)

      return new Promise((resolve) => {
        utterance.onend = resolve; // Resolve when speech ends
        speechSynthesis.speak(utterance); // Speak the message
      });
    } catch (err) {
      console.error("Error providing feedback:", err);
    }
  },
};

export default FeedbackService;
