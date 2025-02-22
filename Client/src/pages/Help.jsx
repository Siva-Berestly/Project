import { useOutletContext, useNavigate } from "react-router-dom";
import { useState } from 'react'; // Add missing import
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";

const Help = () => {
  const { isDarkMode } = useOutletContext();
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(100);

  const increaseZoom = () => setZoomLevel(prev => Math.min(prev + 10, 150));
  const decreaseZoom = () => setZoomLevel(prev => Math.max(prev - 10, 80));
  const resetZoom = () => setZoomLevel(100);

  const commands = [
    {
      keyword: ["zoom in", "increase zoom"],
      action: increaseZoom,
      displayName: "zoom in",
    },
    {
      keyword: ["zoom out", "decrease zoom"],
      action: decreaseZoom,
      displayName: "zoom out",
    },
    {
      keyword: ["reset zoom"],
      action: resetZoom,
      displayName: "reset zoom",
    },
    {
      keyword: ["describe instructions", "describe help"],
      action: () => {
        VoiceRecognitionService.speak(
          "Welcome to the help page. You can navigate through the application using voice commands. " +
          "Say 'help' on any page to hear available commands. " +
          "Say 'start listening' to activate voice commands and 'stop listening' to deactivate."
        );
      },
      displayName: "describe instructions",
    },
    {
      keyword: ["go back", "return to home", "go to home"],
      action: () => navigate("/"),
      displayName: "go back",
    },
    {
      keyword: ["help", "what can i do", "what are the commands"],
      action: () => {
        VoiceRecognitionService.speak(
          "Available commands are: zoom in, zoom out, reset zoom, describe instructions, go back"
        );
      },
      displayName: "help",
    }
  ];

  const themeClasses = {
    text: isDarkMode ? 'text-white' : 'text-[#202124]',
    card: isDarkMode ? 'bg-[#303134] text-white' : 'bg-gray-100 text-[#202124]',
  };

  return (
    <>
      <VoiceCommandWidget commands={commands} />
      <div className="min-h-screen py-10" style={{ zoom: `${zoomLevel}%` }}>
        <div className="container mx-auto px-4">
          <h1 className={`text-3xl text-center mb-8 ${themeClasses.text}`}>Help & Instructions</h1>
          <div className={`p-6 rounded-lg ${themeClasses.card}`}>
            <h2 className="text-xl mb-4">Voice Commands</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Say "help" on any page to hear available commands</li>
              <li>Say "start listening" to activate voice commands</li>
              <li>Say "stop listening" to deactivate voice commands</li>
              <li>Navigation: "go to home", "go to courses", "go to help"</li>
              <li>Course navigation: "open [course name]"</li>
              <li>Content reading: "speak text [number]"</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;
