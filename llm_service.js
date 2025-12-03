export class LLMService {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    async generateContent(prompt) {
        if (!this.apiKey) return null;

        const body = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("LLM Error:", error);
            return null;
        }
    }

    async generateBossPersona() {
        const prompt = `You are a creative game designer. Generate a JSON object for a Space Invaders boss villain. 
        It should have:
        - "name": A scary or cool sci-fi name.
        - "title": A title like "The World Eater".
        - "greeting": A short, threatening opening line (max 15 words).
        - "theme_color": A hex code for their theme (e.g., "#FF0000").
        
        Return ONLY the JSON.`;

        const text = await this.generateContent(prompt);
        return this.parseJson(text);
    }

    async generateTaunt(playerScore, situation) {
        const prompt = `You are the villain of a space game. The player just ${situation}. Their score is ${playerScore}. 
        Generate a short, biting taunt (max 10 words). Be mean but funny. Return just the text.`;

        return await this.generateContent(prompt);
    }

    parseJson(text) {
        try {
            // Clean up markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("JSON Parse Error", e);
            return {
                name: "Glitch",
                title: "The Unparsed",
                greeting: "I am error.",
                theme_color: "#FF0000"
            };
        }
    }
}
