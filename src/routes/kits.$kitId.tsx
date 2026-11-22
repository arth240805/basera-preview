import { createFileRoute, notFound } from "@tanstack/react-router";

import KitPage from "@/components/dropnest/KitPage";
import { KITS, formatINR, isKitId } from "@/lib/dropnest";

export const Route = createFileRoute("/kits/$kitId")({
  loader: ({ params }) => {
    if (!isKitId(params.kitId)) throw notFound();
    return { kitId: params.kitId };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Kit unavailable — Dropnest" }, { name: "robots", content: "noindex" }] };
    const kit = KITS[loaderData.kitId];
    const title = `${kit.name} — ${kit.items.length} move-in essentials for ${formatINR(kit.price)} | Dropnest`;
    const description = `${kit.tagline} See every item in the Dropnest ${kit.name}, add extras, and get free hostel delivery with COD.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: KitRoute,
});

function KitRoute() {
  const { kitId } = Route.useLoaderData();
  return <KitPage kitId={kitId} />;
}
