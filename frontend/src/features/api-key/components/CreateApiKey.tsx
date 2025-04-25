import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createApiKeyFormSchema,
  CreateApiKeyFormSchema,
} from "../form/create-api-key";
import ErrorText from "../../../components/input/ErrorText";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useGetApiKey from "../hooks/useGetApiKey";
import useCreateApiKey from "../hooks/useCreateApiKey";
import InputText from "../../../components/input/InputText";

interface CreateApiKeyProps {
  onClose: () => void;
}

const CreateApiKey: React.FC<CreateApiKeyProps> = ({ onClose }) => {
  const { refetch } = useGetApiKey();
  const { loading, createApiKey } = useCreateApiKey();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateApiKeyFormSchema>({
    resolver: zodResolver(createApiKeyFormSchema),
  });

  const onSubmit = async (data: CreateApiKeyFormSchema) => {
    onClose();

    await toast.promise(createApiKey(data), {
      loading: "Menyimpan...",
      success: () => {
        refetch();
        return "Sukses Menambahkan data";
      },
      error: err => err.message,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* INPUT NAME */}
        <div className="mb-4">
          <InputText type="text" labelTitle="Name" {...register("name")} />
          {!!errors.name?.message && (
            <ErrorText className="mt-2">{errors.name?.message}</ErrorText>
          )}
        </div>
        {/* END INPUT NAME */}

        <button
          type="submit"
          className="btn mt-2 w-full btn-success text-white"
          disabled={loading}
        >
          Tambah
          {loading && (
            <span className="loading loading-spinner loading-xs"></span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateApiKey;
