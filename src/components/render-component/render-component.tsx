import { component$, useOnDocument, $ } from '@builder.io/qwik';
import { Application } from 'pixi.js';

export const RenderComponent = component$(() => {
    useOnDocument('qinit', $(() => {
        const app = new Application();
        app.init({
            width: 640,
            height: 480,
        }).then(() =>
            document.body.appendChild(app.canvas)
        );

        return () => {
            app.destroy(true, { children: true });
        };
    }));

    return (<div></div>);
});
