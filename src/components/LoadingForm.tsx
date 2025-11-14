import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { TruckLoading } from '../lib/supabase';

interface LoadingFormProps {
  loading?: TruckLoading | null;
  initialDate?: Date;
  onSave: (data: Partial<TruckLoading>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function LoadingForm({ loading, initialDate, onSave, onDelete, onClose }: LoadingFormProps) {
  const [formData, setFormData] = useState({
    truck_id: '',
    cotacao: '',
    quantity: '',
    carrier: '',
    start_date: '',
    end_date: '',
    completed_date: '',
    is_completed: false,
    status: 'pending' as 'pending' | 'completed' | 'cancelled',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

useEffect(() => {
  if (loading) {
    setFormData({
      truck_id: loading.truck_id || '',
      cotacao: loading.cotacao || '',
      quantity: loading.quantity || '',
      carrier: loading.carrier || '',
      // converte valores possivelmente nulos do backend para string '' ou 'YYYY-MM-DD'
      start_date: loading.start_date ? loading.start_date.slice(0,10) : '',
      end_date: loading.end_date ? loading.end_date.slice(0,10) : '',
      completed_date: loading.completed_date ? loading.completed_date.slice(0,10) : '',
      is_completed: !!loading.is_completed,
      status: loading.status || 'pending',
      notes: loading.notes || '',
    });
  } else if (initialDate) {
    const dateStr = initialDate.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      start_date: dateStr,
      end_date: dateStr,
    }));
  }
}, [loading, initialDate]);


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSaving(true);

  try {
    const status = formData.is_completed ? 'completed' : formData.status;

    // copia segura do formData
    const saveData: any = {
      truck_id: formData.truck_id || null,
      cotacao: formData.cotacao || null,
      quantity: formData.quantity || null,
      carrier: formData.carrier || null,
      status,
      is_completed: !!formData.is_completed,
      notes: formData.notes || null,
    };

    // Convertendo datas: '' -> null, e garantindo formato YYYY-MM-DD
    saveData.start_date = formData.start_date && formData.start_date !== '' ? formData.start_date : null;
    saveData.end_date = formData.end_date && formData.end_date !== '' ? formData.end_date : null;

    // completed_date: se marca como realizado e não informou data, usar hoje
    if (formData.is_completed) {
      saveData.completed_date = formData.completed_date && formData.completed_date !== ''
        ? formData.completed_date
        : new Date().toISOString().split('T')[0];
    } else {
      saveData.completed_date = formData.completed_date && formData.completed_date !== ''
        ? formData.completed_date
        : null;
    }

    // DEBUG: verifique o payload antes de enviar
    console.log('payload to save:', saveData);

    await onSave(saveData);
    onClose();
  } catch (error) {
    console.error('Error saving loading:', error);
    alert('Erro ao salvar carregamento. Tente novamente.');
  } finally {
    setIsSaving(false);
  }
};


  const handleDelete = async () => {
    if (!loading || !onDelete) return;

    if (confirm('Tem certeza que deseja excluir este carregamento?')) {
      setIsDeleting(true);
      try {
        await onDelete(loading.id);
        onClose();
      } catch (error) {
        console.error('Error deleting loading:', error);
        alert('Erro ao excluir carregamento. Tente novamente.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {loading ? 'Editar Carregamento' : 'Novo Carregamento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Identificação do Caminhão *
              </label>
              <input
                type="text"
                required
                value={formData.truck_id}
                onChange={(e) => setFormData({ ...formData, truck_id: e.target.value })}
                placeholder="Ex: Rodotrem"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transportadora *
              </label>
              <input
                type="text"
                required
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                placeholder="Ex: Transportes Solar"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cotação *
              </label>
              <input
                type="text"
                required
                value={formData.cotacao}
                onChange={(e) => setFormData({ ...formData, cotacao: e.target.value })}
                placeholder="Ex: 16452"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantidade de Veículos*
              </label>
              <input
                type="text"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Ex: 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data Inicial *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data Final *
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pendente</option>
                <option value="completed">Realizado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {formData.is_completed && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de Realização
                </label>
                <input
                  type="date"
                  value={formData.completed_date}
                  onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre o carregamento..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_completed"
              checked={formData.is_completed}
              onChange={(e) => setFormData({ ...formData, is_completed: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="is_completed" className="text-sm font-semibold text-gray-700">
              Marcar como realizado
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {loading && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={20} />
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
