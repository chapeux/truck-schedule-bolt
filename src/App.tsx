import { useState, useEffect } from 'react';
import { Calendar, List, Plus, Truck, BarChart3 } from 'lucide-react';
import { supabase, TruckLoading } from './lib/supabase';
import CalendarView from './components/CalendarView';
import TableView from './components/TableView';
import LoadingForm from './components/LoadingForm';
import GraficosPage from './components/GraficosPage';
import wegLogo from "./assets/weg-logo.png";

type ViewMode = 'calendar' | 'table' | 'graficos';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [loadings, setLoadings] = useState<TruckLoading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLoading, setSelectedLoading] = useState<TruckLoading | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchLoadings();
  }, []);

  const fetchLoadings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('truck_loadings')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setLoadings(data || []);
    } catch (error) {
      console.error('Error fetching loadings:', error);
      alert('Erro ao carregar os dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLoading = async (data: Partial<TruckLoading>) => {
    try {
      if (selectedLoading) {
        const { error } = await supabase
          .from('truck_loadings')
          .update(data)
          .eq('id', selectedLoading.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('truck_loadings')
          .insert([data]);

        if (error) throw error;
      }

      await fetchLoadings();
      setShowForm(false);
      setSelectedLoading(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving loading:', error);
      throw error;
    }
  };

  const handleDeleteLoading = async (id: string) => {
    try {
      const { error } = await supabase
        .from('truck_loadings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchLoadings();
    } catch (error) {
      console.error('Error deleting loading:', error);
      throw error;
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedLoading(null);
    setShowForm(true);
  };

  const handleLoadingClick = (loading: TruckLoading) => {
    setSelectedLoading(loading);
    setSelectedDate(null);
    setShowForm(true);
  };

  const handleNewLoading = () => {
    setSelectedLoading(null);
    setSelectedDate(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedLoading(null);
    setSelectedDate(null);
  };

  const handleStatusChange = async (loading: TruckLoading) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const completed_date = loading.status === 'completed' ? today : null;

      const { error } = await supabase
        .from('truck_loadings')
        .update({
          status: loading.status,
          is_completed: loading.status === 'completed',
          completed_date,
        })
        .eq('id', loading.id);

      if (error) throw error;
      await fetchLoadings();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={wegLogo} alt="WEG Logo" className="h-[4.5rem] w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Carregamentos Solar</h1>
                <p className="text-sm text-gray-600">Sistema de Controle de Carregamentos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'calendar'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Calendar size={20} />
                  Calendário
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <List size={20} />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('graficos')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'graficos'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <BarChart3 size={20} />
                  Gráficos
                </button>
              </div>

              <button
                onClick={handleNewLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={20} />
                Novo Carregamento
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'calendar' ? (
          <CalendarView
            loadings={loadings}
            onDateClick={handleDateClick}
            onLoadingClick={handleLoadingClick}
          />
        ) : viewMode === 'table' ? (
          <TableView
            loadings={loadings}
            onLoadingClick={handleLoadingClick}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <GraficosPage loadings={loadings} />
        )}
      </main>

      {showForm && (
        <LoadingForm
          loading={selectedLoading}
          initialDate={selectedDate || undefined}
          onSave={handleSaveLoading}
          onDelete={handleDeleteLoading}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default App;
