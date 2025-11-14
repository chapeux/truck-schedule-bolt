interface PieData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface PieChartProps {
  data: PieData[];
  title: string;
}

export default function PieChart({ data, title }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = 150;
  const centerY = 120;
  const radius = 80;

  if (total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  let currentAngle = -90;
  const slices = data.map((item) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    currentAngle = endAngle;

    return {
      ...item,
      pathData,
      startAngle,
      endAngle,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <svg width="300" height="240" viewBox="0 0 300 240">
          {slices.map((slice, i) => (
            <g key={i}>
              <path d={slice.pathData} fill={slice.color} stroke="white" strokeWidth="2" />
            </g>
          ))}
        </svg>

        <div className="flex-1 space-y-3">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-800">{item.value}</div>
                <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Total</span>
              <span className="text-sm font-bold text-gray-800">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
