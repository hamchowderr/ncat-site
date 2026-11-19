import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: { get: unknown[]; put: unknown[] } = { get: [], put: [] };
vi.mock("@vercel/blob", () => ({
  get: vi.fn(async (...args: unknown[]) => {
    calls.get.push(args);
    return { statusCode: 200, stream: new Response(JSON.stringify({ id: "d1" })).body, blob: { etag: 'W/"abc123"' } };
  }),
  put: vi.fn(async (...args: unknown[]) => {
    calls.put.push(args);
    return {};
  }),
  list: vi.fn(),
  issueSignedToken: vi.fn(),
  presignUrl: vi.fn(),
  del: vi.fn(),
}));


import { blobStore } from "./store";

describe("the run file in Blob", () => {
  beforeEach(() => {
    calls.get.length = 0;
    calls.put.length = 0;
  });

  it("reads it uncompressed and saves against its strong ETag, so saves after the first still land", async () => {
    const found = await blobStore.load("d1");
    expect((calls.get[0] as [string, { headers: Record<string, string> }])[1].headers["accept-encoding"]).toBe("identity");
    expect(found?.version).toBe('"abc123"');
    await blobStore.save({ id: "d1" } as never, found!.version);
    expect((calls.put[0] as [string, string, { ifMatch: string }])[2].ifMatch).toBe('"abc123"');
  });
});
