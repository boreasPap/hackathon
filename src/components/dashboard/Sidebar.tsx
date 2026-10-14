"use client";

import { ImageIcon } from "@/components/design-system";
import { ProductSidebar, type NavSectionDef } from "./ProductSidebar";

// The Dashboard's menu. It is empty on purpose: every hackathon project adds
// its own pages here. A page that is not listed here cannot be reached from
// the sidebar, so the change that adds a page under src/app/dashboard/ also
// adds its entry (docs/frontend/components/sidebar.md).
//
// A single link, and a group that opens its links under it:
//
//   import { GridIcon, BarChartIcon } from "@/components/design-system";
//
//   const NAV: NavSectionDef[] = [
//     {
//       items: [
//         { name: "My Page", href: "/dashboard/my-page", permission: "dashboard/my-page", icon: <GridIcon className="size-6" /> },
//         {
//           name: "My Reports",
//           icon: <BarChartIcon className="size-6" />,
//           permission: "dashboard/my-reports",
//           prefixes: ["/dashboard/my-reports"],
//           children: [
//             { name: "Weekly", href: "/dashboard/my-reports/weekly", permission: "dashboard/my-reports/weekly" },
//             { name: "Monthly", href: "/dashboard/my-reports/monthly", permission: "dashboard/my-reports/monthly" },
//           ],
//         },
//       ],
//     },
//   ];
//
// Icons are the Figma set (nav-icons.tsx, `className="size-6"`); when none
// fits, a lucide-react icon without a size class.
const NAV: NavSectionDef[] = [
  {
    items: [
      {
        name: "Creative Library",
        icon: <ImageIcon className="size-6" />,
        permission: "dashboard/creative-library",
        prefixes: ["/dashboard/creative-library"],
        children: [
          { name: "Library", href: "/dashboard/creative-library", permission: "dashboard/creative-library" },
          {
            name: "Favorites",
            href: "/dashboard/creative-library/favorites",
            permission: "dashboard/creative-library/favorites",
          },
        ],
      },
    ],
  },
];

export default function Sidebar() {
  return <ProductSidebar product="dashboard" nav={NAV} defaultMatch="exact" />;
}
