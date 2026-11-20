import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { qualities: [75, 90] },
};

// BotID: the invisible bot check on the early-access form (src/lib/guard.ts).
export default withBotId(nextConfig);
