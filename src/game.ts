import 'phaser';
import { baseConfig } from './config';
import { MenuScene } from './menu';
import { SnakeScene } from './snake';

const config: Phaser.Types.Core.GameConfig = {
    ...baseConfig,
    scene: [MenuScene, SnakeScene]
};

const game = new Phaser.Game(config);
