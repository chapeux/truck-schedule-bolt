interface BarData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarData[];
  title: string;
}

export default function BarChart({ data, title }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 250;
  const barWidth = 80;
  const spacing = 40;
  const chartWidth = data.length * (barWidth + spacing) + 100;
  const padding = { top: 20, right: 40, bottom: 60, left: 60 };
  const plotHeight = chartHeight - padding.top - padding.bottom;

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <svg width="100%" height={chartHeight + 20} viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="min-w-[400px]">
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotHeight}
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={chartWidth - padding.right}
            y2={padding.top + plotHeight}
            stroke="#e5e7eb"
            strokeWidth="2"
          />

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + plotHeight * (1 - ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
                  {Math.round(maxValue * ratio)}
                </text>
              </g>
            );
          })}

          {data.map((item, i) => {
            const x = padding.left + i * (barWidth + spacing) + spacing;
            const barHeight = (item.value / maxValue) * plotHeight;
            const y = padding.top + plotHeight - barHeight;

            return (
              <g key={i}>
                <rect x={x} y={y} width={barWidth} height={barHeight} fill={item.color} rx="4" />
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#374151"
                >
                  {item.value}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={padding.top + plotHeight + 25}
                  textAnchor="middle"
                  fontSize="13"
                  fill="#6b7280"
                  fontWeight="500"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
