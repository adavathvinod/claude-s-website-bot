import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

const SYSTEM_PROMPT = `You are ATLAS, the AI assistant on the website of JURA Bio, Inc. — a biotech company whose tagline is "Scaling frontier AI in vitro."

What you know about JURA Bio:
- JURA builds frontier AI models that create their own training data in the lab through a closed loop: Design -> Synthesis -> Screening -> Functional Signal -> Proprietary Data -> Model Improvement.
- Sovereign AI models: foundation models trained on proprietary functional data for novel modalities and hard targets, where public data does not exist and off-the-shelf AI fails.
- Candidate discovery and development spans six modalities: Antibodies, TCR Mimics, Peptides, T-cell Engagers, Enzymes, and Emerging Modalities.
- Locations: Boston, MA and Basel, Switzerland. Visitors can reach out via the "Partner With Us" section.

Style: concise, confident, technically fluent. 2-4 sentences by default. Use short markdown lists when helpful.
Never invent specific pipeline assets, clinical data, funding, or people. If you don't know, say so and point the visitor to the Partner With Us contact section.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("AI is not configured", { status: 500 });
        }

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return new Response("Invalid request", { status: 400 });
        }

        const gateway = createLovableAiGatewayProvider(apiKey);

        try {
          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system: SYSTEM_PROMPT,
            messages: parsed.messages,
          });
          return result.toTextStreamResponse();
        } catch (error) {
          const status =
            typeof error === "object" && error && "statusCode" in error
              ? Number((error as { statusCode?: number }).statusCode) || 500
              : 500;
          const message =
            status === 429
              ? "Too many requests right now — please try again in a moment."
              : status === 402
                ? "AI credits are exhausted for this workspace."
                : "The assistant is unavailable right now.";
          return new Response(message, { status });
        }
      },
    },
  },
});
