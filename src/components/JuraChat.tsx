import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What does JURA Bio actually do?",
  "Explain the closed loop.",
  "Which modalities do you work on?",
];

export function JuraChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I'm **ATLAS**, JURA Bio's assistant. Ask me about the closed loop, our sovereign models, or the modalities we design for.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-20) }),
      });
      if (!res.ok || !res.body) {
        throw new Error((await res.text()) || "The assistant is unavailable right now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      if (!acc.trim()) throw new Error("No response received.");
    } catch (e) {
      setMessages((prev) => prev.slice(0, -1));
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className="jchat-launcher"
        aria-label={open ? "Close assistant" : "Ask JURA's AI assistant"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Close" : "Ask ATLAS"}
      </button>

      {open && (
        <div className="jchat-panel" role="dialog" aria-label="JURA AI assistant">
          <div className="jchat-head">
            <div>
              <div className="eyebrow">AI Assistant</div>
              <div className="jchat-title">ATLAS</div>
            </div>
            <button className="jchat-x" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </div>

          <div className="jchat-log" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`jchat-msg ${m.role}`}>
                {m.role === "assistant" && m.content === "" ? (
                  <span className="jchat-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                )}
              </div>
            ))}
            {error && <div className="jchat-error">{error}</div>}
            {messages.length === 1 && !busy && (
              <div className="jchat-suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="jchat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the platform…"
              aria-label="Message"
            />
            <button type="submit" disabled={busy || !input.trim()}>
              →
            </button>
          </form>
        </div>
      )}
    </>
  );
}
