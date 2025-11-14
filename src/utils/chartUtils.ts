import { supabase, TruckLoading } from '../lib/supabase';

export interface DailyLoadingData {
  date: string;
  count: number;
}

export interface StatusCount {
  pending: number;
  completed: number;
  cancelled: number;
}

export const getLoadingsByDay = (loadings: TruckLoading[]): DailyLoadingData[] => {
  const loadingMap = new Map<string, number>();

  loadings.forEach((loading) => {
    const startDate = new Date(loading.start_date + 'T00:00:00');
    const endDate = new Date(loading.end_date + 'T00:00:00');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      loadingMap.set(dateKey, (loadingMap.get(dateKey) || 0) + 1);
    }
  });

  const sortedEntries = Array.from(loadingMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return sortedEntries.map(([date, count]) => ({ date, count }));
};

export const getStatusCounts = (loadings: TruckLoading[]): StatusCount => {
  return {
    pending: loadings.filter((l) => l.status === 'pending').length,
    completed: loadings.filter((l) => l.status === 'completed').length,
    cancelled: loadings.filter((l) => l.status === 'cancelled').length,
  };
};

export const getStatusPercentages = (statusCounts: StatusCount): { status: string; percentage: number; count: number }[] => {
  const total = statusCounts.pending + statusCounts.completed + statusCounts.cancelled;

  if (total === 0) {
    return [
      { status: 'Pendente', percentage: 0, count: 0 },
      { status: 'Concluído', percentage: 0, count: 0 },
      { status: 'Cancelado', percentage: 0, count: 0 },
    ];
  }

  return [
    { status: 'Pendente', percentage: (statusCounts.pending / total) * 100, count: statusCounts.pending },
    { status: 'Concluído', percentage: (statusCounts.completed / total) * 100, count: statusCounts.completed },
    { status: 'Cancelado', percentage: (statusCounts.cancelled / total) * 100, count: statusCounts.cancelled },
  ];
};
