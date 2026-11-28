import { SHARE_CARDS, shareImage, shareSize } from "@/lib/shareCard";

export const alt = "The Takewon beta: Help build Takewon.";
export const size = shareSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return shareImage(SHARE_CARDS.beta);
}
