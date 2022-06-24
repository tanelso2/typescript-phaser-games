import { Button, createButton } from "./button";
import { baseConfig, KEYS } from "./config";
import { properModulo } from "./util";

const key = KEYS.snake;
export class SnakeScene extends Phaser.Scene {
    gameState: GameState;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    tiles: GraphicalTile[][];
    lastFrame: number;
    stepSize: number;
    paused: boolean;
    restartButton: Button;
    deathText: Phaser.GameObjects.Text;
    exitButton: Button;

    static key = key;
    get key(): string {
        return key;
    };

    get running(): boolean {
        return this.gameState.running;
    }

    constructor() {
        super({
            ...baseConfig,
            key: key,
        });
    }

    preload() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create() {
        this.gameState = new GameState(64, 64, []);
        this.tiles = [];
        this.lastFrame = 0;
        this.stepSize = 60;
        this.paused = false;
        this.events.on('pause', () => {
            this.scene.pause();
            this.paused = true;
        });
        this.deathText = this.add.text(600, 150, "You ded");
        this.deathText.setVisible(false);


        this.restartButton = createButton(this, 0xFF9900, "Restart", 600, 100);
        this.restartButton.rect.on('pointerdown', () => {
            const {width, height, obstacles} = this.gameState;
            this.gameState = new GameState(width, height, obstacles);
        });

        this.exitButton = createButton(this, 0xFF0000, "Exit", 600, 50);
        this.exitButton.rect.on('pointerdown', () => {
            this.scene.restart();
            this.scene.switch(KEYS.menu);
        });

        const woffset = 20;
        const hoffset = 20;
        for (let i = 0; i < this.gameState.width; i++) {
            const col = [];
            for (let j = 0; j < this.gameState.height; j++) {
                const newRect = this.add.rectangle(i * 8 + woffset, j * 8 + hoffset, 6, 6, 0xFF0000);
                col.push({
                    x: i,
                    y: j,
                    rect: newRect
                });
            }
            this.tiles.push(col);
        }
    }


    setTileColor(x: number, y: number, color: number) {
        const tile = this.tiles[x][y];
        tile.rect.fillColor = color;
    }

    updateTiles() {
        const snake = this.gameState.snake;
        this.tiles.forEach(col => col.forEach(t => {
            t.rect.fillColor = DEFAULT_COLOR;
        }));
        {
            const {x,y} = snake.head;
            this.setTileColor(x, y, HEAD_COLOR);
        }
        snake.tail.forEach(({x, y}) => {
            this.setTileColor(x, y, TAIL_COLOR);
        });
        this.gameState.obstacles.forEach(({x,y}) => {
            this.setTileColor(x, y, OBSTACLE_COLOR);
        }) ;
        {
            const {x, y} = this.gameState.pellet;
            this.setTileColor(x, y, PELLET_COLOR);
        }
    }

    update(time: number) {
        if (this.running && 
            !this.paused &&
            time - this.lastFrame > this.stepSize) {
            this.updateTiles();
            const prevDir = this.gameState.prevDir;
            let dir = prevDir;
            if (this.cursors.left.isDown && prevDir != "right") {
                dir = "left";
            } else if (this.cursors.right.isDown && prevDir != "left") {
                dir = "right";
            } else if (this.cursors.up.isDown && prevDir != "down") {
                dir = "up";
            } else if (this.cursors.down.isDown && prevDir != "up") {
                dir = "down";
            }
            const success = this.gameState.moveSnake(dir);
            if (!success) {
                this.gameState.running = false;
            }
            this.lastFrame = time;
        }
        this.deathText.setVisible(!this.running);
    }
}

const HEAD_COLOR = 0x00FF00;
const TAIL_COLOR = 0x009911;
const PELLET_COLOR = 0xDDDD00;
const OBSTACLE_COLOR = 0x555555;
const DEFAULT_COLOR = 0x000000;

interface GraphicalTile extends Tile {
    rect: Phaser.GameObjects.Rectangle;
}

type Direction = "up" | "down" | "left" | "right";
type Tile = {x: number, y: number};

function dxdyOfDir(dir: Direction): {dx: number, dy: number} {
    switch (dir) {
        case "up":
            return {dx: 0, dy: -1};
        case "down":
            return {dx: 0, dy: 1};
        case "left":
            return {dx: -1, dy: 0};
        case "right":
            return {dx: 1, dy: 0};
    }
}

function isOn(t1: Tile, t2: Tile): boolean {
    const x1 = t1.x;
    const x2 = t2.x;
    const y1 = t1.y;
    const y2 = t2.y;
    return x1 == x2 && y1 == y2;
}

function isOnAny(t: Tile, ts: Tile[]): boolean {
    return ts.some(x => isOn(t, x));
}

export class GameState {
    snake: Snake;
    pellet: Tile;
    obstacles: Tile[];
    width: number;
    height: number;
    prevDir: Direction;
    running: boolean;
    score: number;

    constructor(width: number, height: number, obstacles: Tile[]) {
        this.width = width;
        this.height = height;
        this.obstacles = obstacles;
        this.snake = new Snake();
        this.generateNewPellet();
        this.running = true;
        this.prevDir = "down";
    }

    checkCollisions(): boolean {
        if (isOn(this.snake.head, this.pellet)) {
            this.snake.grow();
            this.generateNewPellet();
        } else if (isOnAny(this.snake.head, this.snake.tail)) {
            return false;
        } else if (isOnAny(this.snake.head, this.obstacles)) {
            return false;
        }
        return true;
    }

    generateNewPellet() {
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);
        const newTile = {x, y};
        if (isOnAny(newTile, this.snake.body) || isOnAny(newTile, this.obstacles)) {
            // Keep trying
            return this.generateNewPellet();
        }
        this.pellet = newTile;
    }

    moveSnake(dir: Direction): boolean {
        this.snake.move(dir, this.width, this.height);
        this.prevDir = dir;
        return this.checkCollisions();
    }
}

const STARTING_LENGTH = 20;

export class Snake {
    body: Tile[];
    length: number;
    
    constructor() {
        this.body = [{x: 0, y: 0}];
        this.length = STARTING_LENGTH;
    }

    get head() : Tile {
        return this.body[0];
    }

    get tail(): Tile[] {
        return this.body.slice(1);
    }

    grow() {
        this.length = this.length + 1;
    }

    move(dir: Direction, width: number, height: number) {
        const {dx, dy} = dxdyOfDir(dir);
        const nextX = properModulo(this.head.x + dx, width);
        const nextY = properModulo(this.head.y + dy, height);
        const nextSpace: Tile = {
            x: nextX,
            y: nextY
        };
        let nextBody = [nextSpace].concat(this.body);
        // slice body to proper length
        nextBody = nextBody.slice(0, this.length);
        this.body = nextBody;
    }
}