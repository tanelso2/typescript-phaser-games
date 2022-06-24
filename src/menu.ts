import { Button, createButton } from "./button";
import { baseConfig, KEYS } from "./config";

const key = KEYS.menu;
export class MenuScene extends Phaser.Scene {
    snakeButton: Button;

    constructor() {
        super({
            ...baseConfig,
            key: key,
        });
    }

    static key = key;
    get key(): string {
      return key;
    }

    create() {
        this.snakeButton = createButton(this, 0x00DD00, "Sssnake", 100, 100);
        this.snakeButton.rect.on("pointerdown", () => {
            this.scene.switch(KEYS.snake);
        });
    }
}