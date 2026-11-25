<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Dropnest catalogue, pricing, delivery timing and quiz logic live in `src/lib/dropnest.ts` as pure functions; UI reads from it. Why: one source of truth, covered by `src/test/dropnest.test.ts`.
- Cart, city, view and dialog state live in a client-side context (`src/components/dropnest/store.tsx`) mounted in `__root`; the home page (`DropnestApp.tsx`) and kit pages (`/kits/$kitId`, `KitPage.tsx`) share it and reuse DropnestApp's exported pieces. Why: the cart must survive moving between pages with no backend.
- Item photos are local images in `src/assets/items/<item-id>.jpg`, and every brand option has its own real store photo in `src/assets/items/brands/<item-id>--<brand-id>.jpg`, both mapped in `itemPhotos.ts`. Why: each brand shows its actual product; the item photo is only a fallback.
- Dates shown to users are computed only inside drawers/dialogs (not SSR'd). Why: avoids server/browser timezone hydration mismatches.
- Decorative motion is CSS keyframes/utilities in `src/styles.css` plus aria-hidden pieces in `src/components/dropnest/motion.tsx` (no animation library), all disabled under prefers-reduced-motion. Why: keeps the bundle light and accessible, and SSR renders final values.
- Informational flip tiles use the shared Button-based FlipCard with explicit pressed state; reduced motion switches faces without rotation. Why: the same content remains accessible by mouse, keyboard, and touch.
