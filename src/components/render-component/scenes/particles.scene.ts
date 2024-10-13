import type { Scene } from '../../../lib/scene';
import { Container, Assets } from 'pixi.js';
import { Emitter } from '@barvynkoa/particle-emitter';
import type { Texture, Application } from 'pixi.js';

export class ParticlesScene implements Scene {
    name = 'Particles';
    started = false;

    private app!: Application;
    private particleContainer!: Container;
    private emitter!: Emitter;

    start(app: Application) {
        this.app = app;

        this.particleContainer = new Container();
        this.app.stage.addChild(this.particleContainer); // Add the particle container to the stage

        (async () => {
            const fireTexture = await Assets.load<Texture>('/Fire.png'); // Ensure the texture is loaded correctly

            const emitterConfig = {
                lifetime: {
                    min: 0.5,
                    max: 1.5
                },
                frequency: 0.05,
                emitterLifetime: -1,
                maxParticles: 10,
                pos: {
                    x: this.app.renderer.width / 2,
                    y: this.app.renderer.height - 50,
                },
                behaviors: [
                    {
                        type: 'alpha',
                        config: {
                            alpha: {
                                list: [
                                    { time: 0, value: 1 },
                                    { time: 1, value: 0 }
                                ],
                            },
                        }
                    },
                    {
                        type: 'scale',
                        config: {
                            scale: {
                                list: [
                                    { time: 0, value: 0.75 },
                                    { time: 1, value: 0.3 }
                                ],
                            },
                        }
                    },
                    {
                        type: 'color',
                        config: {
                            color: {
                                list: [
                                    { time: 0, value: 'ff9933' },
                                    { time: 1, value: 'ff3300' }
                                ],
                            },
                        }
                    },
                    {
                        type: 'moveSpeed',
                        config: {
                            speed: {
                                list: [
                                    { time: 0, value: 200 },
                                    { time: 1, value: 100 }
                                ],
                            },
                        }
                    },
                    {
                        type: 'rotationStatic',
                        config: {
                            min: 0,
                            max: 360
                        }
                    },
                    {
                        type: 'textureSingle',
                        config: {
                            texture: fireTexture
                        }
                    },
                    {
                        type: 'spawnShape',
                        config: {
                            type: 'torus',
                            data: {
                                x: 0,
                                y: 0,
                                radius: 20,
                                innerRadius: 10,
                                affectRotation: false
                            }
                        }
                    }
                ]
            };

            this.emitter = new Emitter(this.particleContainer, emitterConfig);

            this.emitter.updateOwnerPos(this.app.renderer.width / 2, this.app.renderer.height - 50);

            this.emitter.emit = true; // Start emitting

            this.started = true;

            console.log('Emitter started');
        })();
    }

    tick(deltaMS: number, fps: number) {
        const delta = deltaMS * 0.001; // Convert deltaMS to seconds
        this.emitter.update(delta); // Update the emitter using the scaled delta time
    }

    destroy() {
        // Clean up the emitter and particle container
        this.emitter.emit = false;
        this.emitter.cleanup();
        this.emitter.destroy();
        this.app.stage.removeChild(this.particleContainer);
        this.particleContainer.destroy({ children: true });
    }
}

