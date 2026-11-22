import { SHARE_CARDS, shareImage, shareSize } from "@/lib/shareCard";

export const alt = "Takewon: Your content, social media ready.";
export const size = shareSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return shareImage(SHARE_CARDS.home);
}
