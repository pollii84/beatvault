import OrderDetailClient from "./OrderDetailClient";

export function generateStaticParams() {
  return [{ orderId: "sample-order" }, { orderId: "starter-kit-free" }];
}

export default function OrderDetailPage() {
  return <OrderDetailClient />;
}
