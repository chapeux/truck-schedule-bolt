import { useMemo } from 'react';
import { TruckLoading } from '../lib/supabase';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import { getLoadingsByDay, getStatusCounts, getStatusPercentages } from '../utils/chartUtils';

interface GraficosPageProps {
  loadings: TruckLoading[];
}

export default function GraficosPage({ loadings }: GraficosPageProps) {
  const dailyData = useMemo(() => getLoadingsByDay(loadings), [loadings]);
  const statusCounts = useMemo(() => getStatusCounts(loadings), [loadings]);
  const statusPercentages = useMemo(() => getStatusPercentages(statusCounts), [statusCounts]);

  const barData = [
    { label: 'Pendentes', value: statusCounts.pending, color: '#3b82f6' },
    { label: 'Concluídos', value: statusCounts.completed, color: '#10b981' },
    { label: 'Cancelados', value: statusCounts.cancelled, color: '#ef4444' },
  ];

  const pieData = statusPercentages.map((item) => ({
    label: item.status,
    value: item.count,
    percentage: item.percentage,
    color:
      item.status === 'Pendente'
        ? '#3b82f6'
        : item.status === 'Concluído'
        ? '#10b981'
        : '#ef4444',
  }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gráficos de Carregamentos</h2>
        <p className="text-gray-600 mt-1">Visualização e análise dos dados de carregamento</p>
      </div>

      <div className="space-y-6">
        <LineChart data={dailyData} title="Evolução Diária dos Carregamentos" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart data={barData} title="Carregamentos por Status" />
          <PieChart data={pieData} title="Distribuição por Status" />
        </div>
      </div>
    </div>
  );
}
