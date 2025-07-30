import { useOutletContext, useNavigate } from "react-router-dom";
import VoiceCommandWidget from "../components/VoiceCommandWidget";
import VoiceRecognitionService from "../services/VoiceRecognitionService";

const Help = () => {
  const { isDarkMode, textSize } = useOutletContext();
  const navigate = useNavigate();

  const commands = [
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
          "Available commands are: describe instructions, go back to home"
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
      <div className="py-6 sm:py-10 w-full overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl text-center mb-6 sm:mb-8 poppins-bold ${themeClasses.text} ${textSize} break-words`}>
            Help & Instructions
          </h1>
          <div className={`p-4 sm:p-6 rounded-lg ${themeClasses.card} w-full max-w-full overflow-x-hidden`}>
            <h2 className={`text-lg sm:text-xl mb-4 poppins-semibold ${textSize}`}>Voice Commands</h2>
            <ul className={`list-disc pl-4 sm:pl-6 space-y-2 poppins-regular mb-6 sm:mb-10 ${textSize} break-words leading-relaxed`}>
              <li>Say <span className="poppins-bold">&quot;help&quot;</span> on any page to hear available commands.</li>
              <li>Say <span className="poppins-bold">&quot;start listening&quot;</span> to activate voice commands.</li>
              <li>Say <span className="poppins-bold">&quot;stop listening&quot;</span> to deactivate voice commands.</li>
              <li>Navigation: <span className="poppins-bold">&quot;go to home&quot;, &quot;go back&quot;</span>.</li>
              <li>Project navigation: <span className="poppins-bold">&quot;open [course name]&quot;</span>.</li>
            </ul>
            <h2 className={`text-lg sm:text-xl mb-4 poppins-semibold ${textSize}`}>Screen Readers</h2>
            <ul className={`list-disc pl-4 sm:pl-6 space-y-2 poppins-regular ${textSize} break-words leading-relaxed`}>
              <li><a href="https://www.bdu.ac.in/screen-reader-access.php" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">Screen Reader Access</a> (Free)</li>
              <li><a href="https://www.freedomscientific.com/products/software/jaws/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">JAWS Screen Reader</a> (Paid)</li>
              <li><a href="https://www.nvaccess.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">NVDA Screen Reader</a> (Free)</li>
              <li><a href="https://www.apple.com/voiceover/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">VoiceOver for macOS</a> (Free with macOS)</li>
              <li><a href="https://www.microsoft.com/en-us/accessibility/windows" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline break-all">Narrator for Windows</a> (Free with Windows)</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;
