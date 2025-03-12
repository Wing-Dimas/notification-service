import React, { useEffect } from "react";
import Layout from "../../../components/layouts/Layout";
import useGetMessageWA from "../hooks/useGetMessageWA";
import { useWhatsapp } from "../../../zustand/useWhatsapp";
import EachUtils from "../../../components/EachUtils";
import Paginator from "../../../components/Paginator";
import { useSearchParams } from "react-router-dom";
import MessageSkeleton from "../skeleton/MessageSkeleton";
import RenderMessage from "../components/RenderMessage";

const WhatsappPage: React.FC = () => {
  const { getMessageWA, loading } = useGetMessageWA();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: messages, setData, paginator } = useWhatsapp();

  const handlePageChange = (page: number) => {
    if (page === paginator.currentPage) return;
    setSearchParams((params) => {
      params.set("page", page.toString());
      return params;
    });
  };

  useEffect(() => {
    getMessageWA();

    return () => {
      setData([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <Layout>
      <div className="p-4 lg:p-8">
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">History Message</h2>
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table table-zebra table-lg">
              <thead>
                <tr>
                  <th>Payload</th>
                  <th>Status</th>
                  <th>Tanggal Terkirim</th>
                  <th>File</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <MessageSkeleton />
                ) : (
                  <EachUtils
                    of={messages}
                    render={(message, index) => <RenderMessage message={message} key={index} />}
                  />
                )}
              </tbody>
            </table>
          </div>
          <Paginator paginator={paginator} onPageChange={handlePageChange} />
        </div>
      </div>
    </Layout>
  );
};

export default WhatsappPage;
