import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { TruckLoading } from '../lib/supabase';
import { formatFullDate } from '../utils/dateUtils';

interface TableViewProps {
  loadings: TruckLoading[];
  onLoadingClick: (loading: TruckLoading) => void;
  onStatusChange?: (loading: TruckLoading) => void;
}

type FilterType = 'all' | 'pending' | 'completed' | 'cancelled';
type DateFilterType = 'all' | 'current_month' | 'current_week' | 'next_week';

export default function TableView({ loadings, onLoadingClick, onStatusChange }: TableViewProps) {
  const [searchTruck, setSearchTruck] = useState('');
  const [searchCarrier, setSearchCarrier] = useState('');
  const [searchCotacao, setSearchCotacao] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const getFilteredLoadings = () => {
    let filtered = [...loadings];

    if (searchTruck.trim()) {
      filtered = filtered.filter(loading =>
        loading.truck_id.toLowerCase().includes(searchTruck.toLowerCase())
      );
    }

    if (searchCarrier.trim()) {
      filtered = filtered.filter(loading =>
        loading.carrier.toLowerCase().includes(searchCarrier.toLowerCase())
      );
    }

    if (searchCotacao.trim()) {
      filtered = filtered.filter(loading =>
        loading.cotacao.toLowerCase().includes(searchCotacao.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(loading => loading.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === 'current_month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        filtered = filtered.filter(loading => {
          const startDate = new Date(loading.start_date);
          const endDate = new Date(loading.end_date);
          return (startDate <= monthEnd && endDate >= monthStart);
        });
      } else if (dateFilter === 'current_week') {
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        filtered = filtered.filter(loading => {
          const startDate = new Date(loading.start_date);
          const endDate = new Date(loading.end_date);
          return (startDate <= weekEnd && endDate >= weekStart);
        });
      } else if (dateFilter === 'next_week') {
        const nextWeekStart = new Date(currentDate);
        nextWeekStart.setDate(nextWeekStart.getDate() - nextWeekStart.getDay() + 7);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);

        filtered = filtered.filter(loading => {
          const startDate = new Date(loading.start_date);
          const endDate = new Date(loading.end_date);
          return (startDate <= nextWeekEnd && endDate >= nextWeekStart);
        });
      }
    }

    return filtered.sort((a, b) => {
      if (a.start_date !== b.start_date) {
        return a.start_date.localeCompare(b.start_date);
      }
      return a.truck_id.localeCompare(b.truck_id);
    });
  };

  const filteredLoadings = getFilteredLoadings();

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const labels = {
      pending: 'Pendente',
      completed: 'Realizado',
      cancelled: 'Cancelado',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleStatusClick = async (e: React.MouseEvent, loading: TruckLoading) => {
    e.stopPropagation();

    const nextStatus = loading.status === 'pending' ? 'completed' : 'pending';
    const updatedLoading = { ...loading, status: nextStatus };

    if (onStatusChange) {
      onStatusChange(updatedLoading);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Lista de Carregamentos</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter size={20} />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar Caminhão
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTruck}
                  onChange={(e) => setSearchTruck(e.target.value)}
                  placeholder="Ex: ABC-1234"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar Transportadora
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchCarrier}
                  onChange={(e) => setSearchCarrier(e.target.value)}
                  placeholder="Ex: Transportes Solar"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar Cotação
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchCotacao}
                  onChange={(e) => setSearchCotacao(e.target.value)}
                  placeholder="Ex: Soja"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Realizados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Período
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="current_month">Mês Atual</option>
                <option value="current_week">Semana Atual</option>
                <option value="next_week">Próxima Semana</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {filteredLoadings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Nenhum carregamento encontrado</p>
            <p className="text-sm mt-2">Ajuste os filtros ou adicione novos carregamentos</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Caminhão
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Transportadora
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Cotação
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Janela de Datas
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Data Realizado
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoadings.map((loading) => (
                <tr
                  key={loading.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onLoadingClick(loading)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{loading.truck_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{loading.carrier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{loading.cotacao}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{loading.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatFullDate(loading.start_date)} até {formatFullDate(loading.end_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {loading.completed_date ? formatFullDate(loading.completed_date) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => handleStatusClick(e, loading)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {getStatusBadge(loading.status)}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadingClick(loading);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors font-semibold"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filteredLoadings.length > 0 && (
        <div className="px-6 py-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            Exibindo {filteredLoadings.length} carregamento{filteredLoadings.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
