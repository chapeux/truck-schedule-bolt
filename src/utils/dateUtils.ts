export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];

  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
};

export const getMonthStart = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

export const getMonthEnd = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

export const getWeekDays = (date: Date): Date[] => {
  const days: Date[] = [];
  const current = new Date(date);

  current.setDate(current.getDate() - current.getDay());

  for (let i = 0; i < 7; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const isDateInRange = (date: Date, startDate: string, endDate: string): boolean => {
  const checkDate = formatDate(date);
  return checkDate >= startDate && checkDate <= endDate;
};

export const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
