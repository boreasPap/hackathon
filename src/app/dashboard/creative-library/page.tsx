import { redirect } from "next/navigation";

// The library moved under Creative › Asset Library.
export default function CreativeLibraryPage() {
  redirect("/dashboard/creative/asset-library/home?app=hairapp");
}
