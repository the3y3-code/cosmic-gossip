// --- LLM Service ---
class LLMService {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

        // Huge static cache for variety (News + General)
        this.banterCache = [
            // --- NEWS FROM TODAY (Aliens reacting to Earth news) ---
            { A: "They have fried chicken toothpaste?", B: "Disgusting. I want it." },
            { A: "A Lego crime boss?", B: "Is he our leader?" },
            { A: "Robots fighting chickens?", B: "My money is on the chicken." },
            { A: "Smurfs everywhere in France.", B: "Are they dangerous?" },
            { A: "A dinosaur named Clair was stolen.", B: "We should steal it too." },
            { A: "Wine heist: $38,000 bottles.", B: "Earthlings drink money?" },
            { A: "Someone ordered 22 cases of lollipops.", B: "A tactical supply drop." },
            { A: "Cat smuggling drugs in prison.", B: "Cats are the true rulers." },
            { A: "Pasta controversy on Earth.", B: "Destroy the pasta!" },
            { A: "Meat cleaver on a plane?", B: "Amateurs." },

            // --- DAILY LIFE & INVASION ---
            { A: "Did you pay the rent?", B: "I thought YOU did!" },
            { A: "My laser itches.", B: "Don't scratch it." },
            { A: "Earth food is weird.", B: "Try the pizza." },
            { A: "I miss Mars.", B: "It's too red there." },
            { A: "Are we winning?", B: "Ask the boss." },
            { A: "Nice shot!", B: "I missed..." },
            { A: "Human spotted!", B: "Ew, gross." },
            { A: "My ship is leaking.", B: "Use duct tape." },
            { A: "Who's driving?", B: "Not me!" },
            { A: "I'm hungry.", B: "We eat later." },
            { A: "Left or right?", B: "Just shoot!" },
            { A: "My tentacles hurt.", B: "Stop complaining." },
            { A: "Look at that hair.", B: "Humans are weird." },
            { A: "Can we go home?", B: "After we win." },
            { A: "I need a nap.", B: "Wake up!" },
            { A: "My suit is tight.", B: "Stop eating asteroids." },
            { A: "Did you feed the cat?", B: "The cat ate me." },
            { A: "I forgot my password.", B: "Is it 1234?" },
            { A: "This gravity is heavy.", B: "Do some squats." },
            { A: "Where is the bathroom?", B: "In the nebula." },
            { A: "I love this song.", B: "It's just static." },
            { A: "My mom is calling.", B: "Don't answer!" },
            { A: "I stepped in gum.", B: "Earth is sticky." },
            { A: "Do I look fat?", B: "You look terrifying." },
            { A: "I want a pet human.", B: "They shed too much." },
            { A: "My blaster is jammed.", B: "Hit it." },
            { A: "Is it Tuesday?", B: "It's Doomsday." },
            { A: "I dropped my keys.", B: "Leave them." },
            { A: "This planet is wet.", B: "It's mostly water." },
            { A: "I saw a cow.", B: "Did you abduct it?" },
            { A: "My wifi is slow.", B: "We are in space!" },
            { A: "I need a vacation.", B: "Visit the sun." },
            { A: "Who ate my sandwich?", B: "The commander." },
            { A: "I'm bored.", B: "Shoot something." },
            { A: "Nice parking job.", B: "I hit a satellite." },
            { A: "Do we have insurance?", B: "For invasion? No." },
            { A: "I lost my contact lens.", B: "You have 5 eyes." },
            { A: "What's that smell?", B: "Probably Florida." },
            { A: "Can I drive?", B: "No, you crash." },
            { A: "I want coffee.", B: "Black hole brew?" },
            { A: "Are we there yet?", B: "Almost." },
            { A: "I hate Mondays.", B: "It's Friday." },
            { A: "My boots squeak.", B: "Oil them." },
            { A: "Look, a celebrity!", B: "Vaporize them." },
            { A: "I need a raise.", B: "We get paid in exposure." }
        ];
        this.backupBanter = [...this.banterCache];

        this.beggingCache = [
            "Please don't kill me!",
            "I have 500 kids!",
            "I'll be your pet!",
            "I was forced to come!",
            "I can cook!",
            "Spare me, human!",
            "I'm just an intern!",
            "Take my ship instead!",
            "I love Earth music!",
            "I'll do your laundry!"
        ];

        this.isFetching = false;
        this.topics = ["current events", "human news", "food", "dating", "human fashion", "the boss", "spaceship maintenance", "weekend plans", "pets"];
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

    async prefetchBanter() {
        if (this.isFetching || this.banterCache.length > 20) return;
        this.isFetching = true;

        const topic = this.topics[Math.floor(Math.random() * this.topics.length)];
        const prompt = `Generate 10 pairs of short, funny dialogue (max 6 words per line) between two space invaders discussing "${topic}" while attacking Earth.
        Format: JSON array of objects with keys "A" and "B".
        Example: [{"A": "Did you lock the ship?", "B": "I forgot!"}, {"A": "My feet hurt.", "B": "Float then."}]
        Return ONLY the JSON.`;

        const text = await this.generateContent(prompt);
        if (text) {
            try {
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const pairs = JSON.parse(cleanText);
                if (Array.isArray(pairs)) {
                    this.banterCache.push(...pairs);
                }
            } catch (e) {
                console.error("Failed to parse banter:", e);
            }
        }
        this.isFetching = false;
    }

    getBanter() {
        if (this.banterCache.length === 0) {
            this.prefetchBanter();
            return this.backupBanter[Math.floor(Math.random() * this.backupBanter.length)];
        }
        if (this.banterCache.length < 10) this.prefetchBanter();
        return this.banterCache.shift();
    }

    getBegging() {
        return this.beggingCache[Math.floor(Math.random() * this.beggingCache.length)];
    }

    refreshBanter() {
        // Clear current cache to force fresh topics, but prefetch immediately
        this.banterCache = [];
        this.prefetchBanter();
    }
}

// --- Sound Manager ---
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playShoot() {
        this.playTone(880, 'square', 0.1, 0.05);
    }

    playEnemyShoot() {
        this.playTone(200, 'sawtooth', 0.2, 0.05);
    }

    playMove(step) {
        // 4-note march sequence
        const freqs = [180, 170, 160, 150];
        this.playTone(freqs[step % 4], 'square', 0.05, 0.05);
    }

    playExplosion() {
        if (!this.enabled) return;
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 sec
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    }

    playLevelComplete() {
        if (!this.enabled) return;
        // Victory arpeggio: C4, E4, G4, C5
        const notes = [261.63, 329.63, 392.00, 523.25];
        const now = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine'; // Sine wave for a pleasant "chime" sound
            osc.frequency.setValueAtTime(freq, now + i * 0.15);

            gain.gain.setValueAtTime(0.1, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.3);
        });
    }
}

// --- Sprites ---
const Sprites = {
    player: [
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    alien1_a: [
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0]
    ],
    alien1_b: [
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]
    ],
    alien2_a: [
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0]
    ],
    alien2_b: [
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]
    ],
    missile_player: [
        [0, 1, 0],
        [1, 1, 1],
        [1, 1, 1],
        [0, 1, 0]
    ],
    missile_enemy: [
        [1, 0, 1],
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
    ],
    bunker: [
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
    ]
};

// --- Game Logic ---
class Game {
    constructor(canvas, llmService) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.llmService = llmService;
        this.sound = new SoundManager();

        this.width = canvas.width;
        this.height = canvas.height;

        this.lastTime = 0;
        this.isRunning = false;

        this.score = 0;
        this.lives = 3;
        this.level = 1;

        this.scale = 4;

        this.player = {
            x: this.width / 2,
            y: this.height - 50,
            width: 13 * this.scale,
            height: 8 * this.scale,
            speed: 300,
            color: '#00ffcc',
            cooldown: 0
        };

        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.bunkers = [];
        this.enemyDirection = 1;
        this.enemyStepDown = false;
        this.enemyMoveTimer = 0;
        this.enemyMoveInterval = 1.0;
        this.animationFrame = 0;
        this.moveStepCount = 0;

        this.keys = {};
        this.speechBubbles = [];
        this.banterTimer = 0;
        this.nextBanterInterval = Math.random() * 4 + 1; // 1 to 5 seconds
        this.pendingResponse = null;

        this.rowColors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff'];

        this.bindInput();
    }

    bindInput() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        // Resume AudioContext on interaction
        window.addEventListener('click', () => {
            if (this.sound.ctx.state === 'suspended') {
                this.sound.ctx.resume();
            }
        });
    }

    async initializeCampaign() {
        // Start prefetching banter
        this.llmService.prefetchBanter();
        this.setupLevel();
    }

    setupLevel() {
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.bunkers = [];
        this.speechBubbles = [];
        this.pendingResponse = null;
        this.animationFrame = 0;
        this.moveStepCount = 0;

        const rows = 3 + Math.min(this.level, 5);
        const cols = 6 + Math.min(this.level, 4);

        const alienWidth = 12 * this.scale;
        const alienHeight = 8 * this.scale;

        const gridWidth = cols * (alienWidth + 20);
        const startX = (this.width - gridWidth) / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.enemies.push({
                    x: startX + c * (alienWidth + 20),
                    y: 60 + r * (alienHeight + 20),
                    width: alienWidth,
                    height: alienHeight,
                    type: r % 2 === 0 ? 'alien1' : 'alien2',
                    color: this.rowColors[r % this.rowColors.length],
                    alive: true
                });
            }
        }
        // Faster movement start
        // Faster movement start: Base 0.6s, decreases by 0.08s per level, min 0.05s
        this.enemyMoveInterval = Math.max(0.05, 0.6 - (this.level * 0.08));

        this.setupBunkers();
    }

    setupBunkers() {
        const bunkerCount = 4;
        const spacing = this.width / (bunkerCount + 1);
        const bunkerSprite = Sprites.bunker;

        for (let i = 1; i <= bunkerCount; i++) {
            const bx = spacing * i - (17 * this.scale / 2);
            const by = this.height - 150;

            for (let r = 0; r < bunkerSprite.length; r++) {
                for (let c = 0; c < bunkerSprite[r].length; c++) {
                    if (bunkerSprite[r][c] === 1) {
                        this.bunkers.push({
                            x: bx + c * this.scale,
                            y: by + r * this.scale,
                            width: this.scale,
                            height: this.scale,
                            active: true
                        });
                    }
                }
            }
        }
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(t => this.loop(t));
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        this.update(dt);
        this.draw();
        requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
        // Player Movement
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.x -= this.player.speed * dt;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.x += this.player.speed * dt;
        this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));

        // Player Shooting
        if (this.player.cooldown > 0) this.player.cooldown -= dt;
        if ((this.keys['Space'] || this.keys['Enter']) && this.player.cooldown <= 0) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - (3 * this.scale / 2),
                y: this.player.y,
                width: 3 * this.scale,
                height: 4 * this.scale,
                speed: 500,
                active: true
            });
            this.player.cooldown = 0.8; // Slower fire rate
            this.sound.playShoot();
        }

        // Update Bullets
        this.bullets.forEach(b => {
            b.y -= b.speed * dt;
            if (b.y < 0) b.active = false;
        });
        this.bullets = this.bullets.filter(b => b.active);

        // Enemy Logic
        this.enemyMoveTimer += dt;
        if (this.enemyMoveTimer > this.enemyMoveInterval) {
            this.enemyMoveTimer = 0;
            this.moveEnemies();
            this.enemyShoot();
        }

        // Enemy Bullets
        this.enemyBullets.forEach(b => {
            b.y += b.speed * dt;
            if (b.y > this.height) b.active = false;
        });
        this.enemyBullets = this.enemyBullets.filter(b => b.active);

        // Banter Logic
        // Only count up if no one is speaking and no response is pending
        if (this.speechBubbles.length === 0 && !this.pendingResponse) {
            this.banterTimer += dt;
        }

        if (this.banterTimer > this.nextBanterInterval) {
            this.banterTimer = 0;
            this.triggerBanter();
            // Reset interval for next time
            this.nextBanterInterval = Math.random() * 4 + 1; // 1 to 5 seconds
        }

        // Handle Pending Response
        if (this.pendingResponse) {
            this.pendingResponse.timer -= dt;
            if (this.pendingResponse.timer <= 0) {
                this.triggerResponse(this.pendingResponse.text);
                this.pendingResponse = null;
            }
        }

        // Update Speech Bubbles
        this.speechBubbles.forEach(sb => sb.life -= dt);
        this.speechBubbles = this.speechBubbles.filter(sb => sb.life > 0);

        this.checkCollisions();

        if (this.enemies.every(e => !e.alive)) {
            this.levelComplete();
        }
    }

    triggerBanter() {
        const livingEnemies = this.enemies.filter(e => e.alive);
        if (livingEnemies.length === 0) return;

        // If only 1 alien left, beg for mercy
        if (livingEnemies.length === 1) {
            this.triggerBegging(livingEnemies[0]);
            return;
        }

        // Conversation between 2 aliens
        const speaker1 = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
        const dialogue = this.llmService.getBanter();

        this.speechBubbles.push({
            x: speaker1.x + speaker1.width / 2,
            y: speaker1.y - 10,
            text: dialogue.A,
            life: 2.0
        });

        // Schedule response
        this.pendingResponse = {
            timer: 1.5,
            text: dialogue.B
        };
    }

    triggerBegging(alien) {
        const text = this.llmService.getBegging();
        this.speechBubbles.push({
            x: alien.x + alien.width / 2,
            y: alien.y - 10,
            text: text,
            life: 2.0
        });
    }

    triggerResponse(text) {
        const livingEnemies = this.enemies.filter(e => e.alive);
        if (livingEnemies.length === 0) return;

        // Try to find a different speaker if possible
        const speaker2 = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];

        this.speechBubbles.push({
            x: speaker2.x + speaker2.width / 2,
            y: speaker2.y - 10,
            text: text,
            life: 2.0
        });
    }

    moveEnemies() {
        this.animationFrame = this.animationFrame === 0 ? 1 : 0;
        this.moveStepCount++;
        this.sound.playMove(this.moveStepCount);

        let hitWall = false;
        this.enemies.forEach(e => {
            if (!e.alive) return;
            if (this.enemyStepDown) {
                e.y += 20;
            } else {
                e.x += 10 * this.enemyDirection;
                // Margin to keep them fully on screen
                if (e.x <= 10 || e.x + e.width >= this.width - 10) hitWall = true;
            }
        });

        if (this.enemyStepDown) {
            this.enemyStepDown = false;
        } else if (hitWall) {
            this.enemyDirection *= -1;
            this.enemyStepDown = true;
        }
    }

    enemyShoot() {
        const livingEnemies = this.enemies.filter(e => e.alive);
        if (livingEnemies.length === 0) return;

        // Shoot MORE often (1-3 shots)
        const shots = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < shots; i++) {
            if (Math.random() < 0.7) { // 70% chance per shot attempt (increased from 60%)
                const shooter = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
                this.enemyBullets.push({
                    x: shooter.x + shooter.width / 2 - (3 * this.scale / 2),
                    y: shooter.y + shooter.height,
                    width: 3 * this.scale,
                    height: 4 * this.scale,
                    speed: 350, // Slightly faster bullets
                    active: true
                });
                this.sound.playEnemyShoot();
            }
        }
    }

    checkCollisions() {
        // Player Bullets
        this.bullets.forEach(b => {
            // Vs Enemies
            this.enemies.forEach(e => {
                if (!e.alive) return;
                if (this.rectIntersect(b, e)) {
                    e.alive = false;
                    b.active = false;
                    this.score += 100;
                    document.getElementById('score').textContent = this.score;
                    this.sound.playExplosion();
                }
            });

            // Vs Bunkers
            this.bunkers.forEach(bk => {
                if (!bk.active) return;
                if (this.rectIntersect(b, bk)) {
                    bk.active = false;
                    b.active = false;
                }
            });
        });

        // Enemy Bullets
        this.enemyBullets.forEach(b => {
            // Vs Player
            if (this.rectIntersect(b, this.player)) {
                b.active = false;
                this.handlePlayerHit();
            }

            // Vs Bunkers
            this.bunkers.forEach(bk => {
                if (!bk.active) return;
                if (this.rectIntersect(b, bk)) {
                    bk.active = false;
                    b.active = false;
                }
            });
        });
    }

    rectIntersect(r1, r2) {
        return !(r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y);
    }

    handlePlayerHit() {
        this.lives--;
        document.getElementById('lives').textContent = this.lives;
        this.sound.playExplosion();

        this.canvas.style.transform = 'translate(5px, 5px)';
        setTimeout(() => this.canvas.style.transform = 'translate(-5px, -5px)', 50);
        setTimeout(() => this.canvas.style.transform = 'none', 100);

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    async gameOver() {
        this.isRunning = false;
        setTimeout(() => {
            alert(`GAME OVER! Score: ${this.score}`);
            location.reload();
        }, 1000);
    }

    async levelComplete() {
        this.sound.playLevelComplete();
        this.llmService.refreshBanter();

        this.level++;
        document.getElementById('level').textContent = this.level;
        this.isRunning = false;

        setTimeout(() => {
            this.setupLevel();
            this.start();
        }, 3000); // Wait for music to finish
    }

    draw() {
        this.ctx.fillStyle = 'rgba(5, 5, 16, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Player
        this.drawSprite(Sprites.player, this.player.x, this.player.y, this.player.color, this.scale);

        // Enemies
        this.enemies.forEach(e => {
            if (e.alive) {
                const spriteKey = `${e.type}_${this.animationFrame === 0 ? 'a' : 'b'}`;
                this.drawSprite(Sprites[spriteKey], e.x, e.y, e.color, this.scale);
            }
        });

        // Bunkers
        this.ctx.fillStyle = '#00ff00';
        this.bunkers.forEach(bk => {
            if (bk.active) {
                this.ctx.fillRect(bk.x, bk.y, bk.width, bk.height);
            }
        });

        // Bullets
        this.bullets.forEach(b => {
            this.drawSprite(Sprites.missile_player, b.x, b.y, '#ffffff', this.scale);
        });

        this.enemyBullets.forEach(b => {
            this.drawSprite(Sprites.missile_enemy, b.x, b.y, '#ff0000', this.scale);
        });

        // Speech Bubbles
        this.drawSpeechBubbles();
    }

    drawSprite(spriteMap, x, y, color, scale) {
        this.ctx.fillStyle = color;
        for (let r = 0; r < spriteMap.length; r++) {
            for (let c = 0; c < spriteMap[r].length; c++) {
                if (spriteMap[r][c] === 1) {
                    this.ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
                }
            }
        }
    }

    drawSpeechBubbles() {
        this.ctx.font = '14px "Courier New", monospace';
        this.ctx.textAlign = 'center';

        this.speechBubbles.forEach(sb => {
            const width = this.ctx.measureText(sb.text).width + 10;
            const height = 20;

            // Bubble Background
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(sb.x - width / 2, sb.y - height - 5, width, height);

            // Triangle pointer
            this.ctx.beginPath();
            this.ctx.moveTo(sb.x, sb.y);
            this.ctx.lineTo(sb.x - 5, sb.y - 5);
            this.ctx.lineTo(sb.x + 5, sb.y - 5);
            this.ctx.fill();

            // Text
            this.ctx.fillStyle = '#000000';
            this.ctx.fillText(sb.text, sb.x, sb.y - 10);
        });
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const startBtn = document.getElementById('start-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const messageOverlay = document.getElementById('message-overlay');

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

        // Resume Audio Context
        game.sound.resume();

        startBtn.disabled = true;
        startBtn.textContent = "INITIALIZING...";

        llmService.setApiKey(apiKey);

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

    const offlineBtn = document.getElementById('offline-btn');
    if (offlineBtn) {
        offlineBtn.addEventListener('click', async () => {
            game.sound.resume();
            offlineBtn.disabled = true;
            startBtn.disabled = true;
            offlineBtn.textContent = "STARTING...";

            // No API key set, LLMService will use cache/backup

            try {
                await game.initializeCampaign();
                messageOverlay.classList.add('hidden');
                game.start();
            } catch (error) {
                console.error("Failed to start offline:", error);
                offlineBtn.disabled = false;
                startBtn.disabled = false;
                offlineBtn.textContent = "PLAY OFFLINE";
            }
        });
    }
});
