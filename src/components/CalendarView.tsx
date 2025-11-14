import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { TruckLoading } from '../lib/supabase';
import {
  getDaysInMonth,
  getWeekDays,
  monthNames,
  weekDayNames,
  formatDate,
  isToday,
  isSameDay,
  isDateInRange,
} from '../utils/dateUtils';

interface CalendarViewProps {
  loadings: TruckLoading[];
  onDateClick: (date: Date) => void;
  onLoadingClick: (loading: TruckLoading) => void;
}

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarView({ loadings, onDateClick, onLoadingClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const navigate = (direction: number) => {
    if (viewMode === 'month') navigateMonth(direction);
    else if (viewMode === 'week') navigateWeek(direction);
    else navigateDay(direction);
  };

  const getLoadingsForDate = (date: Date) => {
    return loadings.filter(loading =>
      isDateInRange(date, loading.start_date, loading.end_date)
    );
  };

  const getLoadingsForRange = (startDate: Date, endDate: Date) => {
    return loadings.filter(loading => {
      const start = new Date(loading.start_date);
      const end = new Date(loading.end_date);
      return start <= endDate && end >= startDate;
    });
  };

  const getStats = () => {
    let rangeLoadings: TruckLoading[] = [];

    if (viewMode === 'month') {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      rangeLoadings = getLoadingsForRange(monthStart, monthEnd);
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      rangeLoadings = getLoadingsForRange(weekDays[0], weekDays[6]);
    } else {
      rangeLoadings = getLoadingsForDate(currentDate);
    }

    return {
      pending: rangeLoadings.filter(l => l.status === 'pending').length,
      completed: rangeLoadings.filter(l => l.status === 'completed').length,
      cancelled: rangeLoadings.filter(l => l.status === 'cancelled').length,
    };
  };

  const stats = getStats();

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = daysInMonth[0].getDay();
    const emptyCells = Array(firstDay).fill(null);

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDayNames.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
        {emptyCells.map((_, idx) => (
          <div key={`empty-${idx}`} className="min-h-24 bg-gray-50 rounded-lg" />
        ))}
        {daysInMonth.map(date => {
          const dayLoadings = getLoadingsForDate(date);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={date.toISOString()}
              className={`min-h-24 border rounded-lg p-2 cursor-pointer hover:bg-blue-50 transition-colors ${isCurrentDay ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              onClick={() => onDateClick(date)}
            >
              <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? 'text-blue-600' : 'text-gray-700'}`}>
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayLoadings.slice(0, 2).map(loading => (
                  <div
                    key={loading.id}
                    className={`text-xs p-1 rounded cursor-pointer truncate ${loading.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : loading.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadingClick(loading);
                    }}
                  >
                    {loading.truck_id}
                  </div>
                ))}
                {dayLoadings.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayLoadings.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(date => {
          const dayLoadings = getLoadingsForDate(date);
          const isCurrentDay = isToday(date);

          return (
            <div key={date.toISOString()} className="flex flex-col">
              <div className={`text-center py-2 rounded-t-lg ${isCurrentDay ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                <div className="text-xs font-semibold">{weekDayNames[date.getDay()]}</div>
                <div className="text-lg font-bold">{date.getDate()}</div>
              </div>
              <div
                className="flex-1 border border-t-0 rounded-b-lg p-2 cursor-pointer hover:bg-blue-50 transition-colors bg-white min-h-96"
                onClick={() => onDateClick(date)}
              >
                <div className="space-y-2">
                  {dayLoadings.map(loading => (
                    <div
                      key={loading.id}
                      className={`p-2 rounded cursor-pointer text-sm ${loading.status === 'completed'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : loading.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadingClick(loading);
                      }}
                    >
                      <div className="font-semibold">{loading.truck_id}</div>
                      <div className="text-xs truncate">{loading.cotacao}</div>
                      <div className="text-xs">{loading.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayLoadings = getLoadingsForDate(currentDate);
    const isCurrentDay = isToday(currentDate);

    return (
      <div className="bg-white rounded-lg border p-6">
        <div className={`text-center mb-6 pb-4 border-b ${isCurrentDay ? 'text-blue-600' : 'text-gray-800'
          }`}>
          <div className="text-sm font-semibold">{weekDayNames[currentDate.getDay()]}</div>
          <div className="text-4xl font-bold">{currentDate.getDate()}</div>
          <div className="text-sm">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
        </div>

        <div className="space-y-4">
          {dayLoadings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum carregamento agendado para este dia</p>
              <button
                onClick={() => onDateClick(currentDate)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Adicionar Carregamento
              </button>
            </div>
          ) : (
            dayLoadings.map(loading => (
              <div
                key={loading.id}
                className={`p-4 rounded-lg cursor-pointer border-l-4 ${loading.status === 'completed'
                  ? 'bg-green-50 border-green-500'
                  : loading.status === 'cancelled'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-blue-50 border-blue-500'
                  }`}
                onClick={() => onLoadingClick(loading)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{loading.truck_id}</h3>
                    <p className="text-gray-600 mt-1">{loading.cotacao}</p>
                    <p className="text-gray-700 font-semibold mt-1">Quantidade: {loading.quantity}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Transportadora: {loading.carrier}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Janela: {formatDate(new Date(loading.start_date + 'T00:00:00'))} até {formatDate(new Date(loading.end_date + 'T00:00:00'))}
                    </p>
                    {loading.completed_date && (
                      <p className="text-sm text-green-600 font-semibold mt-2">
                        Realizado em: {formatDate(new Date(loading.completed_date + 'T00:00:00'))}
                      </p>
                    )}
                    {loading.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">{loading.notes}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${loading.status === 'completed'
                    ? 'bg-green-200 text-green-800'
                    : loading.status === 'cancelled'
                      ? 'bg-red-200 text-red-800'
                      : 'bg-blue-200 text-blue-800'
                    }`}>
                    {loading.status === 'completed' ? 'Realizado' : loading.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const getTitle = () => {
    if (viewMode === 'month') {
      return `${monthNames[month]} ${year}`;
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.getDate()} - ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
    } else {
      return `${currentDate.getDate()} ${monthNames[month]} ${year}`;
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Resumo</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-semibold">Pendentes</div>
            <div className="text-3xl font-bold text-blue-800 mt-2">{stats.pending}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-semibold">Concluídos</div>
            <div className="text-3xl font-bold text-green-800 mt-2">{stats.completed}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-sm text-red-600 font-semibold">Cancelados</div>
            <div className="text-3xl font-bold text-red-800 mt-2">{stats.cancelled}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
            <button
              onClick={() => navigate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Dia
            </button>
          </div>
        </div>

        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
}
