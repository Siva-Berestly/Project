import FeedbackService from "./feedbackService";
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
          await FeedbackService.provideFeedback("Reading the text aloud.");
          // Only read if section is available
          if (section && section.tcontent) {
            // Use setTimeout to give a moment between voice command response and text reading
            setTimeout(() => {
              try {
                speakText(section.tcontent);
              } catch (err) {
                console.error("Error starting text reading:", err);
                FeedbackService.provideFeedback(
                  "I'm having trouble reading the text. Please try again."
                );
              }
            }, 500);
          } else {
            await FeedbackService.provideFeedback(
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
        await FeedbackService.provideFeedback("Going back to course page.");
        navigate("/courses");
      },
      displayName: "Go back to course page",
    },
    {
      keyword: ["go to home", "go to home page", "go home"],
      action: async () => {
        await FeedbackService.provideFeedback("Navigating to home page.");
        navigate(`/`);
      },
      displayName: "Go to home",
    },
  ];

  // If section is not available, return only base commands
  if (!section || !section.heading) {
    return { baseCommands, readingCommands: [] };
  }

  const readingCommands = [
    {
      keyword: [
        "pause the text",
        "pause text",
        "pause reading",
        "pause",
        "stop",
      ],
      action: async () => {
        try {
          // First pause the speech
          const paused = await pauseSpeech();

          // Wait a moment for the speech to actually pause
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Then provide feedback if successfully paused
          if (paused) {
            await FeedbackService.provideFeedback("Pausing the text.");

            // Ensure voice recognition is listening after feedback
            if (!VoiceRecognitionService.isListening) {
              await VoiceRecognitionService.start();
            }
          } else {
            await FeedbackService.provideFeedback("Unable to pause the text.");
          }
        } catch (err) {
          console.error("Error in pause command:", err);
          await FeedbackService.provideFeedback(
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
      ],
      action: async () => {
        try {
          // First resume the speech
          const resumed = await resumeSpeech();

          // Wait a moment for the speech to actually resume
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Then provide feedback if successfully resumed
          if (resumed) {
            await FeedbackService.provideFeedback("Resuming the text.");

            // Ensure voice recognition is listening after feedback
            if (!VoiceRecognitionService.isListening) {
              await VoiceRecognitionService.start();
            }
          } else {
            await FeedbackService.provideFeedback("Unable to resume the text.");
          }
        } catch (err) {
          console.error("Error in resume command:", err);
          await FeedbackService.provideFeedback(
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
          // First restart the speech
          restartSpeech();

          // Wait a moment for the speech to actually restart
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Then provide feedback
          await FeedbackService.provideFeedback(
            "Restarting the text from the beginning."
          );
        } catch (err) {
          console.error("Error in restart command:", err);
          await FeedbackService.provideFeedback(
            "An error occurred while restarting."
          );
        }
      },
      displayName: "Restart reading",
    },
    {
      keyword: ["end reading","and reading", "finish reading", "terminate reading"],
      action: async () => {
        try {
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
          // instead of FeedbackService to avoid conflicts
          console.log("Providing end reading feedback");
          await VoiceRecognitionService.speak(
            "Ending the reading."
          );

          // Make sure voice recognition is active
          if (!VoiceRecognitionService.isListening) {
            await VoiceRecognitionService.start();
          }
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
