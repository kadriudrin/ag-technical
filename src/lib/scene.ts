import { Application } from "pixi.js";

export interface Scene {
    name: string;
    start(app: Application): void;
    tick(): void;
    destroy(): void;
}
