import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="drawer md:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content px-4">
        {/* Fixed Navbar */}
        <Navbar />

        {/* Page content with top padding for fixed navbar */}
        {/* <div className="pt-16">{children}</div> */}
        <div className="">{children}</div>
      </div>

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
};

export default Layout;
