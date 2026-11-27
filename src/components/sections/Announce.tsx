import Link from "next/link";
import ShinyText from "@/components/reactbits/ShinyText/ShinyText";

export function Announce() {
  return (
    <div className="announce">
      <Link href="#early">
        The beta is open · Pay once, own it · Runs on your own server <b>
          <ShinyText text="Join the beta" color="#3d24c4" shineColor="#a493ff" speed={3} />
        </b>
      </Link>
    </div>
  );
}
