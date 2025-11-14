import { useMemo } from 'react';

interface DataPoint {
  date: string;
  count: number;
}

interface LineChartProps {
  data: DataPoint[];
  title: string;
}

export default function LineChart({ data, title }: LineChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { maxValue: 0, points: [], labels: [] };

    const maxValue = Math.max(...data.map((d) => d.count), 1);
    const chartHeight = 200;
    const chartWidth = 600;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * plotWidth;
      const y = padding.top + plotHeight - (d.count / maxValue) * plotHeight;
      return { x, y, count: d.count };
    });

    const labels = data.map((d, i) => {
      const date = new Date(d.date + 'T00:00:00');
      const x = padding.left + (i / (data.length - 1 || 1)) * plotWidth;
      return {
        x,
        text: `${date.getDate()}/${date.getMonth() + 1}`,
      };
    });

    return { maxValue, points, labels, padding, plotHeight };
  }, [data]);

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

  const pathD = chartData.points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <svg width="100%" height="240" viewBox="0 0 600 240" className="min-w-[600px]">
          <line
            x1={chartData.padding.left}
            y1={chartData.padding.top}
            x2={chartData.padding.left}
            y2={chartData.padding.top + chartData.plotHeight}
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <line
            x1={chartData.padding.left}
            y1={chartData.padding.top + chartData.plotHeight}
            x2={600 - chartData.padding.right}
            y2={chartData.padding.top + chartData.plotHeight}
            stroke="#e5e7eb"
            strokeWidth="2"
          />

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartData.padding.top + chartData.plotHeight * (1 - ratio);
            return (
              <g key={ratio}>
                <line
                  x1={chartData.padding.left}
                  y1={y}
                  x2={600 - chartData.padding.right}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <text x={chartData.padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
                  {Math.round(chartData.maxValue * ratio)}
                </text>
              </g>
            );
          })}

          <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" />

          {chartData.points.map((point, i) => (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r="5" fill="#3b82f6" />
              <circle cx={point.x} cy={point.y} r="3" fill="white" />
            </g>
          ))}

          {chartData.labels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={chartData.padding.top + chartData.plotHeight + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {label.text}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
