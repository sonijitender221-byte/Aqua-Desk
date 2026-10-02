import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "AquaDesk", short_name: "AquaDesk", description: "RO service business management", start_url: "/dashboard", display: "standalone", background_color: "#f8fafc", theme_color: "#0891b2", icons: [] }; }
