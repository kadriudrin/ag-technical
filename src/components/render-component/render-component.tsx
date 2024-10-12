import { component$, useOnDocument, $, useVisibleTask$, noSerialize, useStore } from '@builder.io/qwik';
import { Application } from 'pixi.js';
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

    // Define scene names
    const sceneNames = ['CardStack', 'TextImages', 'Particles'];

    // Initialize the PixiJS application once the document is ready
    useOnDocument('qinit', $(() => {
        const pixiApp = new Application();
        pixiApp.init({
            width: 640,
            height: 480,
            backgroundAlpha: 0,
        }).then(() => {
            document.getElementById('pixi-canvas-container')?.appendChild(pixiApp.canvas);
            store.app = noSerialize(pixiApp);  // Assign the PixiJS app instance to the store
        });

        return () => {
            store.app?.destroy(true, { children: true });
        };
    }));

    // Switch scene by passing the scene name
    const switchScene = $((name: string) => {
        if (store.currentScene) {
            store.currentScene.destroy();  // Destroy the current scene
        }

        let newScene: Scene | undefined;
        switch(name) {
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

        store.currentScene = noSerialize(newScene);  // Set the new current scene in the store
        if (store.app && newScene) {
            newScene.start(store.app);  // Start the new scene
        }
    });

    // Manage animation frame ticking for the current scene
    useVisibleTask$(() => {
        const ticker = () => {
            if (store.currentScene) {
                store.currentScene.tick(); // Call the tick function for the active scene
            }
            requestAnimationFrame(ticker);
        };
        ticker(); // Start the animation loop
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

