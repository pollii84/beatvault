import PackDetailClient from "./PackDetailClient";

export function generateStaticParams() {
  return [{ packId: "placeholder" }];
}

export default function PackDetailPage() {
  return <PackDetailClient />;
}
