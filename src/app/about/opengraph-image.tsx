import { SHARE_CARDS, shareImage, shareSize } from "@/lib/shareCard";

export const alt = "About Takewon: Built for everyone who hit the same wall.";
export const size = shareSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return shareImage(SHARE_CARDS.about);
}
