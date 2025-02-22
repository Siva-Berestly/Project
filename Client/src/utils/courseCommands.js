const generateCourseCommands = (courses, navigate, VoiceRecognitionService) => {
  const baseCommands = [
    {
      keyword: [
        "what are the courses available",
        "what courses are available",
        "list courses which are available",
        "list available courses",
        "list all courses",
        "list all the available courses",
        "list course names",
      ],
      action: () => {
        const topCourses = courses.map((course) => course.name).join(", ");
        VoiceRecognitionService.speak(`Available courses are: ${topCourses}.`);
      },
      displayName: "what are the courses available",
    },
  ];

  // Add course-specific commands
  const courseCommands = courses.map((course) => ({
    keyword: [`open ${course.name.toLowerCase()}`],
    action: () => {
      navigate(`/subcourse/${course.name.toLowerCase()}`);
      VoiceRecognitionService.speak(`Opening ${course.name} course`);
    },
    displayName: `open ${course.name}`,
  }));

  // Add help command
  const helpCommand = {
    keyword: ["help", "what are the commands available", "list all commands"],
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
