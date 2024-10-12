import type { Scene } from '../../../lib/scene';
import type { Application } from 'pixi.js';

export class ParticlesScene implements Scene {
  name = 'Particles';

  start(app: Application) {
    console.log('Particles Scene started');
  }

  tick() {
    console.log('Particles Scene ticking');
  }

  destroy() {
    console.log('Particles Scene destroyed');
  }
}
