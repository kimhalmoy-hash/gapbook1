import type { NextConfig } from "next";
import { adsenseAktiv } from "./lib/annonser.mjs";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  agentRules: false,
  // AdSense-bryteren gjøres til en byggekonstant, så annonsekoden fjernes fra JS-en når den er AV.
  env: { NEXT_PUBLIC_WEEKSLOT_ADSENSE: adsenseAktiv() ? "on" : "off" },
};

export default nextConfig;
