"use client";

import { usePathname } from "next/navigation";
import { BrushIcon, CodeIcon, GlobeIcon, SmartphoneIcon, SwordIcon } from "@/components/design-system";
import { ProductSidebar, type NavLinkDef, type NavSectionDef } from "./ProductSidebar";

const ASSET_LIBRARY = "/dashboard/creative/asset-library";
const ASSET_LIBRARY_HOME = `${ASSET_LIBRARY}/home`;
const ASSET_LIBRARY_FAVORITES = `${ASSET_LIBRARY}/favorites`;

// Asset Library's own pages, shown under it while one of its pages is open.
// Home also lights for the pages reached from it (creative details, generators).
const ASSET_LIBRARY_PAGES: NavLinkDef[] = [
  { name: "Home", href: ASSET_LIBRARY_HOME, permission: "dashboard/creative/asset-library", prefixes: [ASSET_LIBRARY], excludePrefixes: [ASSET_LIBRARY_FAVORITES] },
  { name: "Favorites", href: ASSET_LIBRARY_FAVORITES, permission: "dashboard/creative/asset-library" },
];

// The sub-pages sit one step further in and a little smaller than the menu's links
// (written out in full so Tailwind generates them).
const SUB_LINK = [
  "[&_a[href='/dashboard/creative/asset-library/home']]:h-8",
  "[&_a[href='/dashboard/creative/asset-library/home']]:pl-16",
  "[&_a[href='/dashboard/creative/asset-library/home']]:text-body-sm",
  "[&_a[href='/dashboard/creative/asset-library/favorites']]:h-8",
  "[&_a[href='/dashboard/creative/asset-library/favorites']]:pl-16",
  "[&_a[href='/dashboard/creative/asset-library/favorites']]:text-body-sm",
].join(" ");

// The Dashboard's menu. Every entry except Asset Library mirrors the real
// dashboard's menu and opens a placeholder page (src/app/dashboard/[...slug]).
const nav = (inLibrary: boolean): NavSectionDef[] => [
  {
    items: [
      { name: "Competitors", href: "/dashboard/competitors", permission: "dashboard/competitors", icon: <SwordIcon className="size-6" /> },
      {
        name: "SDK",
        icon: <CodeIcon className="size-6" />,
        permission: "dashboard/sdk",
        prefixes: ["/dashboard/sdk"],
        children: [{ name: "Overview", href: "/dashboard/sdk/overview", permission: "dashboard/sdk/overview" }],
      },
      { name: "Localization", href: "/dashboard/localization", permission: "dashboard/localization", icon: <GlobeIcon className="size-6" /> },
      {
        name: "Creative",
        icon: <BrushIcon className="size-6" />,
        permission: "dashboard/creative",
        prefixes: ["/dashboard/creative"],
        children: [
          { name: "Download Videos & Audio", href: "/dashboard/creative/download-videos-audio", permission: "dashboard/creative/download-videos-audio" },
          { name: "Creative Storage", href: "/dashboard/creative/creative-storage", permission: "dashboard/creative/creative-storage" },
          { name: "Post Contents", href: "/dashboard/creative/post-contents", permission: "dashboard/creative/post-contents" },
          { name: "Weekly Tracker", href: "/dashboard/creative/weekly-tracker", permission: "dashboard/creative/weekly-tracker" },
          { name: "New Generation", href: "/dashboard/creative/new-generation", permission: "dashboard/creative/new-generation" },
          { name: "Creative Analysis", href: "/dashboard/creative/creative-analysis", permission: "dashboard/creative/creative-analysis" },
          // Its link opens Home; the highlight goes to the sub-page that is open.
          { name: "Asset Library", href: ASSET_LIBRARY, permission: "dashboard/creative/asset-library", match: "exact" },
          ...(inLibrary ? ASSET_LIBRARY_PAGES : []),
        ],
      },
      {
        name: "Mobile Farm",
        icon: <SmartphoneIcon className="size-6" />,
        permission: "dashboard/mobile-farm",
        prefixes: ["/dashboard/mobile-farm"],
        children: [{ name: "Devices", href: "/dashboard/mobile-farm/devices", permission: "dashboard/mobile-farm/devices" }],
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const inLibrary = pathname === ASSET_LIBRARY || pathname.startsWith(`${ASSET_LIBRARY}/`);
  return <ProductSidebar product="dashboard" nav={nav(inLibrary)} defaultMatch="exact" className={SUB_LINK} />;
}
