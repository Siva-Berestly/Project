import { useEffect } from 'react';
import PropTypes from 'prop-types';
import VoiceRecognitionService from '../services/VoiceRecognitionService';

const VoiceCommand = ({ commands }) => {
    useEffect(() => {
        const initVoiceRecognition = async () => {
            try {
                await VoiceRecognitionService.init();
                VoiceRecognitionService.subscribe({
                    onResult: async (transcript) => {
                        if (VoiceRecognitionService.isCommandsActive()) {
                            await VoiceRecognitionService.processCommands(transcript, commands);
                        }
                    }
                });
            } catch (err) {
                console.error("Failed to initialize voice recognition:", err);
            }
        };

        initVoiceRecognition();
        return () => { };
    }, [commands]);

    return null;
};

VoiceCommand.propTypes = {
    commands: PropTypes.arrayOf(PropTypes.shape({
        keyword: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
    })).isRequired,
};

export default VoiceCommand;
