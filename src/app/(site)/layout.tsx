import Preloader from "@/components/effects/Preloader";
import CustomCursor from "@/components/effects/CustomCursor";
import ScrollProgress from "@/components/effects/ScrollProgress";
import GrainOverlay from "@/components/effects/GrainOverlay";
import SmoothScroll from "@/components/effects/SmoothScroll";
import AutoReveal from "@/components/effects/AutoReveal";
import JsonLd from "@/components/effects/JsonLd";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Preloader />
      <CustomCursor />
      <ScrollProgress />
      <GrainOverlay />
      <SmoothScroll>
        <AutoReveal />
        {children}
      </SmoothScroll>
      <JsonLd />
    </>
  );
}