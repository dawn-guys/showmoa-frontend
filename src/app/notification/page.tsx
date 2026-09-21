import { AppBar } from "@/app/_components/app-bar";
import { NotificationList } from "./_components/notification-list";

export default function NotificationPage() {
  return (
    <>
      <AppBar title="알림함" />
      <main>
        <NotificationList />
      </main>
    </>
  );
}
