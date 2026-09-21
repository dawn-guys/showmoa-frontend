import { AppBar } from "@/app/_components/app-bar";
import { SettingList } from "./_components/setting-list";

export default function SettingPage() {
  return (
    <>
      <AppBar title="설정" />
      <main>
        <SettingList />
      </main>
    </>
  );
}
