"use client";

import { useState, type FormEvent } from "react";
import { inquiryTypes } from "@/lib/content";
import { SectionHeader } from "@/components/ui/Primitives";

type Contact = { email: string; whatsapp: string };

const WA_NUMBER = (c: Contact) => c.whatsapp.replace(/\D/g, "");

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  countryCity: string;
  inquiryType: string;
  message: string;
  honeypot: string;
};

const empty: FormState = {
  fullName: "",
  email: "",
  phone: "",
  countryCity: "",
  inquiryType: "",
  message: "",
  honeypot: "",
};

const field =
  "w-full border border-white/15 bg-ink/60 px-4 py-3.5 text-sm text-paper placeholder:text-paper-faint transition-colors duration-400 focus:border-gold focus:outline-none";

export default function AllocationForm({ contact }: { contact: Contact }) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");

  const set = (key: keyof FormState) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = (): boolean => {
    const er: typeof errors = {};
    if (form.fullName.trim().length < 2) er.fullName = "Please enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      er.email = "Please enter a valid email address";
    if (form.phone.trim().length < 6) er.phone = "Please enter a valid phone / WhatsApp number";
    if (form.countryCity.trim().length < 2) er.countryCity = "Please enter country / city";
    if (!form.inquiryType) er.inquiryType = "Please select an inquiry type";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const buildMessage = () =>
    [
      "HIMALAYAN RESERVE — PRIVATE ALLOCATION REQUEST",
      "",
      `Name: ${form.fullName.trim()}`,
      `Email: ${form.email.trim()}`,
      `Phone/WhatsApp: ${form.phone.trim()}`,
      `Country/City: ${form.countryCity.trim()}`,
      `Inquiry Type: ${inquiryTypes.find((t) => t.value === form.inquiryType)?.label ?? form.inquiryType}`,
      form.message.trim() ? `Message: ${form.message.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

  const submit = async (e: FormEvent, channel: "form" | "whatsapp" | "mailto") => {
    e.preventDefault();
    if (form.honeypot) return;
    if (!validate()) return;
    setStatus("submitting");
    setServerMsg("");

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      countryCity: form.countryCity.trim(),
      inquiryType: form.inquiryType,
      message: form.message.trim(),
      channel,
    };

    try {
      const res = await fetch("/api/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setServerMsg(body?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
    } catch {
      setServerMsg("Network error. Please try again.");
      setStatus("error");
      return;
    }

    if (channel === "whatsapp") {
      window.open(`https://wa.me/${WA_NUMBER(contact)}?text=${encodeURIComponent(buildMessage())}`, "_blank", "noopener");
    } else if (channel === "mailto") {
      window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
        "Himalayan Reserve — Private Allocation Request"
      )}&body=${encodeURIComponent(buildMessage())}`;
    }

    setStatus("done");
  };

  return (
    <section id="allocation" className="relative border-t border-white/5 bg-ink-soft/30 py-28 md:py-36">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      <div className="mx-auto grid max-w-[1400px] gap-14 px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:px-10">
        <div className="flex flex-col gap-8">
          <SectionHeader
            align="left"
            eyebrow="VIP Private Allocation"
            title={
              <>
                Request <span className="gold-text">Private Allocation</span>
              </>
            }
            sub="For Royal Families, VIP Private Collectors & Corporate Gifting."
          />
          <p className="max-w-md text-sm leading-relaxed text-paper-dim">
            Due to extremely limited annual yields, private allocations of Himalayan Reserve (Batch 2026)
            are subject to availability.
          </p>
          <ul className="flex flex-col gap-3 text-sm text-paper-dim">
            <li className="flex items-center gap-3">
              <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold" /> 3,100 boxes worldwide — Batch 2026
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold" /> Strictly allocated via VIP waitlist
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold" /> Sold nowhere else on Earth
            </li>
          </ul>
        </div>

        <form
          noValidate
          onSubmit={(e) => submit(e, "form")}
          className="flex flex-col gap-5 border border-white/10 bg-ink/70 p-6 backdrop-blur-sm md:p-10"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="eyebrow !text-[0.6rem] text-gold-dim">
                Full Name *
              </label>
              <input id="fullName" className={field} placeholder="Your full name" value={form.fullName} onChange={set("fullName")} />
              {errors.fullName ? <span className="text-xs text-seal">{errors.fullName}</span> : null}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="eyebrow !text-[0.6rem] text-gold-dim">
                Email Address *
              </label>
              <input id="email" type="email" className={field} placeholder="you@example.com" value={form.email} onChange={set("email")} />
              {errors.email ? <span className="text-xs text-seal">{errors.email}</span> : null}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="eyebrow !text-[0.6rem] text-gold-dim">
                Phone / WhatsApp *
              </label>
              <input id="phone" type="tel" className={field} placeholder="+977 98…" value={form.phone} onChange={set("phone")} />
              {errors.phone ? <span className="text-xs text-seal">{errors.phone}</span> : null}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="countryCity" className="eyebrow !text-[0.6rem] text-gold-dim">
                Country / City *
              </label>
              <input id="countryCity" className={field} placeholder="Country, City" value={form.countryCity} onChange={set("countryCity")} />
              {errors.countryCity ? <span className="text-xs text-seal">{errors.countryCity}</span> : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="inquiryType" className="eyebrow !text-[0.6rem] text-gold-dim">
              Inquiry Type *
            </label>
            <select id="inquiryType" className={`${field} ${form.inquiryType ? "text-paper" : "text-paper-faint"}`} value={form.inquiryType} onChange={set("inquiryType")}>
              <option value="" disabled>
                Select inquiry type…
              </option>
              {inquiryTypes.map((t) => (
                <option key={t.value} value={t.value} className="bg-ink text-paper">
                  {t.label}
                </option>
              ))}
            </select>
            {errors.inquiryType ? <span className="text-xs text-seal">{errors.inquiryType}</span> : null}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="eyebrow !text-[0.6rem] text-gold-dim">
              Message
            </label>
            <textarea id="message" rows={5} className={field} placeholder="Tell us about your collection…" value={form.message} onChange={set("message")} />
          </div>

          <div className="hidden" aria-hidden>
            <label htmlFor="website">Website</label>
            <input id="website" tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={set("honeypot")} />
          </div>

          {serverMsg ? <p role="alert" className="text-sm text-seal">{serverMsg}</p> : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex flex-1 items-center justify-center bg-gold px-8 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-ink transition-all duration-500 hover:bg-paper disabled:opacity-60"
            >
              {status === "submitting" ? "Submitting…" : "Submit VIP Inquiry"}
            </button>
            <button
              type="button"
              disabled={status === "submitting"}
              onClick={(e) => submit(e, "whatsapp")}
              className="inline-flex flex-1 items-center justify-center border border-white/25 px-8 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-paper transition-all duration-500 hover:border-gold hover:text-gold disabled:opacity-60"
            >
              Send via WhatsApp
            </button>
            <button
              type="button"
              disabled={status === "submitting"}
              onClick={(e) => submit(e, "mailto")}
              className="inline-flex flex-1 items-center justify-center border border-white/25 px-8 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-paper transition-all duration-500 hover:border-gold hover:text-gold disabled:opacity-60"
            >
              Send via Email
            </button>
          </div>

          {status === "done" ? (
            <p className="flex items-center gap-4 border border-gold/40 bg-gold/[0.06] px-5 py-4 text-sm text-gold">
              <svg viewBox="0 0 100 100" className="h-10 w-10 -rotate-6 animate-stamp" aria-hidden>
                <circle cx="50" cy="50" r="47" fill="none" stroke="#8E1F22" strokeWidth="3" opacity="0.8" />
                <circle cx="50" cy="50" r="40" fill="#8E1F22" opacity="0.15" />
                <text x="50" y="60" textAnchor="middle" fontSize="20" fontFamily="Playfair Display, serif" fill="#B94A4E">
                  HR
                </text>
              </svg>
              Request received. Our allocation desk will contact you shortly.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}