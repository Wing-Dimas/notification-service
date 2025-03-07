import React, { useState } from "react";
import { cn, validateJson } from "../libs/utils";

type PayloadRenderedType = {
  payload: string;
} & React.HTMLAttributes<HTMLDivElement>;

const PayloadRendered: React.FC<PayloadRenderedType> = ({ payload, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (payload === null || payload === undefined) {
    return <span className="text-gray-500">-</span>;
  }

  // Coba parsing JSON
  let parsedPayload = payload;
  const isJson = validateJson(payload);
  if (isJson) {
    parsedPayload = JSON.parse(payload);
  }

  // Konversi payload ke string untuk ditampilkan
  const payloadString = isJson ? JSON.stringify(parsedPayload, null, 2) : String(parsedPayload);

  // Batasi panjang tampilan
  const MAX_PREVIEW_LENGTH = 100;
  const isLong = payloadString.length > MAX_PREVIEW_LENGTH || isJson;

  return (
    <div className={cn("w-[250px] max-w-[250px]", className)}>
      <pre
        className={cn("text-xs p-1 rounded w-full relative", isExpanded ? "max-h-[150px] overflow-y-auto" : "truncate")}
      >
        {isExpanded ? payloadString : payloadString.slice(0, MAX_PREVIEW_LENGTH) + (isLong ? "..." : "")}
      </pre>

      {isLong && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-blue-600 hover:underline mt-1">
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      )}
    </div>
  );
};

export default PayloadRendered;
