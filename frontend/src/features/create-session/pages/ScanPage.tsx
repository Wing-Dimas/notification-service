import React from "react";
import Layout from "../../../components/layouts/Layout";
import useListenQrcode from "../hooks/useListenQrcode";
import useCreateSession from "../hooks/useCreateSession";
import RuleTemplate from "../components/RuleTemplate";

const ScanPage: React.FC = () => {
  const { loading, createSession } = useCreateSession();
  const { qrcode } = useListenQrcode();

  console.log(loading);

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
                {qrcode ? (
                  <img src={qrcode} alt="qrcode" />
                ) : loading ? (
                  <span className="loading loading-spinner text-primary loading-lg"></span>
                ) : (
                  <button className="btn btn-outline" onClick={() => createSession()}>
                    Create Session
                  </button>
                )}
                {/* <HiMiniQrCode className="w-32 h-32" /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ScanPage;
