"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

// Contact form per Section 7.1/7.5: client-side validation before submit
// (server validates again), button shows the in-flight state and is disabled
// so it can't double-submit, and errors say specifically what's wrong.

type FieldErrors = { name?: string; email?: string; message?: string };
type Status = "idle" | "sending" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(name: string, email: string, message: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email.";
  if (!message.trim()) errors.message = "Enter a message.";
  return errors;
}

const inputClass =
  "w-full rounded-card border border-border-hairline bg-bg-surface px-4 py-3 text-base text-text-primary transition-colors duration-150 ease-brand placeholder:text-text-tertiary hover:border-border-hairline-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validate(name, email, message);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus("sending");
    try {
      const res = await fetch(`${site.apiUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error(`contact failed: ${res.status}`);
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-name" className="text-sm text-text-secondary">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={inputClass}
        />
        {errors.name ? (
          <p id="contact-name-error" className="text-sm font-medium text-text-primary">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-email" className="text-sm text-text-secondary">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={inputClass}
        />
        {errors.email ? (
          <p id="contact-email-error" className="text-sm font-medium text-text-primary">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm text-text-secondary">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={inputClass}
        />
        {errors.message ? (
          <p id="contact-message-error" className="text-sm font-medium text-text-primary">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {status === "success" ? (
          <span className="text-accent-teal">Message sent — I’ll get back to you soon.</span>
        ) : status === "error" ? (
          <span className="font-medium text-text-primary">
            The message didn’t go through. Try again in a minute.
          </span>
        ) : null}
      </p>
    </form>
  );
}
