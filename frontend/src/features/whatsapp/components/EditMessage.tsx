import React from "react";
import { HistoryMessageWA } from "../../../types/whatsapp";
import PayloadRendered from "../../../components/PayloadRendered";
import { zodResolver } from "@hookform/resolvers/zod";
import { editMessageFormSchema, EditMessageFormSchema } from "../form/edit-message";
import { getFileCategory, validateJson } from "../../../libs/utils";
import ErrorText from "../../../components/input/ErrorText";
import { useForm } from "react-hook-form";
import TextAreaInput from "../../../components/input/TextAreaInput";
import InputFile from "../../../components/input/InputFile";
import FilePreview from "../../../components/FilePreview";
import useEditMessageWA from "../hooks/useEditMessageWA";
import toast from "react-hot-toast";
import useGetMessageWA from "../hooks/useGetMessageWA";

interface EditMessageProps {
  message: HistoryMessageWA;
  onClose: () => void;
}

const EditMessage: React.FC<EditMessageProps> = ({ message, onClose }) => {
  const { refetch } = useGetMessageWA();
  const { loading, editMessageWA } = useEditMessageWA();

  let parsedPayload;
  const isJson = validateJson(message.payload);
  if (isJson) parsedPayload = JSON.parse(message.payload);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EditMessageFormSchema>({
    resolver: zodResolver(editMessageFormSchema),
    defaultValues: {
      message: isJson ? parsedPayload.message : message.payload,
      file: undefined,
    },
  });

  const selectedFile = watch("file")?.[0];

  const onSubmit = async (data: EditMessageFormSchema) => {
    // Membuat objek FormData untuk pengiriman data
    const formData = new FormData();
    formData.append("message", data.message);
    // Memeriksa apakah file ada sebelum menambahkannya ke FormData
    if (data.file && data.file.length > 0) {
      const file = data.file[0];
      formData.append("file", file);
    }
    onClose();

    await toast.promise(editMessageWA(message.id, formData), {
      loading: "Meyimpan...",
      success: () => {
        refetch();
        return "Sukses memperbaruhi data";
      },
      error: (err) => err.message,
    });
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) return size + " bytes";
    else if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
    else return (size / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div>
      <div className="mb-8 bg-base-200 p-2">
        <p className="font-bold mb-2">Payload</p>
        <PayloadRendered payload={message.payload} className="max-w-full w-full" />
      </div>

      <h2 className="font-semibold">Perbaiki Data</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <TextAreaInput type="message" containerStyle="mt-4" labelTitle="Message" {...register("message")} />
          {!!errors.message?.message && <ErrorText className="mt-2">{errors.message?.message}</ErrorText>}
        </div>
        <div className="mb-4">
          <InputFile containerStyle="mt-4" labelTitle="File (opsional)" {...register("file")} />
          {!!errors.file?.message && <ErrorText className="mt-2">{errors.file?.message}</ErrorText>}
          <div className="mt-2">
            <p className="text-xs">Format yang didukung:</p>
            <p className="text-xs">• Gambar: JPG, PNG, GIF, WebP, SVG</p>
            <p className="text-xs">• Video: MP4, WebM, OGG, MOV, AVI, MKV</p>
            <p className="text-xs">• Dokumen: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, ZIP</p>
          </div>
          {selectedFile && (
            <>
              <div className="mt-2 p-3 bg-base-200 rounded-md">
                <h4 className="font-medium">Informasi File:</h4>
                <p className="text-sm">Nama: {selectedFile.name}</p>
                <p className="text-sm">
                  Tipe: {getFileCategory(selectedFile.type)} ({selectedFile.type || "Tidak terdeteksi"})
                </p>
                <p className="text-sm">Ukuran: {formatFileSize(selectedFile.size)}</p>
              </div>

              <div className="mt-2 p-3">
                <h4 className="font-medium">Preview:</h4>
                <FilePreview file={selectedFile} />
              </div>
            </>
          )}
        </div>

        <button type="submit" className="btn mt-2 w-full btn-primary" disabled={loading}>
          Save
          {loading && <span className="loading loading-spinner loading-xs"></span>}
        </button>
      </form>
    </div>
  );
};

export default EditMessage;
