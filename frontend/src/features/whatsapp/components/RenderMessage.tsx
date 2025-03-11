import React, { useState } from "react";
import { HiOutlineArrowPath, HiOutlineDocument, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { formatDate } from "../../../libs/utils";
import { HistoryMessageWA } from "../../../types/whatsapp";
import PayloadRendered from "../../../components/PayloadRendered";
import Modal from "../../../components/Modal";
import EditMessage from "./EditMessage";
import { Link } from "react-router-dom";

interface RenderMessageProps {
  message: HistoryMessageWA;
}

const RenderMessage: React.FC<RenderMessageProps> = ({ message }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleModal = () => {
    setIsEditModalOpen(true);
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
            <button className="btn btn-sm btn-warning" onClick={handleModal}>
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
          <div className="tooltip tooltip-top" data-tip="Kirim Ulang">
            <button className="btn btn-sm btn-info text-white">
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
