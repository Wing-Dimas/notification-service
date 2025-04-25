import React, { useEffect, useState } from "react";
import Layout from "../../../components/layouts/Layout";
import EachUtils from "../../../components/EachUtils";
import Paginator from "../../../components/Paginator";
import RenderApiKey from "../components/RenderApiKey";
import ApiKeySkeleton from "../skeleton/ApiKeySkeleton";
import CreateApiKey from "../components/CreateApiKey";

import useGetApiKey from "../hooks/useGetApiKey";
import { useApiKey } from "../../../zustand/useApiKey";
import { useSearchParams } from "react-router-dom";
import Modal from "../../../components/Modal";
import { HiOutlinePlusCircle } from "react-icons/hi2";

const ApiKeyPage: React.FC = () => {
  const { getApiKey, loading } = useGetApiKey();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: apiKeys, setData, paginator } = useApiKey();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Fungsi untuk toggle expanded row
  const toggleExpandRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handlePageChange = (page: number) => {
    if (page === paginator.currentPage) return;
    setSearchParams(params => {
      params.set("page", page.toString());
      return params;
    });
  };

  useEffect(() => {
    getApiKey();

    return () => {
      setData([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <Layout>
      <div className="p-4 lg:p-8">
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold mb-4">Api Key Management</h2>

            <Modal
              onClose={() => setIsCreateModalOpen(false)}
              isOpen={isCreateModalOpen}
              title="Tambah Api Key"
            >
              <CreateApiKey onClose={() => setIsCreateModalOpen(false)} />
            </Modal>

            <button
              className="btn btn-sm btn-success text-white"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <HiOutlinePlusCircle className="w-5 h-5 " />
              Buat Api Key
            </button>
          </div>
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th className="px-6 tracking-wider">Nama</th>
                  <th className="px-6 tracking-wider">Api Key</th>
                  <th className="px-6 tracking-wider text-center">Status</th>
                  <th className="px-6 tracking-wider">Diupdate Pada</th>
                  <th className="px-6 tracking-wider">Detail</th>
                  <th className="px-6 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <ApiKeySkeleton />
                ) : (
                  <EachUtils
                    of={apiKeys}
                    render={(apiKey, index) => (
                      <RenderApiKey
                        apiKey={apiKey}
                        key={index}
                        expandedRow={expandedRow}
                        toggleExpandRow={toggleExpandRow}
                      />
                    )}
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

export default ApiKeyPage;
