import { Suspense } from "react";
import { ScriptGeneratorPage } from "@/features/creative-library/ScriptGeneratorPage";

export default function AssetLibraryScriptGeneratorPage() {
  return (
    <Suspense>
      <ScriptGeneratorPage />
    </Suspense>
  );
}
