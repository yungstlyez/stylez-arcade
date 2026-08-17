import { OpenLibraryOnMount } from "./OpenLibraryOnMount";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MUSIC",
  description: "Releases, mixes, and chapters from Callmestylez.",
};

export default function MusicPage() {
  return <OpenLibraryOnMount />;
}
