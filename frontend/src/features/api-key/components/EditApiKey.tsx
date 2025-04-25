import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editApiKeyFormSchema,
  EditApiKeyFormSchema,
} from "../form/edit-api-key";
import ErrorText from "../../../components/input/ErrorText";
import { useForm } from "react-hook-form";
import Toggle from "../../../components/input/Toggle";
import useEditApiKey from "../hooks/useEditApiKey";
import toast from "react-hot-toast";
import useGetApiKey from "../hooks/useGetApiKey";
import { IApiKeyData } from "../../../types/api-key";
import InputText from "../../../components/input/InputText";

interface EditApiKeyProps {
  apiKey: IApiKeyData;
  onClose: () => void;
}

const EditApiKey: React.FC<EditApiKeyProps> = ({ apiKey, onClose }) => {
  const { refetch } = useGetApiKey();
  const { loading, editApiKey } = useEditApiKey();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditApiKeyFormSchema>({
    resolver: zodResolver(editApiKeyFormSchema),
    defaultValues: {
      name: apiKey.name,
      is_active: apiKey.is_active,
    },
  });

  const onSubmit = async (data: EditApiKeyFormSchema) => {
    onClose();

    await toast.promise(editApiKey(apiKey.id, data), {
      loading: "Menyimpan...",
      success: () => {
        refetch();
        return "Sukses memperbaruhi data";
      },
      error: err => err.message,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* INPUT NAME */}
        <div className="mb-4">
          <InputText labelTitle="Name" {...register("name")} />
          {!!errors.name?.message && (
            <ErrorText className="mt-2">{errors.name?.message}</ErrorText>
          )}
        </div>
        {/* END INPUT NAME */}
        {/* IS ACTIVE */}
        <div className="mb-4">
          <Toggle
            containerStyle="mt-4"
            labelTitle="Status"
            {...register("is_active")}
          />
          {!!errors.is_active?.message && (
            <ErrorText className="mt-2">{errors.is_active?.message}</ErrorText>
          )}
        </div>
        {/* END IS ACTIVE */}

        <button
          type="submit"
          className="btn mt-2 w-full btn-primary"
          disabled={loading}
        >
          Save
          {loading && (
            <span className="loading loading-spinner loading-xs"></span>
          )}
        </button>
      </form>
    </div>
  );
};

export default EditApiKey;
