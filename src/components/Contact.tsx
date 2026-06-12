import { useState, type FormEvent } from "react";
import { contact } from "../data";
import { Reveal } from "./Reveal";

/**
 * Leave empty to use the mailto fallback (opens the visitor's mail client,
 * works on any static host with zero setup). To collect submissions silently,
 * paste a form endpoint here — e.g. a Formspree (https://formspree.io) or
 * Web3Forms URL — and the form will POST to it instead.
 */
const FORM_ENDPOINT = "";

type Status = "idle" | "sending" | "sent" | "error";

const tiles = [
  { label: "EMAIL", value: contact.email, href: `mailto:${contact.email}`, external: false },
  { label: "LINKEDIN", value: contact.linkedin.label, href: contact.linkedin.url, external: true },
  { label: "GITHUB", value: contact.github.label, href: contact.github.url, external: true },
  { label: "PHONE", value: contact.phone.display, href: `tel:${contact.phone.e164}`, external: false },
];

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const year = new Date().getFullYear();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");

    // No endpoint configured → hand off to the visitor's mail client.
    if (!FORM_ENDPOINT) {
      const subject = encodeURIComponent(`Portfolio contact from ${form.name || "a visitor"}`);
      const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
      setStatus("sent");
      return;
    }

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full border border-border bg-bg-2 px-3.5 py-3 text-text outline-none transition-colors placeholder:text-muted/70 focus:border-accent";

  return (
    <section id="contact" className="mx-auto max-w-page px-5 pt-16 sm:px-8 sm:pt-24">
      <div className="grid items-start gap-10 md:grid-cols-2 md:gap-14">
        {/* Pitch + direct tiles */}
        <Reveal>
          <span className="font-mono text-[0.7rem] tracking-[0.16em] text-accent">// READY TO DEPLOY</span>
          <h2 className="my-4 text-[clamp(2rem,6vw,3.4rem)] leading-tight tracking-tight">
            Let's build something worth shipping.
          </h2>
          <p className="mb-8 text-lg text-muted">
            Open to roles and collaborations in AI / backend engineering.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tiles.map((t) => (
              <a
                key={t.label}
                href={t.href}
                {...(t.external ? { target: "_blank", rel: "noopener" } : {})}
                className="clip-corner group flex flex-col items-start gap-1 border border-border bg-surface px-4 py-3.5 transition-all duration-300 ease-tactical hover:-translate-y-0.5 hover:border-accent hover:bg-surface-2"
              >
                <span className="font-mono text-[0.6rem] tracking-widest text-muted">{t.label}</span>
                <span className="break-all font-display text-[0.95rem] font-semibold group-hover:text-accent">
                  {t.value}
                </span>
              </a>
            ))}
          </div>
        </Reveal>

        {/* Contact form */}
        <Reveal delay={0.1}>
          <form
            onSubmit={handleSubmit}
            className="clip-corner relative border border-border bg-surface p-6"
          >
            <span className="absolute left-0 top-0 h-full w-[3px] bg-accent" />
            <div className="mb-4 font-mono text-[0.68rem] tracking-widest text-muted">
              // SEND TRANSMISSION
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-[0.62rem] tracking-widest text-muted">NAME</span>
                  <input
                    className={inputClass}
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-[0.62rem] tracking-widest text-muted">EMAIL</span>
                  <input
                    className={inputClass}
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[0.62rem] tracking-widest text-muted">MESSAGE</span>
                <textarea
                  className={`${inputClass} min-h-[120px] resize-y`}
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="What are you building?"
                />
              </label>

              <button
                type="submit"
                disabled={status === "sending"}
                className="clip-corner glow-shadow group mt-1 inline-flex items-center justify-center gap-2.5 bg-accent px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-accent-ink transition-transform duration-200 ease-tactical hover:-translate-y-0.5 disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send Message"}
                <span className="transition-transform duration-200 ease-tactical group-hover:translate-x-1">→</span>
              </button>

              {status === "sent" && (
                <p className="font-mono text-[0.72rem] tracking-wide text-accent">
                  ✓ Opening your mail client / message sent. Thanks!
                </p>
              )}
              {status === "error" && (
                <p className="font-mono text-[0.72rem] tracking-wide text-danger">
                  ✗ Something went wrong — email {contact.email} directly.
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>

      {/* Footer */}
      <footer className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-border py-6 font-mono text-[0.66rem] tracking-wide text-muted sm:flex-row">
        <span>© {year} ANIKET CHARJAN</span>
        <div className="flex items-center gap-4">
          <a
            href={contact.oldPortfolio}
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-accent"
          >
            ARCHIVE · v1 ↗
          </a>
          <span className="hidden sm:inline">BUILT WITH REACT · CS2 THEME</span>
        </div>
      </footer>
    </section>
  );
}
