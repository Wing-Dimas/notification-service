import React, { useMemo } from "react";
import { LuClock, LuHand } from "react-icons/lu";
import { useJob } from "../../../zustand/useJob";

const ShowJobStatus: React.FC = () => {
  const { data } = useJob();

  const totalRunning = useMemo(
    () => data.reduce((acc, job) => acc + (job.is_active ? 1 : 0), 0),
    [data],
  );

  const totalScheduled = useMemo(
    () => data.reduce((acc, job) => acc + (job.type === "SCHEDULE" ? 1 : 0), 0),
    [data],
  );

  const totalManual = useMemo(
    () => data.reduce((acc, job) => acc + (job.type === "MANUAL" ? 1 : 0), 0),
    [data],
  );

  return (
    <div className="p-3 md:p-4 rounded-md mb-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{totalRunning}</span> jobs running
          </p>
        </div>
        <div className="flex items-center">
          <LuClock size={14} className="text-gray-500 mr-2" />
          <p className="text-sm text-gray-600">
            <span className="font-medium">{totalScheduled}</span> scheduled
          </p>
        </div>
        <div className="flex items-center">
          <LuHand size={14} className="text-gray-500 mr-2" />
          <p className="text-sm text-gray-600">
            <span className="font-medium">{totalManual}</span> manual
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShowJobStatus;
