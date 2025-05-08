import React from "react";
import { useDataTheme } from "../../../zustand/useDataTheme";
import { cn, diffForHumans } from "../../../libs/utils";
import { LuClock, LuHand, LuPause, LuPlay, LuRefreshCw } from "react-icons/lu";
import { IJobData } from "../../../types/job";
import useStartJob from "../hooks/useStartJob";
import useReloadJob from "../hooks/useReloadJob";
import useStopJob from "../hooks/useStopJob";

interface IRenderJob {
  job: IJobData;
}

const RenderJob: React.FC<IRenderJob> = ({ job }) => {
  const { dataTheme } = useDataTheme();
  const startHook = useStartJob();
  const reloadHook = useReloadJob();
  const stopHook = useStopJob();

  const isActive = job.is_active;

  return (
    <div key={job.id} className="card card-bordered bg-base-100 p-3 md:p-4">
      <div className="flex flex-col lg:flex-row lg:justify-between md:items-center gap-4">
        <div className="self-start flex-grow">
          <div className="flex items-center">
            <h3 className="font-medium ">{job.name}</h3>
            <span
              className={cn(
                "ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800",
                !(job.type === "SCHEDULE") && "bg-yellow-100 text-yellow-800",
              )}
            >
              {job.type === "SCHEDULE" ? (
                <LuClock size={12} className="mr-1" />
              ) : (
                <LuHand size={12} className="mr-1" />
              )}
              {job.type === "SCHEDULE" ? "Schedule" : "Manual"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs ">
              Last run: {diffForHumans(job.last_run_at)}
            </span>
            {job.type === "SCHEDULE" && (
              <span className="text-xs ">
                Next run: {job.next_run_at && diffForHumans(job.next_run_at)}
              </span>
            )}
          </div>
        </div>
        <div className="flex w-full sm:w-auto items-center self-center lg:self-end">
          <div className="flex items-center w-full sm:w-auto">
            <div className="join w-full sm:w-auto join-vertical md:join-horizontal">
              <button
                className={cn(
                  "btn btn-xs md:btn-sm join-item bg-green-100 text-green-700 hover:bg-green-200 hover:border-green-700 border-green-700 disabled:bg-transparent",
                  dataTheme === "dark"
                    ? "disabled:border-gray-700"
                    : "disabled:border-gray-400 bg-green-100 ",
                )}
                disabled={isActive || startHook.loading}
                onClick={() => startHook.startJob(job.name)}
              >
                <LuPlay className="size-3 md:size-4" />
                <span>Start</span>
              </button>
              <button
                className={cn(
                  "btn btn-xs md:btn-sm join-item text-red-700 hover:bg-red-200 hover:border-red-700 border-red-700 disabled:bg-transparent",
                  dataTheme === "dark"
                    ? "disabled:border-gray-700 bg-red-50"
                    : "disabled:border-gray-400 bg-red-100 ",
                )}
                disabled={!isActive || stopHook.loading}
                onClick={() => stopHook.stopJob(job.name)}
              >
                <LuPause className="size-3 md:size-4" />
                <span className="">Stop</span>
              </button>
              <button
                className={cn(
                  "btn btn-xs md:btn-sm join-item bg-blue-100 hover:bg-blue-100 text-blue-600 border-blue-600 hover:border-blue-700 disabled:bg-transparent",
                  dataTheme === "dark"
                    ? "disabled:border-gray-700 "
                    : "disabled:border-gray-400 bg-blue-50",
                )}
                disabled={reloadHook.loading}
                onClick={() => reloadHook.reloadJob(job.name)}
              >
                <LuRefreshCw className="size-3 md:size-4" />
                <span className="">Reload</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenderJob;
