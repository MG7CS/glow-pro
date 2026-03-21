import { Outlet } from "react-router-dom";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

const UserLayout = () => (
  <div className="min-h-screen bg-background">
    <main>
      <Outlet />
    </main>
    <PwaInstallPrompt />
  </div>
);

export default UserLayout;
