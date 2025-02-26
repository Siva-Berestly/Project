const generateSubCourseCommands = (course, navigate, voiceService, toggleStep, readStepText, readSteps) => {
    const allSteps = course.sections.flatMap(section => section.steps);
    
    return [
        // Step opening commands
        ...allSteps.map(step => ({
            keyword: [`open ${step.title.toLowerCase()}`],
            action: () => {
                toggleStep(step.id);
                voiceService.speak(`Opened ${step.title}`);
            },
            displayName: `open ${step.title}`,
        })),
        {
            keyword: ["read that text", "read this step", "read current step", "read the text of opened topic"],
            action: () => {
                readStepText();
            },
            displayName: "read that text",
        },
        {
            keyword: ["read the steps"],
            action: readSteps,
            displayName: "read the steps",
        },
        {
            keyword: ["go back", "return to home", "go to home"],
            action: () => {
                navigate("/");
                voiceService.speak("Going back to home");
            },
            displayName: "go back",
        },
        {
            keyword: ["help", "what can i do", "what are the commands"],
            action: () => {
                const stepCommands = allSteps.map(step => `open ${step.title}`);
                const baseCommands = ["read that text", "read the steps", "go back", "help"];
                const availableCommands = [...stepCommands, ...baseCommands].join(", ");
                voiceService.speak(`Available commands are: ${availableCommands}`);
            },
            displayName: "help",
        }
    ];
};

export default generateSubCourseCommands;
