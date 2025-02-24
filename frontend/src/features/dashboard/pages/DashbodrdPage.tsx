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
              <div className="stat-title">Total Users</div>
              <div className="stat-value">31K</div>
              <div className="stat-desc">Jan 1st - Feb 1st</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Revenue</div>
              <div className="stat-value">$45,600</div>
              <div className="stat-desc">↗︎ 400 (22%)</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Active Projects</div>
              <div className="stat-value">42</div>
              <div className="stat-desc">↘︎ 90 (14%)</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Satisfaction</div>
              <div className="stat-value">95%</div>
              <div className="stat-desc">↗︎ 2%</div>
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
                  <th>Name</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Project Alpha</td>
                  <td>
                    <div className="badge badge-success">Completed</div>
                  </td>
                  <td>Jan 23, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Beta</td>
                  <td>
                    <div className="badge badge-warning">In Progress</div>
                  </td>
                  <td>Jan 22, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Gamma</td>
                  <td>
                    <div className="badge badge-error">Delayed</div>
                  </td>
                  <td>Jan 21, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Gamma</td>
                  <td>
                    <div className="badge badge-error">Delayed</div>
                  </td>
                  <td>Jan 21, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Gamma</td>
                  <td>
                    <div className="badge badge-error">Delayed</div>
                  </td>
                  <td>Jan 21, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Gamma</td>
                  <td>
                    <div className="badge badge-error">Delayed</div>
                  </td>
                  <td>Jan 21, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Gamma</td>
                  <td>
                    <div className="badge badge-error">Delayed</div>
                  </td>
                  <td>Jan 21, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Gamma</td>
                  <td>
                    <div className="badge badge-error">Delayed</div>
                  </td>
                  <td>Jan 21, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Gamma</td>
                  <td>
                    <div className="badge badge-error">Delayed</div>
                  </td>
                  <td>Jan 21, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Gamma</td>
                  <td>
                    <div className="badge badge-error">Delayed</div>
                  </td>
                  <td>Jan 21, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Gamma</td>
                  <td>
                    <div className="badge badge-error">Delayed</div>
                  </td>
                  <td>Jan 21, 2024</td>
                  <td>
                    <button className="btn btn-xs">View</button>
                  </td>
                </tr>
                <tr>
                  <td>Project Gamma</td>
                  <td>
                    <div className="badge badge-error">Delayed</div>
                  </td>
                  <td>Jan 21, 2024</td>
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
