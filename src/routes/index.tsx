import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import markup from "@/jura/markup.html?raw";
import { initJura } from "@/jura/effects.js";
import { JuraChat } from "@/components/JuraChat";
import "@/jura/jura.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JURA Bio — Scaling Frontier AI In Vitro" },
      {
        name: "description",
        content:
          "JURA Bio builds frontier AI models that design, synthesize and screen therapeutics in the lab — generating proprietary functional data no public dataset can match.",
      },
      { property: "og:title", content: "JURA Bio — Scaling Frontier AI In Vitro" },
      {
        property: "og:description",
        content:
          "Sovereign AI models trained on proprietary functional data across antibodies, TCR mimics, peptides, T-cell engagers and enzymes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    initJura();
  }, []);

  return (
    <div className="jura-page">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
      <JuraChat />
    </div>
  );
}
