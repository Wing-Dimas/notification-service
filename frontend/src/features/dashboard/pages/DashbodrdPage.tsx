import React from "react";
import Layout from "../../../components/layouts/Layout";

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="p-4 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stats cards */}
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Total Message</div>
              <div className="stat-value">100K</div>
              <div className="stat-desc">Current</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Status</div>
              <div className="stat-value">ON</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Any Question?</td>
                  <td>document</td>
                  <td>
                    <div className="badge badge-success">Success</div>
                  </td>
                  <td>Jan 23, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Any Question?</td>
                  <td>document</td>
                  <td>
                    <div className="badge badge-error">Failed</div>
                  </td>
                  <td>Jan 23, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
