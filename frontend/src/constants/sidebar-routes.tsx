import { FiHome, FiUsers } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export const ROUTES = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <FiHome className="w-5 h-5" />,
  },
  {
    label: "Scan",
    path: "/dashboard/scan",
    icon: <FiUsers className="w-5 h-5" />,
  },
  {
    label: "Whatsaap",
    path: "/dashboard/whatsapp",
    icon: <FaWhatsapp className="w-5 h-5" />,
  },
];
