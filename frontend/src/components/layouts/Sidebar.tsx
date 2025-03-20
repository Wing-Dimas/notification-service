import React from "react";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../libs/utils";
import { ROUTES } from "../../constants/sidebar-routes";

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="drawer-side z-40">
      <label
        htmlFor="my-drawer-2"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <aside className="bg-base-100 min-h-screen w-80">
        <div className="bg-base-100 sticky top-0 z-20 items-center gap-2 bg-opacity-90 px-4 py-2 backdrop-blur flex ">
          <div className="w-8 h-8 bg-primary rounded-lg flex justify-center items-center">
            <HiMiniSquares2X2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold">Notification Services</span>
        </div>
        <div className="h-4"></div>
        <ul className="menu px-4 py-0">
          {ROUTES.map((route, index) => (
            <li key={index}>
              <Link
                to={route.path}
                className={cn(
                  "flex items-center gap-4 mb-2",
                  location.pathname === route.path ? "active" : "",
                )}
              >
                {route.icon}
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
