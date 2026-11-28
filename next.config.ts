import type { NextConfig } from "next";
import { UTGIVER_ID, adsenseAktiv } from "./lib/annonser.mjs";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  agentRules: false,
  // AdSense-bryteren gjøres til en byggekonstant, så annonsekoden fjernes fra JS-en når den er AV.
  env: {
    NEXT_PUBLIC_WEEKSLOT_ADSENSE: adsenseAktiv() ? "on" : "off",
    // Utgiver-ID når bryteren er PÅ. Tom med AV, så ID-en ikke havner i noen fil.
    NEXT_PUBLIC_WEEKSLOT_UTGIVER: adsenseAktiv() ? UTGIVER_ID : "",
  },
};

export default nextConfig;
