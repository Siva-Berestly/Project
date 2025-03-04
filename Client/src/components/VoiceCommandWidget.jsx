import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import { HiMicrophone, HiX } from "react-icons/hi";
import VoiceRecognitionService from '../services/VoiceRecognitionService';

const VoiceCommandWidget = ({ commands }) => {
    const [isListening, setIsListening] = useState(false);
    const [lastTranscript, setLastTranscript] = useState('');
    const [error, setError] = useState(null);
    const [micPermission, setMicPermission] = useState(false);
    const [isWidgetExpanded, setIsWidgetExpanded] = useState(false);
    const [needsInteraction, setNeedsInteraction] = useState(true);
    const location = useLocation();

    const handleActivation = useCallback(async () => {
        try {
            await VoiceRecognitionService.init();
            setIsWidgetExpanded(true);
            VoiceRecognitionService.activate();
            await VoiceRecognitionService.speak("Voice commands activated");
        } catch (err) {
            console.error("Activation error:", err);
        }
    }, []);

    const handleDeactivation = useCallback(async () => {
        try {
            setIsWidgetExpanded(false);
            VoiceRecognitionService.deactivate();
            await VoiceRecognitionService.speak("Voice commands deactivated");
        } catch (err) {
            console.error("Deactivation error:", err);
        }
    }, []);

    const resetVoiceCommands = useCallback(() => {
        setIsListening(false);
        setLastTranscript('');
        setError(null);
        setMicPermission(false);
        setIsWidgetExpanded(false);
        setNeedsInteraction(true);
        VoiceRecognitionService.deactivate();
    }, []);

    const helpCommands = [
        {
            keyword: ["help", "what are the commands available", "list all commands"],
            action: () => {
                const commandList = commands
                    .map(cmd => cmd.displayName || (Array.isArray(cmd.keyword) ? cmd.keyword[0] : cmd.keyword))
                    .join(", ");
                VoiceRecognitionService.speak(`Available commands are: ${commandList}`);
            },
            displayName: "help",
        }
    ];

    const processTranscript = useCallback(async (transcript) => {
        if (transcript.includes("start listening")) {
            await handleActivation();
            return;
        }

        if (transcript.includes("stop listening")) {
            await handleDeactivation();
            return;
        }

        if (transcript.includes("open widget")) {
            setIsWidgetExpanded(true);
            return;
        }

        if (transcript.includes("close widget")) {
            setIsWidgetExpanded(false);
            return;
        }

        if (VoiceRecognitionService.isCommandsActive()) {
            let commandExecuted = false;

            // First check help commands
            for (const command of helpCommands) {
                if (Array.isArray(command.keyword)) {
                    if (command.keyword.some(keyword => transcript.includes(keyword))) {
                        await command.action();
                        commandExecuted = true;
                        break;
                    }
                }
            }

            // Then check regular commands
            if (!commandExecuted) {
                for (const command of commands) {
                    if (Array.isArray(command.keyword)) {
                        for (const keyword of command.keyword) {
                            if (transcript.includes(keyword)) {
                                try {
                                    await command.action();
                                    commandExecuted = true;
                                    break;
                                } catch (err) {
                                    console.error(`Command "${keyword}" execution error:`, err);
                                }
                            }
                        }
                    }
                    if (commandExecuted) break;
                }
                if (!commandExecuted) {
                    await VoiceRecognitionService.speak("Command not recognized");
                }
            }
        }
    }, [commands, handleActivation, handleDeactivation]);

    const initVoiceRecognition = useCallback(async () => {
        try {
            await VoiceRecognitionService.init();
            setMicPermission(true);
            VoiceRecognitionService.subscribe({
                onStart: () => {
                    setError(null);
                    setIsListening(true);
                },
                onEnd: () => setIsListening(false),
                onResult: async (transcript) => {
                    setLastTranscript(transcript);
                    console.log("Widget received:", transcript);
                    await processTranscript(transcript);
                },
                onActivate: () => setIsWidgetExpanded(true),
                onDeactivate: () => setIsWidgetExpanded(false),
                onError: ({ error, message }) => {
                    setError(message);
                    setIsListening(false);
                    if (error === 'not-allowed') {
                        setMicPermission(false);
                    }
                }
            });

            await VoiceRecognitionService.start();
        } catch (err) {
            setError(err.message);
            console.error("Failed to initialize voice recognition:", err);
        }
    }, [processTranscript]);

    useEffect(() => {
        const handleInteraction = async () => {
            if (needsInteraction) {
                await VoiceRecognitionService.initAudio();
                setNeedsInteraction(false);
            }
        };

        document.addEventListener('click', handleInteraction);
        return () => document.removeEventListener('click', handleInteraction);
    }, [needsInteraction]);

    useEffect(() => {
        initVoiceRecognition();
        return () => VoiceRecognitionService.stop();
    }, [initVoiceRecognition]);

    // Reinitialize the widget on route change and close the widget
    useEffect(() => {
        resetVoiceCommands();
        initVoiceRecognition();
    }, [location, initVoiceRecognition, resetVoiceCommands]);

    if (!isWidgetExpanded) {
        return (
            <button
                onClick={handleActivation}
                className="fixed bottom-4 right-4 p-4 bg-gray-800 border-2 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            >
                <HiMicrophone size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 p-4 bg-gray-800 text-white rounded-lg shadow-lg z-[9999] max-w-xs w-72">
            <div className="flex flex-col space-y-2">
                {needsInteraction && (
                    <div className="bg-yellow-600 p-2 rounded text-sm mb-2">
                        Click anywhere on the page to enable voice responses
                    </div>
                )}
                <div className="flex justify-between items-center border-b border-gray-600 pb-2">
                    <p className="font-medium">
                        {isListening ? "Listening..." : "Voice Commands"}
                    </p>
                    <div className="flex items-center">
                        <HiMicrophone size={20} className={isListening ? "text-green-500" : "text-gray-400"} />
                        <button onClick={handleDeactivation} className="ml-2">
                            <HiX size={20} className="text-gray-400 hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="text-red-400">
                        <p>{error}</p>
                        <button
                            onClick={initVoiceRecognition}
                            className="mt-2 p-2 bg-red-600 rounded hover:bg-red-700 w-full"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!micPermission && (
                    <button
                        onClick={initVoiceRecognition}
                        className="mt-2 p-2 bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Enable Microphone
                    </button>
                )}

                {lastTranscript && (
                    <p className="text-sm text-gray-300">
                        Last heard: {lastTranscript}
                    </p>
                )}

                <div className="border-t border-gray-600 pt-2"></div>
                <h4 className="font-medium mb-1">Available Commands:</h4>
                <ul className="list-disc list-inside text-sm">
                    {commands.map((command, index) => {
                        return (
                            <li key={index} className="text-gray-300">{command.displayName}</li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

VoiceCommandWidget.propTypes = {
    commands: PropTypes.arrayOf(PropTypes.shape({
        keyword: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
        ]).isRequired,
        action: PropTypes.func.isRequired,
        displayName: PropTypes.string.isRequired,
    })).isRequired,
};
export default VoiceCommandWidget;