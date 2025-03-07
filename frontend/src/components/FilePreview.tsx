import React, { useState } from "react";
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES } from "../constants/valid-file-upload";

interface FilePreviewProps {
  file: File;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const fileURL = URL.createObjectURL(file);
  const [previewError, setPreviewError] = useState(false);

  // Handler untuk error saat loading preview
  const handlePreviewError = () => {
    setPreviewError(true);
  };

  const fileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return (
        <svg
          className="w-10 h-10 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      );
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return (
        <svg
          className="w-10 h-10 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      );
    } else if (fileType.includes("sheet") || fileType.includes("excel")) {
      return (
        <svg
          className="w-10 h-10 text-green-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1.99 6H7V7h10.01v2zm0 4H7v-2h10.01v2zm-3 4H7v-2h7.01v2z" />
        </svg>
      );
    } else if (fileType.includes("presentation") || fileType.includes("powerpoint")) {
      return (
        <svg
          className="w-10 h-10 text-orange-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      );
    } else if (fileType.includes("zip")) {
      return (
        <svg
          className="w-10 h-10 text-yellow-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 12H6v-2h8v2zm0-4H6v-2h8v2zm0-4H6V8h8v2z" />
        </svg>
      );
    } else if (fileType.includes("text") || fileType.includes("plain")) {
      return (
        <svg
          className="w-10 h-10 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-10 h-10 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
        </svg>
      );
    }
  };

  // Render preview berdasarkan tipe file
  if (ACCEPTED_IMAGE_TYPES.includes(file.type) && !previewError) {
    return (
      <div className="mt-2 border rounded-md overflow-hidden">
        <img
          src={fileURL}
          alt={file.name}
          className="max-w-full h-auto max-h-64 mx-auto"
          onError={handlePreviewError}
        />
      </div>
    );
  } else if (ACCEPTED_VIDEO_TYPES.includes(file.type) && !previewError) {
    return (
      <div className="mt-2 border rounded-md overflow-hidden">
        <video src={fileURL} controls className="max-w-full h-auto max-h-64 mx-auto" onError={handlePreviewError} />
      </div>
    );
  } else if (file.type === "application/pdf" && !previewError) {
    return (
      <div className="mt-2 border rounded-md overflow-hidden h-64">
        <object data={fileURL} type="application/pdf" width="100%" height="100%" onError={handlePreviewError}>
          <div className="p-4 flex flex-col items-center justify-center">
            {fileIcon(file.type)}
            <p className="mt-2 text-sm text-center">
              PDF tidak dapat ditampilkan,{" "}
              <a href={fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                klik di sini
              </a>{" "}
              untuk membuka.
            </p>
          </div>
        </object>
      </div>
    );
  } else {
    // Untuk file lain yang tidak dapat di-preview
    return (
      <div className="mt-2 p-4 border rounded-md flex flex-col items-center justify-center">
        {fileIcon(file.type)}
        <p className="mt-2 text-sm text-center">Preview tidak tersedia untuk tipe file ini</p>
        <a href={fileURL} download={file.name} className="mt-2 text-sm text-blue-500 hover:underline">
          Download File
        </a>
      </div>
    );
  }
};

export default FilePreview;
