import { useState } from "react";
import api from "../../../api";
import { toast } from "react-hot-toast";
import {
  DataType,
  PaginatorType,
  useTelegram,
} from "../../../zustand/useTelegram";
import { useSearchParams } from "react-router-dom";

const validSort = ["asc", "desc"];
const validOrder = [
  "created_at",
  "updated_at",
  "filename",
  "mime_type",
  "status",
];

const useGetMessageTelegram = () => {
  const [loading, setLoading] = useState(true);
  const { setData, setPaginator } = useTelegram();
  const [searchParams] = useSearchParams();

  const getMessageTelegram = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append(
        "page",
        parseInt(searchParams.get("page") as string).toString() || "1",
      );
      queryParams.append("search", searchParams.get("search") || "");
      queryParams.append(
        "order_by",
        validOrder.includes(searchParams.get("order_by") || "")
          ? (searchParams.get("order_by") as string)
          : "created_at",
      );
      queryParams.append(
        "sort",
        validSort.includes(searchParams.get("sort") || "")
          ? (searchParams.get("sort") as string)
          : "desc",
      );

      const res = await api.get(`/telegram/message?${queryParams.toString()}`);
      const data = res.data.data as DataType;
      const paginator = res.data.meta as PaginatorType;

      setData(data);
      setPaginator(paginator);
    } catch (error) {
      console.log(error);
      if (error) {
        toast.error(
          (error as { message: string; code: number })?.message ||
            "occured error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    getMessageTelegram();
  };

  return { loading, getMessageTelegram, refetch };
};

export default useGetMessageTelegram;
