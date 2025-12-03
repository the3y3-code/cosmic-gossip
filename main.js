import { Game } from './game.js';
import { LLMService } from './llm_service.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const startBtn = document.getElementById('start-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const messageOverlay = document.getElementById('message-overlay');
    
    // Resize canvas to match container
    canvas.width = 800;
    canvas.height = 600;

    const llmService = new LLMService();
    const game = new Game(canvas, llmService);

    startBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Please enter a Gemini API Key to enable the AI villain!');
            return;
        }

        startBtn.disabled = true;
        startBtn.textContent = "INITIALIZING...";

        llmService.setApiKey(apiKey);
        
        // Try to generate initial boss persona
        try {
            await game.initializeCampaign();
            messageOverlay.classList.add('hidden');
            game.start();
        } catch (error) {
            console.error("Failed to start:", error);
            alert("Failed to connect to AI. Check API Key.");
            startBtn.disabled = false;
            startBtn.textContent = "START MISSION";
        }
    });
});
