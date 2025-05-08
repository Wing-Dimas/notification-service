import React, { useEffect } from "react";
import Layout from "../../../components/layouts/Layout";
import { LuCircleAlert } from "react-icons/lu";
import { useJob } from "../../../zustand/useJob";
import EachUtils from "../../../components/EachUtils";
import RenderJob from "../components/RenderJob";
import ShowJobStatus from "../components/ShowJobStatus";
import useGetJob from "../hooks/useGetJob";

const JobPage: React.FC = () => {
  const { getJob } = useGetJob();
  const { data } = useJob();

  useEffect(() => {
    getJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <div className="p-4 lg:p-8">
        <h2 className="text-2xl font-semibold mb-4">Job Management</h2>

        <ShowJobStatus />

        {/* Job Cards - Responsive */}
        <div className="space-y-4">
          <EachUtils
            of={data}
            render={job => <RenderJob key={job.id} job={job} />}
          />
        </div>

        <div className="mt-6 p-3 md:p-4 border border-blue-200 bg-blue-50 rounded-md flex flex-col sm:flex-row items-start gap-3">
          <LuCircleAlert
            size={20}
            className="text-blue-500 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-sm text-blue-700 font-medium">Perhatian</p>
            <p className="text-sm text-blue-600 mt-1">
              Menonaktifkan job akan menghentikan semua eksekusi terjadwal. Job
              yang sedang berjalan akan diselesaikan terlebih dahulu.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobPage;
