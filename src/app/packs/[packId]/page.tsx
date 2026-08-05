import PackDetailClient from "./PackDetailClient";
import { MOCK_PACKS } from "@/lib/mockData";

export function generateStaticParams() {
  return MOCK_PACKS.map((pack) => ({
    packId: pack.id,
  }));
}

export default function PackDetailPage() {
  return <PackDetailClient />;
}
