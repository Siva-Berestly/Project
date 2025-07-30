import TextToSpeechService from "../services/TextToSpeechService";

const generateCourseContentCommands = (
  section,
  navigate,
  VoiceRecognitionService,
  speakText,
  pauseSpeech,
  resumeSpeech,
  restartSpeech,
  stopSpeech
) => {
  // Always provide valid commands, even if section isn't loaded yet
  const baseCommands = [
    {
      keyword: [
        "read text",
        "read the text",
        "read text aloud",
        "read that text",
        "read",
        "read aloud",
        "start reading",
        "start reading the text",
      ],
      action: async () => {
        try {
          await VoiceRecognitionService.speak("Reading the text aloud.");
          // Only read if section is available
          if (section && section.tcontent) {
            // Use setTimeout to give a moment between voice command response and text reading
            setTimeout(() => {
              try {
                speakText(section.tcontent);
              } catch (err) {
                console.error("Error starting text reading:", err);
                VoiceRecognitionService.speak(
                  "I'm having trouble reading the text. Please try again."
                );
              }
            }, 500);
          } else {
            await VoiceRecognitionService.speak(
              "Sorry, content is not available yet."
            );
          }
        } catch (err) {
          console.error("Error in read command:", err);
        }
      },
      displayName: "Start reading the text",
    },
    {
      keyword: [
        "go back to course page",
        "back to course page",
        "back to course",
        "go back to course",
        "go back",
      ],
      action: async () => {
        await VoiceRecognitionService.speak("Going back to course page.");
        navigate("/courses");
      },
      displayName: "Go back to course page",
    },
    {
      keyword: ["go to home", "go to home page", "go home"],
      action: async () => {
        await VoiceRecognitionService.speak("Navigating to home page.");
        navigate(`/`);
      },
      displayName: "Go to home",
    },
  ];

  // If section is not available, return only base commands
  if (!section || !section.heading) {
    return { baseCommands, readingCommands: [] };
  }

  // Keep these commands defined for button functionality, but they won't be used for voice commands
  const readingCommands = [
    {
      keyword: [
        "pause the text",
        "pause text",
        "pause reading",
        "pause",
        "pass",
        "pass reading",
        "pass reading text",
        "pass reading the text",
      ],
      action: async () => {
        try {
          // Stop listening before feedback
          if (VoiceRecognitionService.isListening) {
            VoiceRecognitionService.stop();
            if (VoiceRecognitionService.callbacks.onEnd)
              VoiceRecognitionService.callbacks.onEnd();
          }
          // First pause the speech
          const paused = await pauseSpeech();

          // Wait a moment for the speech to actually pause
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Then provide feedback if successfully paused
          if (paused) {
            await VoiceRecognitionService.speak("Pausing the text.");
          } else {
            await VoiceRecognitionService.speak("Unable to pause the text.");
          }
        } catch (err) {
          console.error("Error in pause command:", err);
          await VoiceRecognitionService.speak(
            "An error occurred while pausing."
          );
        }
      },
      displayName: "Pause reading",
    },
    {
      keyword: [
        "play the text",
        "resume text",
        "resume reading",
        "resume",
        "continue",
        "continue reading",
        "continue reading text",
        "continue reading the text",
      ],
      action: async () => {
        try {
          // Stop listening before feedback
          if (VoiceRecognitionService.isListening) {
            VoiceRecognitionService.stop();
            if (VoiceRecognitionService.callbacks.onEnd)
              VoiceRecognitionService.callbacks.onEnd();
          }
          // First resume the speech
          const resumed = await resumeSpeech();

          // Wait a moment for the speech to actually resume
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Then provide feedback if successfully resumed
          if (resumed) {
            await VoiceRecognitionService.speak("Resuming the text.");
          } else {
            await VoiceRecognitionService.speak("Unable to resume the text.");
          }
        } catch (err) {
          console.error("Error in resume command:", err);
          await VoiceRecognitionService.speak(
            "An error occurred while resuming."
          );
        }
      },
      displayName: "Resume reading",
    },
    {
      keyword: ["restart the text", "restart text from beginning", "restart"],
      action: async () => {
        try {
          // Stop listening before feedback
          if (VoiceRecognitionService.isListening) {
            VoiceRecognitionService.stop();
            if (VoiceRecognitionService.callbacks.onEnd)
              VoiceRecognitionService.callbacks.onEnd();
          }
          // First restart the speech
          restartSpeech();

          // Wait a moment for the speech to actually restart
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Then provide feedback
          await VoiceRecognitionService.speak(
            "Restarting the text from the beginning."
          );
        } catch (err) {
          console.error("Error in restart command:", err);
          await VoiceRecognitionService.speak(
            "An error occurred while restarting."
          );
        }
      },
      displayName: "Restart reading",
    },
    {
      keyword: [
        "stop reading",
        "stop text",
        "end reading",
        "and reading",
        "finish reading",
        "terminate reading",
      ],
      action: async () => {
        try {
          // Stop listening before feedback
          if (VoiceRecognitionService.isListening) {
            VoiceRecognitionService.stop();
            if (VoiceRecognitionService.callbacks.onEnd)
              VoiceRecognitionService.callbacks.onEnd();
          }
          console.log("End reading command triggered");

          // Store the current state
          const wasReading =
            TextToSpeechService && TextToSpeechService.isSpeakingNow();

          // Stop the speech completely
          if (wasReading) {
            console.log("Stopping speech");
            stopSpeech();
          }

          // Wait to ensure speech is completely stopped
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Now provide feedback using the VoiceRecognitionService speak method
          // The speak method now automatically handles stopping/starting recognition
          console.log("Providing end reading feedback");
          await VoiceRecognitionService.speak("Ending the reading.");
        } catch (err) {
          console.error("Error in end reading command:", err);
          await VoiceRecognitionService.speak(
            "An error occurred while stopping the reading."
          );
        }
      },
      displayName: "End reading",
    },
  ];

  return { baseCommands, readingCommands };
};

export default generateCourseContentCommands;
