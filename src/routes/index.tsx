import { createFileRoute } from "@tanstack/react-router";

import DropnestApp from "@/components/dropnest/DropnestApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Basera — Move-in kits for hostels & PGs | Move in. Done." },
      {
        name: "description",
        content:
          "One order, one box. Basera move-in kits for students and first-time renters in Kota, Pune, Delhi NCR, Bengaluru & Hyderabad. Free hostel delivery, COD available.",
      },
      {
        property: "og:title",
        content: "Basera — Walk into an empty room. Walk out with a home.",
      },
      {
        property: "og:description",
        content:
          "Basic, Standard & Premium move-in kits from ₹2,799, delivered to your hostel 24 hours before you arrive.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DropnestApp,
});
