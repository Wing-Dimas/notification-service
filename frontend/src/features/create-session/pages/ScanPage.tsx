import React, { useState } from "react";
import Layout from "../../../components/layouts/Layout";
import useListenQrcode from "../hooks/useListenQrcode";
import RuleTemplate from "../components/RuleTemplate";
import { useSessionWA } from "../../../zustand/useSessionWA";

const ScanPage: React.FC = () => {
  const { status } = useSessionWA();
  const { qrcode } = useListenQrcode();
  const [loading, setLoading] = useState(true);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row p-4 lg:p-8 gap-4">
        <RuleTemplate />

        {/* MOCKUP PHONE */}
        <div className="flex-1 flex justify-center lg:mt-0 mt-8">
          <div className="mockup-phone">
            <div className="camera"></div>
            <div className="display">
              <div className="artboard artboard-demo phone-1">
                {status ? (
                  <div className="text-center">
                    <img src="/check.svg" alt="" />
                    <p className="text-sm">Session Berhasil dibuat</p>
                  </div>
                ) : qrcode ? (
                  <img src={qrcode} alt="qrcode" />
                ) : (
                  <span className="loading loading-spinner text-primary loading-lg"></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ScanPage;
