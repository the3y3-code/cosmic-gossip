export class Game {
    constructor(canvas, llmService) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.llmService = llmService;

        this.width = canvas.width;
        this.height = canvas.height;

        this.lastTime = 0;
        this.isRunning = false;

        this.score = 0;
        this.lives = 3;
        this.level = 1;

        this.player = {
            x: this.width / 2,
            y: this.height - 50,
            width: 40,
            height: 30,
            speed: 300,
            color: '#00ffcc',
            cooldown: 0
        };

        this.bullets = [];
        this.enemies = [];
        this.enemyDirection = 1;
        this.enemyStepDown = false;
        this.enemyMoveTimer = 0;
        this.enemyMoveInterval = 1.0; // Seconds between moves

        this.keys = {};

        this.bossPersona = null;

        this.bindInput();
    }

    bindInput() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
    }

    async initializeCampaign() {
        // Fetch boss persona
        this.bossPersona = await this.llmService.generateBossPersona();
        this.updateBossUI(this.bossPersona.greeting);
        this.setupLevel();
    }

    updateBossUI(message) {
        const bossComms = document.getElementById('boss-comms');
        const bossName = document.getElementById('boss-name');
        const bossMsg = document.getElementById('boss-message');

        if (this.bossPersona) {
            bossName.textContent = `${this.bossPersona.name} - ${this.bossPersona.title}`;
            document.documentElement.style.setProperty('--secondary-color', this.bossPersona.theme_color || '#ff00ff');
        }

        bossMsg.textContent = message;
        bossComms.classList.remove('hidden');

        // Hide after 5 seconds
        setTimeout(() => {
            bossComms.classList.add('hidden');
        }, 5000);
    }

    setupLevel() {
        this.enemies = [];
        const rows = 3 + Math.min(this.level, 5);
        const cols = 6 + Math.min(this.level, 4);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.enemies.push({
                    x: 50 + c * 50,
                    y: 50 + r * 40,
                    width: 30,
                    height: 20,
                    alive: true
                });
            }
        }
        this.enemyMoveInterval = Math.max(0.2, 1.0 - (this.level * 0.1));
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
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= this.player.speed * dt;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += this.player.speed * dt;
        }

        // Clamp player
        this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));

        // Shooting
        if (this.player.cooldown > 0) this.player.cooldown -= dt;
        if ((this.keys['Space'] || this.keys['Enter']) && this.player.cooldown <= 0) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y,
                speed: 500,
                active: true
            });
            this.player.cooldown = 0.4;
        }

        // Bullets
        this.bullets.forEach(b => {
            b.y -= b.speed * dt;
            if (b.y < 0) b.active = false;
        });
        this.bullets = this.bullets.filter(b => b.active);

        // Enemies
        this.enemyMoveTimer += dt;
        if (this.enemyMoveTimer > this.enemyMoveInterval) {
            this.enemyMoveTimer = 0;
            this.moveEnemies();
        }

        // Collision
        this.checkCollisions();

        // Level Clear
        if (this.enemies.every(e => !e.alive)) {
            this.levelComplete();
        }
    }

    moveEnemies() {
        let hitWall = false;
        this.enemies.forEach(e => {
            if (!e.alive) return;
            if (this.enemyStepDown) {
                e.y += 20;
            } else {
                e.x += 20 * this.enemyDirection;
                if (e.x <= 0 || e.x + e.width >= this.width) {
                    hitWall = true;
                }
            }
        });

        if (this.enemyStepDown) {
            this.enemyStepDown = false;
        } else if (hitWall) {
            this.enemyDirection *= -1;
            this.enemyStepDown = true;
        }
    }

    checkCollisions() {
        this.bullets.forEach(b => {
            this.enemies.forEach(e => {
                if (!e.alive) return;
                if (b.x > e.x && b.x < e.x + e.width &&
                    b.y > e.y && b.y < e.y + e.height) {
                    e.alive = false;
                    b.active = false;
                    this.score += 100;
                    document.getElementById('score').textContent = this.score;
                }
            });
        });
    }

    async levelComplete() {
        this.level++;
        document.getElementById('level').textContent = this.level;

        // Pause for a moment
        this.isRunning = false;

        // Get taunt/praise
        const taunt = await this.llmService.generateTaunt(this.score, "cleared the wave");
        this.updateBossUI(taunt || "Reinforcements incoming!");

        setTimeout(() => {
            this.setupLevel();
            this.start();
        }, 3000);
    }

    draw() {
        // Clear
        this.ctx.fillStyle = 'rgba(5, 5, 16, 0.3)'; // Trail effect
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Player
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Bullets
        this.ctx.fillStyle = '#fff';
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x - 2, b.y, 4, 10);
        });

        // Enemies
        this.ctx.fillStyle = this.bossPersona ? this.bossPersona.theme_color : '#ff00ff';
        this.enemies.forEach(e => {
            if (e.alive) {
                this.ctx.fillRect(e.x, e.y, e.width, e.height);
            }
        });
    }
}
