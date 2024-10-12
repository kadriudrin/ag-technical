import type { Scene } from '../../../lib/scene';
import { Sprite, Container, Assets, Point, BitmapText } from 'pixi.js';
import type { Application, Texture } from 'pixi.js';

export class CardStackScene implements Scene {
    name = 'Card Stack';

    private app!: Application;
    private cardContainer!: Container;
    private cards: {
        container: Container;
        initialPosition: Point;
        targetPosition: Point;
        elapsed: number;
    }[] = [];
    private cardMoveInterval = 1000;
    private cardMoveDuration = 2000;
    private lastMoveTime = 0;
    private leftCountText!: BitmapText;
    private rightCountText!: BitmapText;
    private fpsText!: BitmapText;

    private totalCards = 144;
    private nextIndex = this.totalCards - 1;
    private activeFrom = this.totalCards - 1;

    private leftCount = 0;
    private rightCount = 0;

    private fpsAccumulator = 0;
    private fpsCounter = 0;
    private fpsUpdateTime = 0;

    private cardTexture!: Texture;

    start(app: Application) {
        this.app = app;

        // Create a container for all cards
        this.cardContainer = new Container({ isRenderGroup: true });
        app.stage.addChild(this.cardContainer);

        // Enable z-index sorting
        this.cardContainer.sortableChildren = true;
        this.cardContainer.interactive = false;
        this.cardContainer.interactiveChildren = false;

        (async () => {
            // Load card texture
            this.cardTexture = await Assets.load('/card.png');

            // Create cards and add them to the card container
            for (let i = 0; i < this.totalCards; i++) {
                const cardContainer = new Container({ isRenderGroup: true });
                cardContainer.width = 100;
                cardContainer.height = 150;
                cardContainer.pivot.set(50, 75); // Center the container

                // Create the card sprite
                const card = new Sprite(this.cardTexture);
                card.anchor.set(0.5);

                // Create the card number text
                const cardNumber = i + 1;
                const textColor = cardNumber % 2 === 0 ? 0xff0000 : 0x000000; // Alternate between red and black

                const numberText = new BitmapText({
                    text: `${cardNumber}`, style: {
                        fontSize: 24,
                        fill: textColor,
                        fontWeight: 'bold',
                    },
                });
                numberText.anchor.set(0.5);
                numberText.position.set(0, 0);

                // Add the card and text to the card container
                cardContainer.addChild(card);
                cardContainer.addChild(numberText);

                // Position the card in the left stack
                cardContainer.x = 175;
                cardContainer.y = this.app.renderer.height - 75 - i * 1; // Slight offset to make cards visible underneath
                cardContainer.zIndex = i;

                this.cards.push({
                    container: cardContainer,
                    initialPosition: new Point(cardContainer.x, cardContainer.y),
                    targetPosition: new Point(this.app.renderer.width - 75, this.app.renderer.height - 75 - ((this.totalCards - i) * 1)),
                    elapsed: 0,
                });

                this.cardContainer.addChild(cardContainer);
            }
        })();

        this.leftCount = this.totalCards;
        this.rightCount = 0;

        const style = { fill: 'white', fontSize: 16 };

        this.leftCountText = new BitmapText({ text: `Left Stack: ${this.leftCount}`, style });
        this.leftCountText.x = 25;
        this.leftCountText.y = 10;
        app.stage.addChild(this.leftCountText);

        this.rightCountText = new BitmapText({ text: `Right Stack: ${this.rightCount}`, style });
        this.rightCountText.x = this.app.renderer.width - 125;
        this.rightCountText.y = 10;
        app.stage.addChild(this.rightCountText);

        this.fpsText = new BitmapText({ text: `FPS: 0`, style });
        this.fpsText.x = app.renderer.width / 2;
        this.fpsText.y = 10;
        app.stage.addChild(this.fpsText);

        // Initialize the last move time
        this.lastMoveTime = performance.now();
        this.fpsUpdateTime = performance.now();
    }

    tick(deltaMS: number, fps: number) {
        const currentTime = performance.now();

        // Move a card every second
        if (currentTime - this.lastMoveTime >= this.cardMoveInterval && this.leftCount > 0) {
            this.lastMoveTime = currentTime;

            const card = this.cards[this.nextIndex--];
            card.elapsed = 0;

            // Set target position for the right stack
            card.targetPosition.set(this.app.renderer.width - 75, this.app.renderer.height - 75 - ((this.totalCards - this.leftCount) * 1));

            // Bring the card to the top
            card.container.zIndex = 2 * this.totalCards - this.leftCount;

            this.leftCount--;
            this.leftCountText.text = `Left Stack: ${this.leftCount}`;
        }

        for (let i = this.activeFrom; i > this.nextIndex; i--) {
            const card = this.cards[i];
            card.elapsed += deltaMS;

            const t = Math.min(card.elapsed / this.cardMoveDuration, 1);
            const easedT = this.easeInOutQuad(t);

            card.container.x = card.initialPosition.x + easedT * (card.targetPosition.x - card.initialPosition.x);
            card.container.y = card.initialPosition.y + easedT * (card.targetPosition.y - card.initialPosition.y);

            // Movement finished
            if (t > 1) {
                card.initialPosition = card.targetPosition;

                this.activeFrom--;
                this.rightCount++;
                this.rightCountText.text = `Right Stack: ${this.rightCount}`;
            }
        }

        // FPS calculation
        this.fpsAccumulator += fps;
        this.fpsCounter++;
        if (currentTime - this.fpsUpdateTime >= 500) {
            const avgFPS = Math.round(this.fpsAccumulator / this.fpsCounter);
            this.fpsText.text = `FPS: ${avgFPS.toPrecision(3)}`;
            this.fpsAccumulator = 0;
            this.fpsCounter = 0;
            this.fpsUpdateTime = currentTime;
        }
    }

    destroy() {
        // Clean up all resources
        this.app.stage.removeChild(this.cardContainer);
        this.cardContainer.destroy({ children: true });

        this.app.stage.removeChild(this.leftCountText);
        this.app.stage.removeChild(this.rightCountText);
        this.app.stage.removeChild(this.fpsText);

        this.leftCountText.destroy();
        this.rightCountText.destroy();
        this.fpsText.destroy();

        this.cards = [];
    }

    // Easing function for smooth animation
    private easeInOutQuad(t: number): number {
        return t
        //return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
}
