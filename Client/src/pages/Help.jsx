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
      <div className="py-10" style={{ zoom: `${zoomLevel}%` }}>
        <div className="container mx-auto px-4">
          <h1 className={`text-3xl text-center mb-8 poppins-bold ${themeClasses.text}`}>Help & Instructions</h1>
          <div className={`p-6 rounded-lg ${themeClasses.card}`}>
            <h2 className="text-xl mb-4 poppins-semibold">Voice Commands</h2>
            <ul className="list-disc pl-6 space-y-2 poppins-regular mb-10">
              <li>Say <span className="poppins-bold">&quot;help&quot;</span> on any page to hear available commands.</li>
              <li>Say <span className="poppins-bold">&quot;start listening&quot;</span> to activate voice commands.</li>
              <li>Say <span className="poppins-bold">&quot;stop listening&quot;</span> to deactivate voice commands.</li>
              <li>Navigation: <span className="poppins-bold">&quot;go to home&quot;, &quot;go back&quot;</span>.</li>
              <li>Project navigation: <span className="poppins-bold">&quot;open [course name]&quot;</span>.</li>
            </ul>
            <h2 className="text-xl mb-4 poppins-semibold">Screen Readers</h2>
            <ul className="list-disc pl-6 space-y-2 poppins-regular">
              <li><a href="https://www.bdu.ac.in/screen-reader-access.php" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Screen Reader Access</a> (Free)</li>
              <li><a href="https://www.freedomscientific.com/products/software/jaws/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">JAWS Screen Reader</a> (Paid)</li>
              <li><a href="https://www.nvaccess.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">NVDA Screen Reader</a> (Free)</li>
              <li><a href="https://www.apple.com/voiceover/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">VoiceOver for macOS</a> (Free with macOS)</li>
              <li><a href="https://www.microsoft.com/en-us/accessibility/windows" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Narrator for Windows</a> (Free with Windows)</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;
