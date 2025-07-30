const generateHeadingCommands = (course, navigate, VoiceRecognitionService) => {
  if (!course || !course.title) {
    console.error("Course or course title is undefined:", course);
    return [];
  }

  const baseCommands = [
    {
      keyword: [
        "what is this course about",
        "tell me about this course",
        "course details",
      ],
      action: async () => {
        await VoiceRecognitionService.speak(
          `The course name is ${course.title}.`
        );
        await VoiceRecognitionService.speak(`The sections are:`);
        for (const section of course.sections) {
          await VoiceRecognitionService.speak(`${section.heading}.`);
        }
        await VoiceRecognitionService.speak(
          `You can open any section by saying "open section name".`
        );
      },
      displayName: "course details",
    },
    {
      keyword: ["go to home", "go to home page", "go home"],
      action: async () => {
        await VoiceRecognitionService.speak("Navigating to home page.");
        navigate(`/`);
      },
      displayName: "go to home",
    },
  ];

  const sectionCommands = course.sections
    .map((section) => {
      if (!section.heading) {
        console.error("Section heading is undefined for section:", section);
        return null;
      }
      return {
        keyword: [`open ${section.heading.toLowerCase()}`],
        action: async () => {
          try {
            // Provide feedback first
            await VoiceRecognitionService.speak(
              `Opening section ${section.heading}.`
            );
            // Then navigate after feedback has been delivered
            setTimeout(() => {
              navigate(`/coursecontent/${course.id}/${section.hid}`);
            }, 100);
          } catch (err) {
            console.error(`Error opening section ${section.heading}:`, err);
            await VoiceRecognitionService.speak(
              "Sorry, I couldn't open that section."
            );
          }
        },
        displayName: `open ${section.heading}`,
      };
    })
    .filter(Boolean); // Filter out any null values

  return [...baseCommands, ...sectionCommands];
};

export default generateHeadingCommands;
