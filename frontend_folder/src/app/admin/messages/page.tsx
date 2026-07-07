"use client";

import { useEffect, useState } from "react";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { adminFetch } from "@/lib/admin-api";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<{ messages: Message[] }>("/api/admin/messages")
      .then((data) => setMessages(data.messages))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await adminFetch(`/api/admin/messages/${id}/read`, { method: "PATCH" });
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
    );
  }

  async function remove(id: string) {
    await adminFetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <main>
      <PageHeader
        eyebrow="GET /admin/messages"
        title="Messages"
        lede={unread > 0 ? `${unread} unread` : "All caught up"}
      />

      {error ? (
        <p className="mt-6 rounded-card border border-border-hairline bg-bg-surface p-4 text-sm text-text-secondary">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-10 font-mono text-sm text-text-tertiary">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="mt-10 font-mono text-sm text-text-tertiary">No messages yet.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {messages.map((m) => (
            <Card key={m.id} className={`flex flex-col gap-3 ${!m.is_read ? "border-accent-teal/40" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {m.is_read ? (
                    <MailOpen size={15} className="shrink-0 text-text-tertiary" />
                  ) : (
                    <Mail size={15} className="shrink-0 text-accent-teal" />
                  )}
                  <div>
                    <p className="font-medium text-text-primary">{m.name}</p>
                    <a
                      href={`mailto:${m.email}`}
                      className="font-mono text-xs text-text-tertiary hover:text-accent-teal transition-colors"
                    >
                      {m.email}
                    </a>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <p className="font-mono text-xs text-text-tertiary">
                    {new Date(m.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {!m.is_read ? (
                    <button
                      onClick={() => markRead(m.id)}
                      aria-label="Mark as read"
                      className="rounded-chip px-2 py-1 font-mono text-xs text-text-tertiary hover:text-text-primary border border-border-hairline hover:border-border-hairline-hover transition-colors"
                    >
                      mark read
                    </button>
                  ) : null}
                  <button
                    onClick={() => remove(m.id)}
                    aria-label="Delete message"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-chip text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <Trash2 size={14} aria-hidden />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {m.message}
              </p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
