import * as Phaser from 'phaser';

type Rectangle = Phaser.GameObjects.Rectangle;
type Text = Phaser.GameObjects.Text;

export type Button = {
    rect: Rectangle;
    text: Text;
};

export function createButton(scene: Phaser.Scene, color: number, content: string, x: number, y: number): Button {
    const width = 100;
    const height = 30;
    const rect = scene.add.rectangle(x + (width * 0.35), y + (height * 0.35), width, height, color);
    rect.setInteractive();
    const text = scene.add.text(x, y, content);
    return {rect, text};
}