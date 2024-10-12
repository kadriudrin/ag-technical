import type { Scene } from '../../../lib/scene';
import type { Application } from 'pixi.js';

export class TextImagesScene implements Scene {
  name = 'Text + Images';

  start(app: Application) {
    console.log('Text + Images Scene started');
  }

  tick() {
    console.log('Text + Images Scene ticking');
  }

  destroy() {
    console.log('Text + Images Scene destroyed');
  }
}
