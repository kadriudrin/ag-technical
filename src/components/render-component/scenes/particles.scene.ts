import type { Scene } from '../../../lib/scene';
import type { Application, Texture } from 'pixi.js';
import { Assets, ParticleContainer, Particle } from 'pixi.js';

export class ParticlesScene implements Scene {
    name = 'Particles';
    started = false;

    private app!: Application;
    private particleContainer!: ParticleContainer;
    private particles: Particle[] = [];
    private particlePool: Particle[] = [];
    private maxParticles = 10;
    private fireTexture!: Texture;

    start(app: Application) {
        this.app = app;

        this.particleContainer = new ParticleContainer({
            dynamicProperties: {
                _alpha: true,
                alpha: true,
                position: true,
                scale: true,
                rotation: true,
            }
        });

        this.particleContainer.blendMode = 'add';

        this.app.stage.addChild(this.particleContainer);

        (async () => {
            this.fireTexture = await Assets.load<Texture>('/Fire2.png');

            this.initParticlePool();

            this.started = true;
        })()
    }

    tick(deltaMS: number, fps: number) {
        if (!this.started) return;

        const delta = deltaMS * 0.001;

        // Add new particles continuously
        this.addParticles(delta);

        // Update existing particles
        this.updateParticles(delta);

        // Recycle dead particles
        this.recycleParticles();

        this.particleContainer.update()
    }

    destroy() {
        this.app.stage.removeChild(this.particleContainer);
        this.particleContainer.removeChildren();
        this.particles = [];
    }

    private initParticlePool() {
        // Create the particle pool
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = new Particle({
                texture: this.fireTexture,
                x: this.app.renderer.width / 2,
                y: this.app.renderer.height - 100,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                anchorX: 0.5,
                anchorY: 0.5,
                alpha: 0.5,
            });

            (particle as any).velocityY = 0;
            (particle as any).velocityX = 0;
            (particle as any).accelerationY = -80;
            (particle as any).lifetime = Math.random() * 0.2;
            (particle as any).age = 0;
            (particle as any).initialScale = 0.05 + Math.random() * 0.05;
            (particle as any).rotationSpeed = (Math.random() - 0.5) * 2;

            this.particlePool.push(particle);
        }
    }

    private addParticles(delta: number) {
        const particlesToAdd = 1;

        for (let i = 0; i < particlesToAdd; i++) {
            if (this.particlePool.length > 0 && this.particles.length < this.maxParticles) {
                const particle = this.particlePool.pop();
                if (particle) {
                    particle.x = this.app.renderer.width / 2 + (Math.random() - 0.5) * 20;
                    particle.y = this.app.renderer.height - 50 + (Math.random() - 0.5) * 10;
                    particle.scaleX = (particle as any).initialScale;
                    particle.scaleY = (particle as any).initialScale;
                    particle.rotation = Math.random() * Math.PI * 2;
                    (particle as any).age = 0;
                    (particle as any).velocityY = -Math.random() * 40 - 50;
                    (particle as any).velocityX = (Math.random() - 0.5) * 15;
                    (particle as any).lifetime = 0.2 + Math.random() * 0.3;

                    this.particles.push(particle);
                    this.particleContainer.addParticle(particle);
                }
            }
        }
    }

    private updateParticles(delta: number) {
        for (const particle of this.particles) {
            (particle as any).age += delta;

            const lifeRatio = (particle as any).age / (particle as any).lifetime;
            //const easedLifeRatio = lifeRatio * lifeRatio; // Quadratic easing

            (particle as any).velocityY += (particle as any).accelerationY * delta;

            particle.x += (particle as any).velocityX * delta;
            particle.y += (particle as any).velocityY * delta;

            particle.rotation += (particle as any).rotationSpeed * delta;

            const scale = (particle as any).initialScale * (1 - lifeRatio);
            particle.scaleX = scale
            particle.scaleY = scale

            particle.alpha = 1 - lifeRatio;
        }
    }

    private recycleParticles() {
        // Remove and recycle particles that have exceeded their lifetime
        this.particles = this.particles.filter((particle) => {
            if ((particle as any).age >= (particle as any).lifetime) {
                this.particleContainer.removeParticle(particle);
                this.particlePool.push(particle); // Return to pool for reuse
                return false;
            }
            return true; // Keep alive if still within lifetime
        });
    }
}
