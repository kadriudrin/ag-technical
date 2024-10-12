import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { RenderComponent } from "~/components/render-component/render-component";

export default component$(() => {
  return (
    <>
      <RenderComponent/>
    </>
  );
});

export const head: DocumentHead = {
  title: "AG Technical",
  meta: [
    {
      name: "description",
      content: "site description",
    },
  ],
};
