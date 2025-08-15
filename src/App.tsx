import React from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { Header } from './components/Header';
import { KanbanProvider, useKanban } from './components/KanbanContext';
import { CalendarView } from './components/CalendarView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { LandingPage } from './components/LandingPage';
import { DashboardMetrics } from './components/DashboardMetrics';
import { MyHomeViewContainer } from './components/MyHomeViewContainer';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { HomeDashboardMock } from './mock/HomeDashboardMock';
import { HomeDashboardPage } from './pages/HomeDashboardPage';
const MainContent: React.FC = () => {
  const {
    currentView,
    selectedTask
  } = useKanban();
  return <>
      {currentView === 'board' && <KanbanBoard />}
      {currentView === 'calendar' && <CalendarView />}
      {currentView === 'myHome' && <MyHomeViewContainer />}
      {selectedTask && <TaskDetailModal />}
      {currentView !== 'myHome' && <DashboardMetrics />}
    </>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const params = new URLSearchParams(window.location.search);
  const showMock = params.get('mock') === 'home';
  const showHomeV2 = params.get('home') === 'v2';

  return (
    <div className="flex flex-col w-full h-screen bg-[#f4f5f7]">
      {showMock ? (
        <HomeDashboardMock />
      ) : showHomeV2 ? (
        <HomeDashboardPage />
      ) : isAuthenticated ? (
        <KanbanProvider>
          <Header />
          <MainContent />
        </KanbanProvider>
      ) : (
        <LandingPage />
      )}
    </div>
  );
};
export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}