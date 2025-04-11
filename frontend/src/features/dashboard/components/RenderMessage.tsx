import React from "react";
import { IMessage } from "../../../types/message";
import PayloadRendered from "../../../components/PayloadRendered";
import { formatDate, formatTime } from "../../../libs/utils";
import { FaRegEnvelope, FaTelegram, FaWhatsapp } from "react-icons/fa6";
interface RenderMessageProps {
  message: IMessage;
}

const RenderMessage: React.FC<RenderMessageProps> = ({ message }) => {
  const getNotificationIcon = (type = "") => {
    const icons = {
      WHATSAPP: <FaWhatsapp />,
      TELEGRAM: <FaTelegram />,
      EMAIL: <FaRegEnvelope />,
    };
    return icons[type as keyof typeof icons] || <FaWhatsapp />;
  };
  return (
    <tr>
      <td>
        <PayloadRendered payload={message.payload} />
      </td>
      <td>{getNotificationIcon(message.notification_type)}</td>
      <td>
        {message.status ? (
          <div className="badge text-xs bg-green-200 text-green-800">
            Success
          </div>
        ) : (
          <div className="badge text-xs bg-red-200 text-red-800">Failed</div>
        )}
      </td>
      <td className="whitespace-nowrap text-sm">
        <p className="text-base">{formatDate(message.sent_at || "")}</p>
        <p className="text-xs">{formatTime(message.sent_at || "")}</p>
      </td>
    </tr>
  );
};

export default RenderMessage;
