import type { Scene } from '../../../lib/scene';
import { Container, Sprite, Text, Assets } from 'pixi.js';
import type { Application } from 'pixi.js';
import type { Texture } from 'pixi.js';

export class TextImagesScene implements Scene {
    name = 'Text + Images';

    private app!: Application;
    private displayContainer!: Container;
    private lastUpdateTime = 0;
    private updateInterval = 2000;
    private textures: Texture[] = [];
    private sampleTexts = ['Hello', 'World', 'PixiJS', 'Text', 'Image', 'Emoji', 'Icon', 'Price', '$9.99', 'Sample'];
    private configurations = [
        ['image', 'text', 'image'],
        ['image', 'image', 'image'],
        ['image', 'image', 'text'],
        ['text', 'image', 'text'],
        ['text', 'image', 'image'],
        ['image', 'text', 'text'],
        ['text', 'text', 'image'],
        ['image', 'text'],
        ['text', 'image'],
        ['text', 'text', 'text'],
    ];

    async start(app: Application) {
        this.app = app;

        // container to hold the mixed text and images
        this.displayContainer = new Container();
        this.app.stage.addChild(this.displayContainer);

        const texturePaths = ['/emoji1.png', '/emoji2.png', '/icon1.png', '/icon2.png', '/money.png'];
        const texturePromises = texturePaths.map((path) => Assets.load<Texture>(path));
        this.textures = await Promise.all(texturePromises);

        this.lastUpdateTime = performance.now();
    }

    tick(deltaMS: number, fps: number) {
        const currentTime = performance.now();

        if (currentTime - this.lastUpdateTime >= this.updateInterval) {
            this.lastUpdateTime = currentTime;

            this.displayContainer.removeChildren();

            const config = this.configurations[Math.floor(Math.random() * this.configurations.length)];

            let totalWidth = 0;
            const elements: Container[] = [];

            for (const item of config) {
                if (item === 'text') {
                    const text = this.sampleTexts[Math.floor(Math.random() * this.sampleTexts.length)];
                    const fontSize = Math.floor(Math.random() * 24) + 16;

                    const textElement = new Text({
                        text, style: {
                            fontSize,
                            fill: 0xffffff,
                            fontWeight: 'bold',
                        }
                    });

                    textElement.anchor.set(0, 0.5);
                    elements.push(textElement);
                    totalWidth += textElement.width;
                } else if (item === 'image') {
                    const texture = this.textures[Math.floor(Math.random() * this.textures.length)];
                    const imageElement = new Sprite(texture);

                    const baseImageSize = 50;
                    const proportionalScale = this.calculateImageScale(elements, baseImageSize);
                    imageElement.width = baseImageSize * proportionalScale;
                    imageElement.height = baseImageSize * proportionalScale;

                    imageElement.anchor.set(0, 0.5);
                    elements.push(imageElement);
                    totalWidth += imageElement.width;
                }
            }

            // Position elements horizontally centered
            let currentX = (this.app.renderer.width - totalWidth) / 2;
            const centerY = this.app.renderer.height / 2;

            for (const element of elements) {
                element.position.set(currentX, centerY);
                this.displayContainer.addChild(element);
                currentX += element.width;
            }
        }
    }

    // Helper function to calculate image scale relative to text size
    private calculateImageScale(elements: Container[], baseImageSize: number): number {
        let maxFontSize = 24; // Default max font size
        for (const element of elements) {
            if (element instanceof Text) {
                const fontSize = element.style.fontSize as number;
                maxFontSize = Math.max(maxFontSize, fontSize);
            }
        }

        // Scale the image relative to the max font size found in the text elements
        return maxFontSize / baseImageSize;
    }

    destroy() {
        this.app.stage.removeChild(this.displayContainer);
        this.displayContainer.destroy({ children: true });
        this.textures = [];
    }
}
