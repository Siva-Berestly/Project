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
      action: () => {
        VoiceRecognitionService.speak(`The course name is ${course.title}.`);
        VoiceRecognitionService.speak(`The sections are:`);
        course.sections.forEach((section) => {
          VoiceRecognitionService.speak(`${section.heading}.`);
        });
      },
      displayName: "course details",
    },
    {
      keyword: ["go to home", "go to home page", "go home"],
      action: () => {
        navigate(`/`);
        VoiceRecognitionService.speak("Navigating to home page");
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
        action: () => {
          navigate(`/coursecontent/${course.id}/${section.hid}`);
          VoiceRecognitionService.speak(`Opening section ${section.heading}`);
        },
        displayName: `open ${section.heading}`,
      };
    })
    .filter(Boolean); // Filter out any null values

  return [...baseCommands, ...sectionCommands];
};

export default generateHeadingCommands;
