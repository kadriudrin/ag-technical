import type { Scene } from '../../../lib/scene';
import type { Application } from 'pixi.js';

export class CardStackScene implements Scene {
  name = 'Card Stack';

  start(app: Application) {
    console.log('Card Stack Scene started');
  }

  tick() {
    console.log('Card Stack Scene ticking');
  }

  destroy() {
    console.log('Card Stack Scene destroyed');
  }
}
