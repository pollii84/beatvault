import OrderDetailClient from "./OrderDetailClient";

export function generateStaticParams() {
  return [{ orderId: "placeholder" }];
}

export default function OrderDetailPage() {
  return <OrderDetailClient />;
}
