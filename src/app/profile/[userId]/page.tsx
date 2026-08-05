import ProfileClient from "./ProfileClient";

export function generateStaticParams() {
  return [{ userId: "placeholder" }];
}

export default function ProfilePage() {
  return <ProfileClient />;
}
