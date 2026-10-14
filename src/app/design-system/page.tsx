import { notFound } from "next/navigation";
import { DesignSystemGallery } from "@/features/design-system-gallery/DesignSystemGallery";

// Local preview of the design system (docs/frontend/README.md): every token
// and component in the three themes and both modes. Development only.
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DesignSystemGallery />;
}
