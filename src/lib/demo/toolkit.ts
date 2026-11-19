/**
 * Talking to the NCA Toolkit that runs the demo: NCAT_API_URL and NCAT_API_KEY. The same
 * calls the dashboard makes (ncat-dash packages/step-catalog/src/client.ts).
 */

export interface Toolkit {
  /** Queues a job; the toolkit posts the result to `webhookUrl` and answers with its job id. */
  send(endpoint: string, body: Record<string, unknown>, webhookUrl: string, id: string): Promise<Sent>;
  /** What the toolkit knows about one of its jobs. */
  status(toolkitJobId: string): Promise<JobState>;
}

export type Sent = { kind: "queued"; toolkitJobId: string | null } | { kind: "answered"; ok: boolean; result?: unknown; error?: string } | { kind: "busy" } | { kind: "refused"; error: string };

export type JobState = { state: "finished"; ok: boolean; result?: unknown; error?: string } | { state: "working" } | { state: "unknown" };

export function toolkitSetup(): { baseUrl: string; apiKey: string } | null {
  const baseUrl = process.env.NCAT_API_URL?.replace(/\/+$/, ""), apiKey = process.env.NCAT_API_KEY;
  return baseUrl && apiKey ? { baseUrl, apiKey } : null;
}

/** A toolkit answer's message as plain text, kept short. */
function messageOf(value: unknown): string {
  const text = typeof value === "string" ? value : value == null ? "" : JSON.stringify(value);
  return text.slice(0, 300) || "The toolkit could not finish this step.";
}

/** Reads a finished job's envelope ({ code, response, message }). */
export function readEnvelope(envelope: unknown): { ok: boolean; result?: unknown; error?: string } {
  const e = (envelope ?? {}) as { code?: unknown; response?: unknown; message?: unknown };
  return Number(e.code) === 200 ? { ok: true, result: e.response } : { ok: false, error: messageOf(e.message) };
}

export function httpToolkit(setup: { baseUrl: string; apiKey: string }, doFetch: typeof fetch = fetch): Toolkit {
  const headers = { "Content-Type": "application/json", "X-API-Key": setup.apiKey };
  return {
    async send(endpoint, body, webhookUrl, id) {
      let res: Response;
      try {
        res = await doFetch(`${setup.baseUrl}${endpoint}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ...body, webhook_url: webhookUrl, id }),
          signal: AbortSignal.timeout(30_000),
        });
      } catch {
        return { kind: "busy" };
      }
      const text = await res.text();
      // Busy, restarting or its queue is full: try again on the next look.
      if (res.status === 429 || res.status >= 500) return { kind: "busy" };
      if (!res.ok) return { kind: "refused", error: `The toolkit refused the job (HTTP ${res.status}). ${text.slice(0, 200)}` };
      let json: { code?: number; job_id?: string; response?: unknown } | null = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
      if (json?.code === 200 && json.response !== undefined) return { kind: "answered", ...readEnvelope(json) };
      return { kind: "queued", toolkitJobId: json?.job_id ?? null };
    },
    async status(toolkitJobId) {
      const res = await doFetch(`${setup.baseUrl}/v1/toolkit/job/status`, {
        method: "POST",
        headers,
        body: JSON.stringify({ job_id: toolkitJobId }),
        signal: AbortSignal.timeout(20_000),
      });
      if (res.status === 404) return { state: "unknown" };
      if (!res.ok) return { state: "working" };
      const json = (await res.json().catch(() => null)) as { response?: { job_status?: unknown; response?: unknown } } | null;
      const status = json?.response;
      if (status?.job_status === "done") return { state: "finished", ...readEnvelope(status.response) };
      if (status?.job_status === "queued" || status?.job_status === "running") return { state: "working" };
      return { state: "unknown" };
    },
  };
}
