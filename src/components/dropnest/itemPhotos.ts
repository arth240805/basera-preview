// Product photos for every kit item and add-on, keyed by item / add-on id.
import { selectedBrand, type CartState } from "@/lib/dropnest";
import adhesiveHooks from "@/assets/items/adhesive-hooks.jpg";
import bedsheet from "@/assets/items/bedsheet.jpg";
import bucketMug from "@/assets/items/bucket-mug.jpg";
import clothesClips from "@/assets/items/clothes-clips.jpg";
import cutlerySet from "@/assets/items/cutlery-set.jpg";
import detergentScrub from "@/assets/items/detergent-scrub.jpg";
import doorMat from "@/assets/items/door-mat.jpg";
import dustbin from "@/assets/items/dustbin.jpg";
import extensionBoard from "@/assets/items/extension-board.jpg";
import firstAid from "@/assets/items/first-aid.jpg";
import handwash from "@/assets/items/handwash.jpg";
import hangers from "@/assets/items/hangers.jpg";
import hygieneKit from "@/assets/items/hygiene-kit.jpg";
import iron from "@/assets/items/iron.jpg";
import kettle from "@/assets/items/kettle.jpg";
import lapTable from "@/assets/items/lap-table.jpg";
import ledLamp from "@/assets/items/led-lamp.jpg";
import lockBox from "@/assets/items/lock-box.jpg";
import mirrorComb from "@/assets/items/mirror-comb.jpg";
import mosquitoNet from "@/assets/items/mosquito-net.jpg";
import pillow from "@/assets/items/pillow.jpg";
import quilt from "@/assets/items/quilt.jpg";
import roomFreshener from "@/assets/items/room-freshener.jpg";
import slippers from "@/assets/items/slippers.jpg";
import stationery from "@/assets/items/stationery.jpg";
import studyChair from "@/assets/items/study-chair.jpg";
import wallClock from "@/assets/items/wall-clock.jpg";

export const ITEM_PHOTOS: Record<string, string> = {
  "adhesive-hooks": adhesiveHooks,
  "bedsheet": bedsheet,
  "bucket-mug": bucketMug,
  "clothes-clips": clothesClips,
  "cutlery-set": cutlerySet,
  "detergent-scrub": detergentScrub,
  "door-mat": doorMat,
  "dustbin": dustbin,
  "extension-board": extensionBoard,
  "first-aid": firstAid,
  "handwash": handwash,
  "hangers": hangers,
  "hygiene-kit": hygieneKit,
  "iron": iron,
  "kettle": kettle,
  "lap-table": lapTable,
  "led-lamp": ledLamp,
  "lock-box": lockBox,
  "mirror-comb": mirrorComb,
  "mosquito-net": mosquitoNet,
  "pillow": pillow,
  "quilt": quilt,
  "room-freshener": roomFreshener,
  "slippers": slippers,
  "stationery": stationery,
  "study-chair": studyChair,
  "wall-clock": wallClock,
  "extra-bedsheet": bedsheet,
};

// One photo per brand option, named "<item-id>--<brand-id>.jpg". The included
// (first) brand of each item uses the item's main photo above.
const BRAND_FILES = import.meta.glob<string>("../../assets/items/brands/*.jpg", {
  eager: true,
  import: "default",
});

export const BRAND_PHOTOS: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_FILES).map(([path, url]) => [
    (path.split("/").pop() ?? "").replace(/\.jpg$/, ""),
    url,
  ]),
);

/** Photo for one brand of an item, falling back to the item's main photo. */
export function brandPhoto(itemId: string, brandId?: string | null): string {
  return (brandId && BRAND_PHOTOS[`${itemId}--${brandId}`]) || ITEM_PHOTOS[itemId] || "";
}

/** Photo of the brand the customer currently has picked for an item. */
export function pickedPhoto(cart: CartState, itemId: string): string {
  return brandPhoto(itemId, selectedBrand(cart, itemId)?.id);
}
