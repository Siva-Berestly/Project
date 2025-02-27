const generateCourseCommands = (courses, navigate, VoiceRecognitionService) => {
  const baseCommands = [
    {
      keyword: ["what are the courses available"],
      action: () => {
        if (courses.length === 0) {
          VoiceRecognitionService.speak("Courses are not available.");
        } else {
          const topCourses = courses.map((course) => course.title).join(", ");
          VoiceRecognitionService.speak(
            `Available courses are: ${topCourses}.`
          );
          VoiceRecognitionService.speak(
            `You can open any course by saying "open course name".`
          );
        }
      },
      displayName: "what are the courses available",
    },
    {
      keyword: ["go to home", "go to home page", "go home"],
      action: () => {
        VoiceRecognitionService.speak("Navigating to home page");
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
        action: () => {
          navigate(`/heading/${course.title.toLowerCase()}`);
          VoiceRecognitionService.speak(`Opening ${course.title} course`);
        },
        displayName: `open ${course.title}`,
      };
    })
    .filter(Boolean); // Filter out any null values

  // Add help command
  const helpCommand = {
    keyword: ["help", "what are the commands available"],
    action: () => {
      const allCommands = [...baseCommands, ...courseCommands]
        .map((cmd) => cmd.displayName)
        .join(", ");
      VoiceRecognitionService.speak(`Available commands are: ${allCommands}`);
    },
    displayName: "help",
  };

  return [...baseCommands, ...courseCommands, helpCommand];
};

export default generateCourseCommands;
