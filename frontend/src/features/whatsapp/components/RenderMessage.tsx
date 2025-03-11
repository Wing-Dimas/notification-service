import React, { useState } from "react";
import { HiOutlineArrowPath, HiOutlineDocument, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { formatDate } from "../../../libs/utils";
import { HistoryMessageWA } from "../../../types/whatsapp";
import PayloadRendered from "../../../components/PayloadRendered";
import Modal from "../../../components/Modal";
import EditMessage from "./EditMessage";
import { Link } from "react-router-dom";
import useSendMessageWA from "../hooks/useSendMessageWA";
import toast from "react-hot-toast";

interface RenderMessageProps {
  message: HistoryMessageWA;
}

const RenderMessage: React.FC<RenderMessageProps> = ({ message }) => {
  // STATE
  const { sendMessageWA } = useSendMessageWA();

  // MODAL
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const onSendMessage = async () => {
    toast.promise(sendMessageWA(message.id), {
      loading: "Sedang mengirim pesan",
      success: "Berhasil mengirim pesan",
      error: (err) => err.message,
    });
    setIsSendModalOpen(false);
  };

  return (
    <tr>
      <td>
        <PayloadRendered payload={message.payload} />
      </td>
      <td>
        {message.status ? (
          <div className="badge text-xs bg-green-200 text-green-800">Success</div>
        ) : (
          <div className="badge text-xs bg-red-200 text-red-800">Failed</div>
        )}
      </td>
      <td className="whitespace-nowrap text-sm">{formatDate(message.created_at)}</td>
      <td>
        {message.file_path ? (
          <div className="tooltip tooltip-top" data-tip="Lihat File">
            <Link to={import.meta.env.VITE_BACKEND_URL + message.file_path} target="_blank" className="btn btn-sm">
              <HiOutlineDocument />
            </Link>
          </div>
        ) : null}
      </td>
      <td>
        <div className="flex gap-2">
          {/* EDIT BUTTON */}
          <Modal onClose={() => setIsEditModalOpen(false)} isOpen={isEditModalOpen} title="Edit Data">
            <EditMessage message={message} onClose={() => setIsEditModalOpen(false)} />
          </Modal>
          <div className="tooltip tooltip-top" data-tip="Edit Data">
            <button className="btn btn-sm btn-warning" onClick={() => setIsEditModalOpen(true)}>
              <HiOutlinePencilSquare />
            </button>
          </div>
          {/* END EDIT BUTTON */}
          {/* DELETE BUTTON */}
          <Modal
            onClose={() => setIsDeleteModalOpen(false)}
            isOpen={isDeleteModalOpen}
            onlyQuestion
            onConfirm={() => {}}
            confirmButtonStyle="btn-error"
            onCancel={() => setIsDeleteModalOpen(false)}
            withHeader={false}
            containerStyle="max-w-md"
          />
          <div className="tooltip tooltip-top" data-tip="Hapus">
            <button className="btn btn-sm btn-error text-white" onClick={() => setIsDeleteModalOpen(true)}>
              <HiOutlineTrash />
            </button>
          </div>
          {/* END DELETE BUTTON */}
          {/* RESEND */}
          <Modal
            onClose={() => setIsSendModalOpen(false)}
            isOpen={isSendModalOpen}
            onlyQuestion
            onConfirm={onSendMessage}
            confirmButtonStyle="btn-info"
            onCancel={() => setIsSendModalOpen(false)}
            withHeader={false}
            containerStyle="max-w-md"
            questionText="Apakah anda yakin ingin mengirim ulang message ini ke whatsapp?"
          />
          <div className="tooltip tooltip-top" data-tip="Kirim Ulang">
            <button className="btn btn-sm btn-info text-white" onClick={() => setIsSendModalOpen(true)}>
              <HiOutlineArrowPath />
            </button>
          </div>
          {/* END RESEND */}
        </div>
      </td>
    </tr>
  );
};

export default RenderMessage;
