import FeedbackService from "./feedbackService";

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
          const paused = await pauseSpeech();
          if (paused) {
            setTimeout(async () => {
              if (!VoiceRecognitionService.isListening) {
                await VoiceRecognitionService.start();
              }
              await FeedbackService.provideFeedback("Pausing the text.");
            }, 100);
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
          const resumed = await resumeSpeech();
          if (resumed) {
            setTimeout(async () => {
              if (!VoiceRecognitionService.isListening) {
                await VoiceRecognitionService.start();
              }
              await FeedbackService.provideFeedback("Resuming the text.");
            }, 100);
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
        await FeedbackService.provideFeedback(
          "Restarting the text from the beginning."
        );
        restartSpeech();
      },
      displayName: "Restart reading",
    },
    {
      keyword: ["end reading", "finish reading", "terminate reading"],
      action: async () => {
        await FeedbackService.provideFeedback(
          "Stopping the reading completely. You can start again by saying 'start reading'."
        );
        stopSpeech(); // First stop the speech
        // Allow time for stopSpeech to complete its operation
        setTimeout(async () => {
          if (!VoiceRecognitionService.isListening) {
            await VoiceRecognitionService.start();
          }
        }, 100);
      },
      displayName: "End reading",
    },
  ];

  return { baseCommands, readingCommands };
};

export default generateCourseContentCommands;
