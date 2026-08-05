import BeatDetailClient from "./BeatDetailClient";
import { MOCK_BEATS } from "@/lib/mockData";

export function generateStaticParams() {
  return MOCK_BEATS.map((beat) => ({
    beatId: beat.id,
  }));
}

export default function BeatDetailPage() {
  return <BeatDetailClient />;
}
