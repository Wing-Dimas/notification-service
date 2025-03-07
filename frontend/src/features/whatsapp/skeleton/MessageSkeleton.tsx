import React from "react";

const MessageSkeleton: React.FC = () => {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
        <tr key={item}>
          <td>
            <div className="skeleton h-8 w-40"></div>
          </td>
          <td>
            <div className="skeleton h-6 w-20"></div>
          </td>
          <td>
            <div className="skeleton h-6 w-24"></div>
          </td>
          <td>
            <div className="skeleton h-8 w-8 rounded-btn"></div>
          </td>
          <td>
            <div className="flex gap-2">
              <div className="skeleton h-8 w-8 rounded-btn"></div>
              <div className="skeleton h-8 w-8 rounded-btn"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default MessageSkeleton;
