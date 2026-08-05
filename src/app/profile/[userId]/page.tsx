import ProfileClient from "./ProfileClient";

export function generateStaticParams() {
  return [
    { userId: "prod-1" },
    { userId: "prod-2" },
    { userId: "prod-3" },
  ];
}

export default function ProfilePage() {
  return <ProfileClient />;
}
