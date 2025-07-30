const generateCourseCommands = (courses, navigate, VoiceRecognitionService) => {
  const baseCommands = [
    {
      keyword: ["what are the courses available"],
      action: async () => {
        if (courses.length === 0) {
          await VoiceRecognitionService.speak("Courses are not available.");
        } else {
          const topCourses = courses.map((course) => course.title).join(", ");
          await VoiceRecognitionService.speak(
            `Available courses are: ${topCourses}.`
          );
          await VoiceRecognitionService.speak(
            `You can open any course by saying "open course name".`
          );
        }
      },
      displayName: "what are the courses available",
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

  // Add course-specific commands
  const courseCommands = courses
    .map((course) => {
      if (!course.title) {
        console.error("Course title is undefined for course:", course);
        return null;
      }
      return {
        keyword: [`open ${course.title.toLowerCase()}`],
        action: async () => {
          try {
            // Provide feedback first
            await VoiceRecognitionService.speak(
              `Opening ${course.title} course.`
            );
            // Then navigate after feedback has been delivered
            setTimeout(() => {
              navigate(`/heading/${course.title.toLowerCase()}`);
            }, 100);
          } catch (err) {
            console.error("Error in opening course:", err);
            await VoiceRecognitionService.speak(
              "Sorry, I couldn't open that course."
            );
          }
        },
        displayName: `open ${course.title}`,
      };
    })
    .filter(Boolean); // Filter out any null values

  // Add help command
  const helpCommand = {
    keyword: ["help", "what are the commands available"],
    action: async () => {
      const allCommands = [...baseCommands, ...courseCommands]
        .map((cmd) => cmd.displayName)
        .join(", ");
      await VoiceRecognitionService.speak(
        `Available commands are: ${allCommands}`
      );
    },
    displayName: "help",
  };

  return [...baseCommands, ...courseCommands, helpCommand];
};

export default generateCourseCommands;
