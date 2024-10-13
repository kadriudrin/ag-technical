import { Application } from "pixi.js";

export interface Scene {
    name: string;
    started: boolean;
    start(app: Application): void;
    tick(delta: number, fps: number): void;
    destroy(): void;
}
