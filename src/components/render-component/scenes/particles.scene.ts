import type { Scene } from '../../../lib/scene';
import type { Application, Texture } from 'pixi.js';
import { Assets, Container, Sprite } from 'pixi.js';

export class ParticlesScene implements Scene {
    name = 'Particles';
    started = false;

    private app!: Application;
    private particleContainer!: Container;
    private particles: Sprite[] = [];
    private particlePool: Sprite[] = [];
    private maxParticles = 10;
    private fireTexture!: Texture;

    start(app: Application) {
        this.app = app;

        this.particleContainer = new Container();
        this.particleContainer.blendMode = 'add';
        this.app.stage.addChild(this.particleContainer);

        (async () => {
            this.fireTexture = await Assets.load<Texture>('/Fire2.png');
            this.initParticlePool(); // Initialize particle pool
            this.started = true;
        })();
    }

    tick(deltaMS: number, fps: number) {
        if (!this.started) return;

        const delta = deltaMS * 0.001;

        this.addParticles();

        this.updateParticles(delta);

        this.recycleParticles();
    }

    destroy() {
        this.app.stage.removeChild(this.particleContainer);
        this.particleContainer.removeChildren();
        this.particles = [];
    }

    private initParticlePool() {
        // Create the particle pool
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = new Sprite(this.fireTexture);

            particle.anchor.set(0.5);
            particle.alpha = 0.5;
            particle.scale.set(1);

            // Custom properties for movement and behavior
            (particle as any).velocityY = 0;
            (particle as any).velocityX = 0;
            (particle as any).accelerationY = -80; // Upward acceleration
            (particle as any).lifetime = Math.random() * 0.5 + 0.5;
            (particle as any).age = 0;
            (particle as any).initialScale = 0.12 + Math.random() * 0.02;
            (particle as any).rotationSpeed = (Math.random() - 0.5) * 4;

            this.particlePool.push(particle);
        }
    }

    private addParticles() {
        const particlesToAdd = 1;

        for (let i = 0; i < particlesToAdd; i++) {
            if (this.particlePool.length > 0 && this.particles.length < this.maxParticles) {
                const particle = this.particlePool.pop();
                if (particle) {
                    // Reset particle properties before reusing
                    particle.x = this.app.renderer.width / 2 + (Math.random() - 0.5) * 20;
                    particle.y = this.app.renderer.height / 2 + (Math.random() - 0.5) * 10;
                    particle.scale.set((particle as any).initialScale);
                    particle.rotation = Math.random() * Math.PI * 2;
                    (particle as any).age = 0;
                    (particle as any).velocityY = -Math.random() * 50 - 50;
                    (particle as any).velocityX = (Math.random() - 0.5) * 15;
                    (particle as any).lifetime = 0.2 + Math.random() * 0.3;

                    this.particles.push(particle);
                    this.particleContainer.addChild(particle); // Add the particle to the container
                }
            }
        }
    }

    private updateParticles(delta: number) {
        for (const particle of this.particles) {
            (particle as any).age += delta;

            const lifeRatio = (particle as any).age / (particle as any).lifetime;
            const easedLifeRatio = lifeRatio * lifeRatio;  // Quadratic easing for smooth transitions

            // Update velocity and position
            (particle as any).velocityY += (particle as any).accelerationY * delta;
            particle.x += (particle as any).velocityX * delta;
            particle.y += (particle as any).velocityY * delta;

            particle.rotation += (particle as any).rotationSpeed * delta;

            // Update scale (shrinks over time)
            const scale = (particle as any).initialScale * (1 - easedLifeRatio * 0.7);
            particle.scale.set(scale);

            // Alpha transition (0 -> 0.5 -> 1)
            if (lifeRatio < 0.5)
                particle.alpha = easedLifeRatio * 2 * 0.5;
            else {
                const secondHalfLifeRatio = (lifeRatio - 0.5) * 2;
                particle.alpha = 0.5 + secondHalfLifeRatio * 0.5;
            }

            // Tint transition (orange -> red)
            const startColor = 0xFFD580; // Light Orange
            const endColor = 0xFF6666;   // Light Red
            particle.tint = this.lerpColor(startColor, endColor, lifeRatio);
        }
    }

    // Linear interpolation for color with clamping
    private lerpColor(startColor: number, endColor: number, ratio: number): number {
        const interpolate = (start: number, end: number) =>
            Math.max(0, Math.min(255, Math.round(start + (end - start) * ratio))); // Ensure color stays between 0 and 255

        const startR = (startColor >> 16) & 0xff;
        const startG = (startColor >> 8) & 0xff;
        const startB = startColor & 0xff;

        const endR = (endColor >> 16) & 0xff;
        const endG = (endColor >> 8) & 0xff;
        const endB = endColor & 0xff;

        const r = interpolate(startR, endR);
        const g = interpolate(startG, endG);
        const b = interpolate(startB, endB);

        return (r << 16) | (g << 8) | b;
    }

    private recycleParticles() {
        // Recycle particles that have exceeded their lifetime
        this.particles = this.particles.filter((particle) => {
            if ((particle as any).age >= (particle as any).lifetime) {
                this.particleContainer.removeChild(particle);  // Remove particle from container
                this.particlePool.push(particle);  // Re-add to pool for reuse
                return false;
            }
            return true; // Keep alive if still within lifetime
        });
    }
}

