import React from "react";
import { HiMiniEllipsisVertical } from "react-icons/hi2";

const RuleTemplate: React.FC = () => {
  return (
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
        🧩 Ketuk Perangkat Tertaut lalu Tautkan Perangkat <span className="font-semibold"> WhatsApp</span> di telepon
        anda
      </p>
      <p className="py-2">
        🧩 Arahkan telepon Anda ke layar ini untuk memindai kode QR
        <span className="font-semibold"> WhatsApp</span> di telepon anda
      </p>
      <p className="py-2">
        🧩 <span className="font-semibold">Scan</span> kode QR yang ada disamping untuk membuat session pada WhatsApp
      </p>
      <p className="py-2">
        🧩 <span className="font-semibold">Public API</span> akan langusng mengirim pesan ke nomor anda
      </p>
      <p className="py-2">
        🧩 Pastikan nomor anda terhubung dengan<span className="font-semibold">WhatsApp Gateaway</span>
      </p>
    </div>
  );
};

export default RuleTemplate;
