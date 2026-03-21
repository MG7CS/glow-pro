import { Outlet } from "react-router-dom";
import BizNavbar from "@/components/biz/BizNavbar";
import { BIZ_PAGE_GRADIENT } from "@/lib/bizUi";

const BizLayout = () => (
  <div
    className="biz-portal flex min-h-screen flex-col"
    style={{ background: BIZ_PAGE_GRADIENT }}
  >
    <BizNavbar />
    <Outlet />
  </div>
);

export default BizLayout;
