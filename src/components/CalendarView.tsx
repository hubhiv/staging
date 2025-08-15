import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings2, Clock, User } from 'lucide-react';
import { useKanban, Task } from './KanbanContext';
export const CalendarView: React.FC = () => {
  const {
    tasks
  } = useKanban();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = today.getDate() - dayOfWeek;
    return new Date(today.setDate(diff)); // Set to the start of the current week (Sunday)
  });
  const [viewMode, setViewMode] = useState<'Week' | 'Month'>('Month');
  // Sample service providers and time windows for demonstration
  const serviceProviders = ['Green Lawn Co.', 'City Plumbing', 'Elite Electric', 'Clean Air HVAC', 'Home Shield Security'];
  const timeWindows = ['8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '1:00 PM - 3:00 PM', '3:00 PM - 5:00 PM', '9:00 AM - 11:00 AM'];
  // Assign sample service providers and time windows to tasks
  const enhancedTasks = tasks.map((task, index) => ({
    ...task,
    serviceProvider: serviceProviders[index % serviceProviders.length],
    timeWindow: timeWindows[index % timeWindows.length]
  }));
  // Month navigation
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  // Week navigation
  const nextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };
  const prevWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };
  // Navigation based on current view
  const handleNext = () => {
    if (viewMode === 'Month') {
      nextMonth();
    } else {
      nextWeek();
    }
  };
  const handlePrev = () => {
    if (viewMode === 'Month') {
      prevMonth();
    } else {
      prevWeek();
    }
  };
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  const getTasksForDay = (day: number, month: number, year: number) => {
    // Add specific July appointments when viewing July
    const julyAppointments = [];
    if (month === 6) {
      // July is month 6 (0-indexed)
      // HVAC appointment on July 10
      if (day === 10) {
        julyAppointments.push({
          id: 'july-hvac',
          title: 'HVAC Maintenance',
          status: 'scheduled',
          dueDate: new Date(year, 6, 10).toISOString(),
          serviceProvider: 'Clean Air HVAC',
          timeWindow: '9:00 AM - 11:30 AM'
        });
      }
      // Plumbing appointment on July 15
      if (day === 15) {
        julyAppointments.push({
          id: 'july-plumbing',
          title: 'Plumbing Check',
          status: 'scheduled',
          dueDate: new Date(year, 6, 15).toISOString(),
          serviceProvider: 'City Plumbing',
          timeWindow: '1:00 PM - 3:30 PM'
        });
      }
      // Water Inspection on July 22
      if (day === 22) {
        julyAppointments.push({
          id: 'july-water',
          title: 'Water Inspection',
          status: 'scheduled',
          dueDate: new Date(year, 6, 22).toISOString(),
          serviceProvider: 'City Plumbing',
          timeWindow: '10:00 AM - 12:00 PM'
        });
      }
      // Gutter Cleaning on July 28
      if (day === 28) {
        julyAppointments.push({
          id: 'july-gutter',
          title: 'Gutter Cleaning',
          status: 'scheduled',
          dueDate: new Date(year, 6, 28).toISOString(),
          serviceProvider: 'Green Lawn Co.',
          timeWindow: '8:00 AM - 10:30 AM'
        });
      }
    }
    // Combine regular tasks with July appointments
    const regularTasks = enhancedTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month && taskDate.getDate() === day;
    });
    return [...regularTasks, ...julyAppointments];
  };
  const getServiceColor = (provider: string) => {
    const colors = {
      'Green Lawn Co.': 'bg-green-100 text-green-800 border-green-200',
      'City Plumbing': 'bg-blue-100 text-blue-800 border-blue-200',
      'Elite Electric': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Clean Air HVAC': 'bg-purple-100 text-purple-800 border-purple-200',
      'Home Shield Security': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  // Render a single day cell with tasks
  const renderDayCell = (day: number, month: number, year: number, isToday: boolean = false) => {
    const dayTasks = getTasksForDay(day, month, year);
    return <div key={`day-${day}-${month}-${year}`} className={`h-16 md:h-36 border border-gray-200 p-1 md:p-2 ${isToday ? 'bg-blue-50' : ''}`}>
        <div className="text-xs md:text-sm font-medium mb-1">{day}</div>
        <div className="overflow-y-auto max-h-10 md:max-h-28">
          {dayTasks.map(task => <div key={task.id} className={`text-xs p-1 mb-1 rounded border ${getServiceColor(task.serviceProvider)} transition-all hover:shadow-sm`} title={`${task.title} - ${task.serviceProvider}`}>
              <div className="font-medium truncate">{task.title}</div>
              <div className="flex items-center mt-0.5 text-[10px]">
                <User className="w-2.5 h-2.5 mr-1 inline" />
                <span className="truncate">{task.serviceProvider}</span>
              </div>
              <div className="flex items-center mt-0.5 text-[10px]">
                <Clock className="w-2.5 h-2.5 mr-1 inline" />
                <span>{task.timeWindow}</span>
              </div>
            </div>)}
        </div>
      </div>;
  };
  // Render the month view calendar
  const renderMonthView = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    const weeks = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 md:h-32"></div>);
    }
    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = new Date().getDate() === i && new Date().getMonth() === month && new Date().getFullYear() === year;
      days.push(renderDayCell(i, month, year, isToday));
    }
    // Group days into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(<div key={`week-${i}`} className="grid grid-cols-7 gap-0">
          {days.slice(i, i + 7)}
        </div>);
    }
    return weeks;
  };
  // Render the week view calendar
  const renderWeekView = () => {
    const startDate = new Date(currentWeekStart);
    const days = [];
    // Generate the 7 days of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const day = currentDate.getDate();
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
      days.push(renderDayCell(day, month, year, isToday));
    }
    return <div className="grid grid-cols-7 gap-0">{days}</div>;
  };
  // Get the title for the current view (month name or week range)
  const getViewTitle = () => {
    if (viewMode === 'Month') {
      return `${currentMonth.toLocaleString('default', {
        month: 'long'
      })} ${currentMonth.getFullYear()}`;
    } else {
      const endDate = new Date(currentWeekStart);
      endDate.setDate(currentWeekStart.getDate() + 6);
      // If the week spans two months
      if (currentWeekStart.getMonth() !== endDate.getMonth()) {
        return `${currentWeekStart.toLocaleString('default', {
          month: 'short'
        })} ${currentWeekStart.getDate()} - ${endDate.toLocaleString('default', {
          month: 'short'
        })} ${endDate.getDate()}, ${endDate.getFullYear()}`;
      }
      // If the week spans two years
      else if (currentWeekStart.getFullYear() !== endDate.getFullYear()) {
        return `${currentWeekStart.toLocaleString('default', {
          month: 'short'
        })} ${currentWeekStart.getDate()}, ${currentWeekStart.getFullYear()} - ${endDate.toLocaleString('default', {
          month: 'short'
        })} ${endDate.getDate()}, ${endDate.getFullYear()}`;
      }
      // If the week is within the same month
      else {
        return `${currentWeekStart.toLocaleString('default', {
          month: 'long'
        })} ${currentWeekStart.getDate()} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
      }
    }
  };
  return <div className="flex-1 p-2 md:p-4 overflow-auto">
      <div className="bg-white shadow-sm rounded-lg w-full h-full flex flex-col">
        <div className="p-2 md:p-4 flex flex-wrap justify-between items-center border-b">
          <div className="flex items-center space-x-1 md:space-x-2 mb-2 md:mb-0">
            <button onClick={handlePrev} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <h2 className="text-base md:text-lg font-medium">
              {getViewTitle()}
            </h2>
            <button onClick={handleNext} className="p-1 rounded-full hover:bg-gray-100">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`px-2 py-1 text-xs md:text-sm rounded-md ${viewMode === 'Week' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => setViewMode('Week')}>
              Week
            </button>
            <button className={`px-2 py-1 text-xs md:text-sm rounded-md ${viewMode === 'Month' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} onClick={() => setViewMode('Month')}>
              Month
            </button>
          </div>
        </div>
        <div className="p-1 md:p-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 gap-0 text-center py-1 md:py-2">
            <div className="text-xs md:text-sm font-medium text-gray-500">
              S
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-500">
              M
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-500">
              T
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-500">
              W
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-500">
              T
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-500">
              F
            </div>
            <div className="text-xs md:text-sm font-medium text-gray-500">
              S
            </div>
          </div>
          {viewMode === 'Month' ? renderMonthView() : renderWeekView()}
        </div>
      </div>
    </div>;
};