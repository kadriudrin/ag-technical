import { component$, $, noSerialize, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { Application, Ticker } from 'pixi.js';
import type { Scene } from '../../lib/scene';
import { CardStackScene } from './scenes/card-stack.scene';
import { TextImagesScene } from './scenes/text-images.scene';
import { ParticlesScene } from './scenes/particles.scene';
import styles from './render-component.module.css';

export const RenderComponent = component$(() => {
    const store = useStore({
        app: noSerialize<Application | undefined>(undefined),
        currentScene: noSerialize<Scene | undefined>(undefined),
    });

    const sceneNames = ['CardStack', 'TextImages', 'Particles'];

    // Initialize the PixiJS application once the document is ready
    useVisibleTask$(() => {
        const pixiApp = new Application()
        pixiApp.init({
            width: 640,
            height: 480,
            backgroundColor: '#001f3f',
            antialias: false,
            resolution: window.devicePixelRatio / 1.5,
        }).then(() => {
            // Append the PixiJS canvas to the container
            document.getElementById('pixi-canvas-container')?.appendChild(pixiApp.canvas);

            pixiApp.canvas.style.width = '1280px';
            pixiApp.canvas.style.height = '960px';

            Ticker.shared.add(({ deltaMS, FPS }) => {
                store.currentScene?.tick(deltaMS, FPS);
            });

            store.app = noSerialize(pixiApp); // Assign the PixiJS app instance to the store
        })

        return () => {
            // Clean up the ticker and application on destroy
            pixiApp.ticker.stop();
            pixiApp.destroy(true, { children: true });
        };
    });

    // Switch scene by passing the scene name
    const switchScene = $((name: string) => {
        if (store.currentScene) {
            store.currentScene.destroy(); // Destroy the current scene
        }

        let newScene: Scene | undefined;
        switch (name) {
            case 'CardStack':
                newScene = new CardStackScene();
                break;
            case 'TextImages':
                newScene = new TextImagesScene();
                break;
            case 'Particles':
                newScene = new ParticlesScene();
                break;
            default:
                return;
        }

        store.currentScene = noSerialize(newScene);
        if (store.app && newScene) {
            newScene.start(store.app);
        }
    });

    return (
        <div class={styles.container}>
            <div class={styles['button-container']}>
                {sceneNames.map((name, index) => (
                    <button key={index} onClick$={() => switchScene(name)}>
                        {name}
                    </button>
                ))}
            </div>

            <div id="pixi-canvas-container" class={styles['canvas-container']}></div>
        </div>
    );
});
