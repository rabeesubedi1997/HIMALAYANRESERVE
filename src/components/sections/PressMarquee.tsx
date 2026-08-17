import Marquee from "@/components/effects/Marquee";
import type { ContentShape } from "@/lib/content";

export default function PressMarquee({ press }: { press: ContentShape["press"] }) {
  return <Marquee items={press} />;
}