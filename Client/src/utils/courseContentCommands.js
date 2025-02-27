const generateCourseContentCommands = (
  section,
  navigate,
  VoiceRecognitionService,
  speakText,
  pauseSpeech,
  resumeSpeech,
  restartSpeech
) => {
  if (!section || !section.heading) {
    console.error("Section or section heading is undefined:", section);
    return [];
  }

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
      action: () => {
        VoiceRecognitionService.speak("Reading the text aloud.");
        speakText(section.tcontent);
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
      action: () => {
        navigate("/courses");
        VoiceRecognitionService.speak("Going back to course page.");
      },
      displayName: "Go back to course page",
    },
    {
      keyword: ["go to home", "go to home page", "go home"],
      action: () => {
        navigate(`/`);
        VoiceRecognitionService.speak("Navigating to home page");
      },
      displayName: "Go to home",
    },
  ];

  const readingCommands = [
    {
      keyword: [
        "pause the text",
        "pause text",
        "pause reading",
        "pause",
        "stop",
        "stop reading",
      ],
      action: () => {
        VoiceRecognitionService.speak("Pausing the text.");
        pauseSpeech();
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
      action: () => {
        VoiceRecognitionService.speak("Resuming the text.");
        resumeSpeech();
      },
      displayName: "Resume reading",
    },
    {
      keyword: ["restart the text", "restart text from beginning", "restart"],
      action: () => {
        VoiceRecognitionService.speak(
          "Restarting the text from the beginning."
        );
        restartSpeech();
      },
      displayName: "Restart reading",
    },
  ];

  return { baseCommands, readingCommands };
};

export default generateCourseContentCommands;
