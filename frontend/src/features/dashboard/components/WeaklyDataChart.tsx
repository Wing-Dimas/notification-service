import React from "react";
import {
  scaleTime,
  scaleLinear,
  line as d3line,
  max,
  // bisector,
  area as d3area,
  curveMonotoneX,
} from "d3";
import { CSSProperties } from "react";
import { IDashboardData } from "../../../types/dashboard";
import AnimatedArea from "./AnimatedArea";
import { ClientTooltip, TooltipContent, TooltipTrigger } from "./ClientTolltip";
import { cn } from "../../../libs/utils";
import { useDataTheme } from "../../../zustand/useDataTheme";

interface IWeaklyDataChartProps {
  data: IDashboardData["weaklyData"];
}

const WeaklyDataChart: React.FC<IWeaklyDataChartProps> = ({ data }) => {
  const { dataTheme } = useDataTheme();
  const isDarkTheme = dataTheme === "dark";

  if (!data || data.length === 0) return null;

  const dataWithDate = data.map(d => ({ ...d, date: new Date(d.date) }));

  const xScale = scaleTime()
    .domain([dataWithDate[0].date, dataWithDate[dataWithDate.length - 1].date])
    .range([0, 100]);

  const yScale = scaleLinear()
    .domain([0, max(dataWithDate.map(d => d.value)) ?? 0])
    .range([100, 0]);

  const line = d3line<(typeof dataWithDate)[number]>()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .curve(curveMonotoneX);

  // Area generator
  const area = d3area<(typeof dataWithDate)[number]>()
    .x(d => xScale(d.date))
    .y0(yScale(0))
    .y1(d => yScale(d.value))
    .curve(curveMonotoneX);

  const areaPath = area(dataWithDate) ?? undefined;

  const d = line(dataWithDate);

  if (!d) {
    return null;
  }

  return (
    <div
      className="relative h-72 w-full"
      style={
        {
          "--marginTop": "0px",
          "--marginRight": "0px",
          "--marginBottom": "0px",
          "--marginLeft": "25px",
        } as CSSProperties
      }
    >
      {/* Chart area */}
      <svg
        className="absolute inset-0
      h-[calc(100%-var(--marginTop)-var(--marginBottom))]
      w-full
      translate-y-[var(--marginTop)]
      overflow-visible"
      >
        <svg
          viewBox="0 0 100 100"
          className="overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradient definition */}
            <linearGradient id="semiAreaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                className={
                  isDarkTheme ? "text-yellow-900/20" : "text-yellow-500/20"
                }
                stopColor="currentColor"
              />
              <stop
                offset="90%"
                className={
                  isDarkTheme ? "text-yellow-900/5" : "text-yellow-50/5"
                }
                stopColor="currentColor"
              />
            </linearGradient>
          </defs>

          {/* Area */}
          <AnimatedArea>
            <path d={areaPath || ""} fill="url(#semiAreaGradient)" />

            {/* Line */}
            <path
              d={d}
              fill="none"
              className={isDarkTheme ? "text-yellow-600" : "text-yellow-400"}
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </AnimatedArea>

          {/* Invisible Tooltip Area */}
          {dataWithDate.map((d, index) => (
            <ClientTooltip key={index}>
              <TooltipTrigger>
                <g className="group/tooltip">
                  {/* Tooltip Line */}
                  <line
                    x1={xScale(d.date)}
                    y1={0}
                    x2={xScale(d.date)}
                    y2={100}
                    stroke="currentColor"
                    strokeWidth={1}
                    className={cn(
                      "opacity-0 group-hover/tooltip:opacity-100 transition-opacity",
                      isDarkTheme ? "text-zinc-700" : "text-zinc-300",
                    )}
                    vectorEffect="non-scaling-stroke"
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Invisible area closest to a specific point for the tooltip trigger */}
                  <rect
                    x={(() => {
                      const prevX =
                        index > 0
                          ? xScale(dataWithDate[index - 1].date)
                          : xScale(d.date);
                      return (prevX + xScale(d.date)) / 2;
                    })()}
                    y={0}
                    width={(() => {
                      const prevX =
                        index > 0
                          ? xScale(dataWithDate[index - 1].date)
                          : xScale(d.date);
                      const nextX =
                        index < dataWithDate.length - 1
                          ? xScale(dataWithDate[index + 1].date)
                          : xScale(d.date);
                      const leftBound = (prevX + xScale(d.date)) / 2;
                      const rightBound = (xScale(d.date) + nextX) / 2;
                      return rightBound - leftBound;
                    })()}
                    height={100}
                    fill="transparent"
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <div
                  className={isDarkTheme ? "text-zinc-300" : "text-zinc-800"}
                >
                  {d.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })}
                </div>
                <div className="text-sm text-gray-500">
                  {d.value.toLocaleString("en-US")} message
                </div>
              </TooltipContent>
            </ClientTooltip>
          ))}
        </svg>

        {/* Y axis */}
        <svg
          className="absolute inset-0
      h-[calc(100%-var(--marginTop)-var(--marginBottom))]
      translate-y-[var(--marginTop)]
      overflow-visible
    "
        >
          <g className="translate-x-[98%]">
            {yScale
              .ticks(8)
              .map(yScale.tickFormat(8, "d"))
              .map((value, i) => {
                if (i < 1) return;
                return (
                  <text
                    key={i}
                    y={`${yScale(+value)}%`}
                    alignmentBaseline="middle"
                    textAnchor="end"
                    className={cn(
                      "text-xs tabular-nums text-zinc-500",
                      // isDarkTheme ? "text-white" : "text-zinc-900",
                    )}
                    fill="currentColor"
                  >
                    {value}
                  </text>
                );
              })}
          </g>
        </svg>
        {/* X axis */}
        <svg
          className="absolute inset-0
      h-[calc(100%-var(--marginTop))]
      w-[calc(100%-var(--marginLeft)-var(--marginRight))]
      translate-x-[var(--marginLeft)]
      translate-y-[var(--marginTop)]
      overflow-visible
    "
        >
          {dataWithDate.map((day, i) => {
            return (
              <g
                key={i}
                className={cn(
                  "overflow-visible -translate-y-3 text-zinc-500",
                  // isDarkTheme ? "text-white" : "text-zinc-500",
                )}
              >
                <text
                  x={`${xScale(day.date)}%`}
                  y="100%"
                  textAnchor={
                    i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"
                  }
                  fill="currentColor"
                  className="xs:inline hidden text-sm"
                >
                  {day.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
                <text
                  x={`${xScale(day.date)}%`}
                  y="100%"
                  textAnchor={
                    i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"
                  }
                  fill="currentColor"
                  className="xs:hidden text-xs"
                >
                  {day.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
              </g>
            );
          })}
        </svg>
      </svg>
    </div>
  );
};

export default WeaklyDataChart;
