import { FiHome, FiUsers } from "react-icons/fi";
import { FaKey, FaTelegramPlane, FaWhatsapp, FaWhmcs } from "react-icons/fa";

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
    label: "Telegram",
    path: "/dashboard/telegram",
    icon: <FaTelegramPlane className="w-5 h-5" />,
  },
  {
    label: "Whatsaap",
    path: "/dashboard/whatsapp",
    icon: <FaWhatsapp className="w-5 h-5" />,
  },
  {
    label: "Api Key Management",
    path: "/dashboard/api-key",
    icon: <FaKey className="w-5 h-5" />,
  },
  {
    label: "Job Management",
    path: "/dashboard/job-management",
    icon: <FaWhmcs className="w-5 h-5" />,
  },
];
