import { Outlet } from "react-router";
import { AddToHomescreenAlert } from "~/components/add-to-homescreen-alert";
import { AppHeader } from "~/components/app-header";

export default function HeaderedLayout() {
  return (
    <div className="min-w-[640px]">
      <AppHeader />
      <AddToHomescreenAlert />
      <Outlet />
    </div>
  );
}
