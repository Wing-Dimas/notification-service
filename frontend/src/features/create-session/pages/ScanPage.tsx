import React from "react";
import Layout from "../../../components/layouts/Layout";
import { HiMiniEllipsisVertical, HiMiniQrCode } from "react-icons/hi2";

const ScanPage: React.FC = () => {
  return (
    <Layout>
      <div className="flex flex-col lg:flex-row p-4 lg:p-8 gap-4">
        <div className="flex-1 self-center">
          <h2 className="text-2xl mt-8 font-bold mb-8">Information</h2>
          <p className="py-2">
            🧩 Buka <span className="font-semibold">WhatsApp</span> di telepon anda
          </p>
          <p className="py-2">
            🧩 Ketuk Menu <HiMiniEllipsisVertical className="inline-block text-primary badge-ghost" />
            <span className="font-semibold"> WhatsApp di telepon anda</span>
          </p>
          <p className="py-2">
            🧩 Ketuk Perangkat Tertaut lalu Tautkan Perangkat <span className="font-semibold"> WhatsApp</span> di
            telepon anda
          </p>
          <p className="py-2">
            🧩 Arahkan telepon Anda ke layar ini untuk memindai kode QR
            <span className="font-semibold"> WhatsApp</span> di telepon anda
          </p>
          <p className="py-2">
            🧩 <span className="font-semibold">Scan</span> kode QR yang ada disamping untuk membuat session pada
            WhatsApp
          </p>
          <p className="py-2">
            🧩 <span className="font-semibold">Public API</span> akan langusng mengirim pesan ke nomor anda
          </p>
          <p className="py-2">
            🧩 Pastikan nomor anda terhubung dengan<span className="font-semibold">WhatsApp Gateaway</span>
          </p>
        </div>
        <div className="flex-1 flex justify-center lg:mt-0 mt-8">
          <div className="mockup-phone">
            <div className="camera"></div>
            <div className="display">
              <div className="artboard artboard-demo phone-1">
                <span className="loading loading-spinner text-primary loading-lg"></span>
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
