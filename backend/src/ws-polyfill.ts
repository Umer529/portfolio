// Node 20 has no native WebSocket (Node 22 does); supabase-js's realtime
// client requires one at construction. Import this module before any
// createClient call.
import ws from "ws";

if (!("WebSocket" in globalThis)) {
  (globalThis as Record<string, unknown>).WebSocket = ws;
}
