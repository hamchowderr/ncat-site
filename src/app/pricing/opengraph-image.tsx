import { SHARE_CARDS, shareImage, shareSize } from "@/lib/shareCard";

export const alt = "Takewon pricing: Pay once. Own your version.";
export const size = shareSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return shareImage(SHARE_CARDS.pricing);
}
