import React, { useEffect, useState } from "react";
import { IDashboardData } from "../../../types/dashboard";
import { pie, arc, PieArcDatum } from "d3";
import AnimatedSlice from "./AnimatedSlice";
import { delay } from "../../../libs/utils";
import AnimatedCount from "../../../components/AnimatedCount";
import { motion } from "framer-motion";
import { ClientTooltip, TooltipContent, TooltipTrigger } from "./ClientTolltip";

type DailyStatusMessageType = IDashboardData["dailyStatusMessage"][number];

interface IDailyStatusMessageChartProps {
  data: DailyStatusMessageType[];
  singleColor?: "purple" | "blue" | "fuchsia" | "yellow";
}

const DailyStatusMessageChart: React.FC<IDailyStatusMessageChartProps> = ({
  data,
  singleColor = "purple",
}) => {
  const [startAnimate, setStartAnimate] = useState(false);
  const total = data.reduce((acc, d) => acc + d.total, 0); // Calculate total for the center text

  const radius = 420; // Chart base dimensions
  const gap = 0.01; // Gap between slices
  const lightStrokeEffect = 10; // 3d light effect around the slice

  // Pie layout and arc generator
  const pieLayout = pie<DailyStatusMessageType>()
    .value(d => d.total)
    .padAngle(gap); // Creates a gap between slices

  // Adjust innerRadius to create a donut shape
  const innerRadius = radius / 1.625;
  const arcGenerator = arc<PieArcDatum<DailyStatusMessageType>>()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .cornerRadius(lightStrokeEffect + 2); // Apply rounded corners

  // Create an arc generator for the clip path that matches the outer path of the arc
  const arcClip =
    arc<PieArcDatum<DailyStatusMessageType>>()
      .innerRadius(innerRadius + lightStrokeEffect / 2)
      .outerRadius(radius)
      .cornerRadius(lightStrokeEffect + 2) || undefined;

  const labelRadius = radius * 0.825;
  const arcLabel = arc<PieArcDatum<DailyStatusMessageType>>()
    .innerRadius(labelRadius)
    .outerRadius(labelRadius);

  const arcs = pieLayout(data);

  // Calculate the angle for each slice
  function computeAngle(d: PieArcDatum<DailyStatusMessageType>) {
    return ((d.endAngle - d.startAngle) * 180) / Math.PI;
  }

  // Minimum angle to display text
  const minAngle = 20; // Adjust this value as needed

  const colors = {
    purple: ["#7e4cfe", "#895cfc", "#956bff", "#a37fff", "#b291fd", "#b597ff"],
    blue: [
      "#73caee",
      "#73caeeee",
      "#73caeedd",
      "#73caeecc",
      "#73caeebb",
      "#73caeeaa",
    ],
    fuchsia: [
      "#f6a3ef",
      "#f6a3efee",
      "#f6a3efdd",
      "#f6a3efcc",
      "#f6a3efbb",
      "#f6a3efaa",
    ],
    yellow: [
      "#f6e71f",
      "#f6e71fee",
      "#f6e71fdd",
      "#f6e71fcc",
      "#f6e71fbb",
      "#f6e71faa",
    ],
  }[singleColor];

  useEffect(() => {
    const animate = async () => {
      await delay(2000); // Delay before starting the animation
      setStartAnimate(true);
    };

    animate();

    return () => {
      setStartAnimate(false); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="relative">
      {/* Add a new div for centered text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.p
            className={`text-lg text-zinc-500`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
          >
            Total
          </motion.p>
          <p className={`text-4xl transition-colors duration-300 font-bold`}>
            <AnimatedCount value={total} />
          </p>
        </div>
      </div>
      <svg
        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className="max-w-[16rem] mx-auto overflow-visible"
      >
        {/* Define clip paths and colors for each slice */}
        <defs>
          {arcs.map((d, i) => (
            <clipPath key={`donut-c0-clip-${i}`} id={`donut-c0-clip-${i}`}>
              <path d={arcClip(d) || undefined} />
              <linearGradient key={i} id={`donut-c0-gradient-${i}`}>
                <stop offset="55%" stopColor={colors[i]} stopOpacity={0.95} />
              </linearGradient>
            </clipPath>
          ))}
        </defs>

        {startAnimate &&
          arcs.map((d, i) => {
            const angle = computeAngle(d);
            const centroid = arcLabel.centroid(d);
            if (d.endAngle > Math.PI) {
              centroid[0] += 10;
              centroid[1] += 0;
            } else {
              centroid[0] -= 10;
              centroid[1] -= 0;
            }

            return (
              <ClientTooltip key={i}>
                <TooltipTrigger>
                  <AnimatedSlice key={i} index={i}>
                    <g key={i}>
                      {/* Use the clip path on this group or individual path */}
                      <g clipPath={`url(#donut-c0-clip-${i})`}>
                        <path
                          fill={`url(#donut-c0-gradient-${i})`}
                          stroke="#ffffff33" // Lighter stroke for a 3D effect
                          strokeWidth={lightStrokeEffect} // Adjust stroke width for the desired effect
                          d={arcGenerator(d) || undefined}
                        />
                      </g>
                      {/* Labels with conditional rendering */}
                      <g opacity={angle > minAngle ? 1 : 0}>
                        <text
                          transform={`translate(${centroid})`}
                          textAnchor="middle"
                          fontSize={38}
                        >
                          <tspan y="-0.4em" fontWeight="600" fill={"#eee"}>
                            {d.data.category === "true" ? "Terkirim" : "Gagal"}
                          </tspan>
                          {angle > minAngle && (
                            <tspan
                              x={0}
                              y="0.7em"
                              fillOpacity={0.7}
                              fill={"#eee"}
                            >
                              {((d.data.total / total) * 100).toLocaleString(
                                "en-US",
                              )}
                              %
                            </tspan>
                          )}
                        </text>
                      </g>
                    </g>
                  </AnimatedSlice>
                </TooltipTrigger>
                <TooltipContent>
                  <div>{d.data.category === "true" ? "Terkirim" : "Gagal"}</div>
                  <div className="text-gray-500 text-sm">
                    {d.data.total.toLocaleString("en-US")}
                  </div>
                </TooltipContent>
              </ClientTooltip>
            );
          })}
      </svg>
    </div>
  );
};

export default DailyStatusMessageChart;
