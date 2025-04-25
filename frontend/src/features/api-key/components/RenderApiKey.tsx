import React, { useState } from "react";
import {
  HiCheck,
  HiChevronDown,
  HiOutlineChevronUp,
  HiOutlinePencilSquare,
  HiOutlineSquare2Stack,
  HiOutlineTrash,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import Modal from "../../../components/Modal";

import { cn, formatDate, formatTime } from "../../../libs/utils";
import { IApiKeyData } from "../../../types/api-key";
import EditMessage from "./EditApiKey";
import useDeleteApiKey from "../hooks/useDeleteApiKey";
import useGetApiKey from "../hooks/useGetApiKey";

interface RenderApiKeyProps {
  apiKey: IApiKeyData;
  expandedRow: number | null;
  toggleExpandRow: (id: number) => void;
}

const RenderApiKey: React.FC<RenderApiKeyProps> = ({
  apiKey,
  expandedRow,
  toggleExpandRow,
}) => {
  // STATE
  const { refetch } = useGetApiKey();
  const { deleteApiKey } = useDeleteApiKey();
  const [isCopied, setIsCopied] = useState(false);
  const truncateKey = `${apiKey.key.substring(0, 8)}...${apiKey.key.substring(
    apiKey.key.length - 4,
  )}`;

  // MODAL
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDeleteMessage = async () => {
    setIsDeleteModalOpen(false);
    await toast.promise(deleteApiKey(apiKey.id), {
      loading: "Sedang menghapus api key",
      success: "Berhasil menghapus api key",
      error: err => err.message,
    });
    refetch();
  };

  // Fungsi untuk menyalin ke clipboard
  const copyToClipboard = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(apiKey.key);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <tr>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">
          {apiKey.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-mono">{truncateKey}</span>
            <button
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-blue-600"
              title="Copy API Key"
            >
              {isCopied ? (
                <HiCheck size={16} className="text-green-500" />
              ) : (
                <HiOutlineSquare2Stack size={16} />
              )}
            </button>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <span
            className={cn(
              "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800",
              !apiKey.is_active && "bg-red-100 text-red-800",
            )}
          >
            {apiKey.is_active ? "Aktif" : "Non-aktif"}
          </span>
        </td>
        <td className="whitespace-nowrap text-sm">
          <p className="text-base">{formatDate(apiKey.updated_at || "")}</p>
          <p className="text-xs">{formatTime(apiKey.updated_at || "")}</p>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button
            onClick={() => toggleExpandRow(apiKey.id)}
            className="text-blue-600 hover:text-blue-900"
          >
            {expandedRow === apiKey.id ? (
              <HiOutlineChevronUp size={16} />
            ) : (
              <HiChevronDown size={16} />
            )}
          </button>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
          <div className="flex gap-2">
            {/* EDIT BUTTON */}
            <Modal
              onClose={() => setIsEditModalOpen(false)}
              isOpen={isEditModalOpen}
              title="Edit Data"
            >
              <EditMessage
                apiKey={apiKey}
                onClose={() => setIsEditModalOpen(false)}
              />
            </Modal>
            <div className="tooltip tooltip-top" data-tip="Edit Data">
              <button
                className="btn btn-sm btn-warning"
                onClick={() => setIsEditModalOpen(true)}
              >
                <HiOutlinePencilSquare />
              </button>
            </div>
            {/* END EDIT BUTTON */}
            {/* DELETE BUTTON */}
            <Modal
              onClose={() => setIsDeleteModalOpen(false)}
              isOpen={isDeleteModalOpen}
              onlyQuestion
              onConfirm={onDeleteMessage}
              confirmButtonStyle="btn-error"
              onCancel={() => setIsDeleteModalOpen(false)}
              withHeader={false}
              containerStyle="max-w-md"
            />
            <div className="tooltip tooltip-top" data-tip="Hapus">
              <button
                className="btn btn-sm btn-error text-white"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <HiOutlineTrash />
              </button>
            </div>
            {/* END DELETE BUTTON */}
          </div>
        </td>
      </tr>
      {/* EXPANDED */}
      {expandedRow === apiKey.id && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-6 py-4">
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-1">API Key Lengkap:</p>
              <p className="font-mono bg-gray-100 p-2 rounded-md mb-2 break-all">
                {apiKey.key}
              </p>
              <div className="flex justify-between text-gray-500">
                <p>
                  Dibuat pada:{" "}
                  {new Date(apiKey.created_at || "").toLocaleString()}
                </p>
                <p>ID: {apiKey.id}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default RenderApiKey;
