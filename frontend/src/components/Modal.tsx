import React, { forwardRef } from "react";
import { cn } from "../libs/utils";
import { HiOutlineExclamationCircle, HiOutlineXMark } from "react-icons/hi2";

type ModalProps = {
  title?: string;
  onClose: () => void;
  isOpen: boolean;
  withHeader?: boolean;
  containerStyle?: string;
  onlyQuestion?: boolean;
  questionText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmButtonText?: string;
  confirmButtonStyle?: string;
  cancelButtonText?: string;
  cancelButtonStyle?: string;
} & React.HTMLAttributes<HTMLElement>;

const Modal = forwardRef<HTMLElement, ModalProps>(
  (
    {
      title = "Modal",
      children,
      className,
      isOpen,
      onlyQuestion = false,
      questionText = "Apakah kamu yakin?",
      withHeader = true,
      onConfirm = () => {},
      onCancel = () => {},
      confirmButtonText = "Confirm",
      confirmButtonStyle,
      cancelButtonText = "Cancel",
      cancelButtonStyle,
      containerStyle,
      onClose,
      ...props
    },
    ref
  ) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className={cn(
            "bg-base-100 rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto",
            containerStyle
          )}
        >
          {withHeader && (
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button className="btn btn-ghost" onClick={onClose}>
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>
          )}
          {onlyQuestion ? (
            <section ref={ref} className={cn("p-4", className)} {...props}>
              <HiOutlineExclamationCircle className={cn(`w-32 h-32 mx-auto text-warning`)} />

              <p className="text-center">{questionText}</p>
              <div className="flex gap-2 justify-center mt-8">
                <button className={cn("btn text-white", confirmButtonStyle)} onClick={onConfirm}>
                  {confirmButtonText}
                </button>
                <button className={cn("btn btn-outline ", cancelButtonStyle)} onClick={onCancel}>
                  {cancelButtonText}
                </button>
              </div>
            </section>
          ) : (
            <section ref={ref} className={cn("p-4", className)} {...props}>
              {children}
            </section>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export default Modal;
