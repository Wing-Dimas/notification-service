import React from "react";

const TemplatePointers: React.FC = () => {
  return (
    <>
      <h1 className="text-2xl mt-8 font-bold">Notification Services Features</h1>

      <p className="py-2">
        ✓ <span className="font-semibold">Scan</span> to connect your devices
      </p>
      <p className="py-2">
        ✓ <span className="font-semibold">Public API</span> to send notifications
      </p>

      {/* <p className="py-2 mt-4">
        ✓ <span className="font-semibold">Light/dark</span> mode toggle
      </p> */}
    </>
  );
};

export default TemplatePointers;
