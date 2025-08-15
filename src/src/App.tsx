import React, { useState, Component } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { Header } from './components/Header';
import { KanbanProvider, useKanban } from './components/KanbanContext';
import { CalendarView } from './components/CalendarView';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { LandingPage } from './components/LandingPage';
import { DashboardMetrics } from './components/DashboardMetrics';
import { MyHomeViewContainer } from '../components/MyHomeViewContainer';
import { AuthProvider, useAuth } from './hooks/useAuth';
/**
 * ============================================================
 * ✅ FRONTEND IS READY FOR BACKEND INTEGRATION
 * - All API endpoints are mapped and documented in code comments
 * - Component and business logic notes updated in all relevant files
 * - Checklist and TODOs are current and visible in code
 * - Output matches backend expectations per provided API contract
 * ============================================================
 *
 * @version 1.0.0 | Last updated: 2023-07-20
 */
/**
 * ==== INTEGRATION CHECKLIST ====
 * [x] All endpoints mapped in services
 * [x] All UI components have loading, error, and empty states
 * [x] Environment configs used for all URLs/secrets
 * [x] Example API request/response included in code comments
 * [x] All API calls documented above functions
 * [x] Mock data covers edge cases (nulls, long text, etc.)
 * [x] UI handles auth/logout, expired tokens
 * [ ] Backend integration testing completed
 * [ ] Production deployment configuration validated
 * ===============================
 *
 * ==== INTEGRATION NOTES ====
 * TODO: Confirm backend field for "provider_type" is always string and matches expected values in UI
 * TODO: Business logic for archived tasks - UI expects archived tasks not shown by default
 * TODO: Confirm backend pagination matches frontend expectations (15 items per page default)
 * TODO: Verify CORS settings on backend to allow frontend domain
 * TODO: Ensure rate limiting headers are properly handled by frontend
 * TODO: Confirm all date formats match ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
 * ===========================
 *
 * ==== APPLICATION STRUCTURE ====
 * - Authentication: Handled via JWT tokens with refresh mechanism
 * - State Management: Context API for application state
 * - Data Fetching: API services with axios for HTTP requests
 * - UI Components: Modular components with Tailwind CSS
 * - Routing: Simple view switching via context state
 * =============================
 */
/**
 * Component: <MainContent />
 * Handles: View switching based on context state
 */
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
/**
 * Component: <App />
 * Root component that wraps the application with providers
 */
export function App() {
  return <AuthProvider>
      <AppContent />
    </AuthProvider>;
}
/**
 * Component: <AppContent />
 * Handles: Authentication state and main application layout
 */
const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    logout
  } = useAuth();
  return <div className="flex flex-col w-full h-screen bg-[#f4f5f7]">
      {isAuthenticated ? <KanbanProvider>
          <Header />
          <MainContent />
          {/* Logout button */}
          <button onClick={async () => {
            try {
              await logout();
            } catch (err) {
              console.error('Logout failed:', err);
            }
          }} className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-md shadow-md text-sm">
            Logout
          </button>
        </KanbanProvider> : <LandingPage />}
    </div>;
};