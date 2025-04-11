import React, { useEffect } from "react";
import Layout from "../../../components/layouts/Layout";
import RenderMessage from "../components/RenderMessage";
import EachUtils from "../../../components/EachUtils";
import useGetDashboardData from "../hooks/useGetDashboardData";
import { formatCompactNumber } from "../../../libs/utils";
import { useSessionWA } from "../../../zustand/useSessionWA";
import WeaklyDataChart from "../components/WeaklyDataChart";
import DailyStatusMessageChart from "../components/DailyStatusMessageChart";

const DashboardPage: React.FC = () => {
  const { loading, data, getDashboardData } = useGetDashboardData();
  const { status: statusWA } = useSessionWA();

  useEffect(() => {
    getDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <div className="p-4 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stats cards */}
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Message</div>
              <div className="stat-value">
                {formatCompactNumber(data?.total || 0)}
              </div>
              <div className="stat-desc">Current</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Status WA</div>
              <div className="stat-value">{statusWA ? "ON" : "OFF"}</div>
            </div>
          </div>
        </div>
        {/* CHART */}

        <div className="mt-8 p-4 bg-base-100 rounded-lg shadow">
          <h1 className="text-2xl font-semibold mb-4">
            Grafik pesan masuk per minggu
          </h1>
          <WeaklyDataChart data={data?.weaklyData || []} />
        </div>

        <div className="mt-8 flex flex-wrap-reverse flex-row-reverse gap-4">
          {/* DAILY STATUS MESSAGE */}
          <div className=" min-w-[350px] flex flex-col">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Status Pengiriman Hari Ini
            </h2>
            <div className="flex-1 flex justify-center items-center">
              <div className="w-full">
                <DailyStatusMessageChart
                  data={data?.dailyStatusMessage || []}
                />
              </div>
            </div>
          </div>
          {/* END DAILY STATUS MESSAGE */}
          <div className="w-full lg:min-w-[568px] flex-1">
            {/* Recent Activity */}
            <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
              <table className="table table-zebra table-lg">
                <thead>
                  <tr>
                    <th>Payload</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Tanggal Terkirim</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <></>
                  ) : (
                    <EachUtils
                      of={data?.messages || []}
                      render={(message, index) => (
                        <RenderMessage message={message} key={index} />
                      )}
                    />
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* END RECENT ACTIVITY */}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
