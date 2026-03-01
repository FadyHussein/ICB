import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './styles/theme';
import { AppStateProvider } from './context/AppStateContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import LandingPage from './components/landing/LandingPage';
import LevelSelectionPage from './components/level/LevelSelectionPage';
import TeacherSelectionPage from './components/teacher/TeacherSelectionPage';
import AttendancePage from './components/attendance/AttendancePage';
import ConfirmationPage from './components/confirmation/ConfirmationPage';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AppStateProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/:program/levels" element={<LevelSelectionPage />} />
              <Route path="/:program/levels/:level/teachers" element={<TeacherSelectionPage />} />
              <Route path="/:program/levels/:level/attendance" element={<AttendancePage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
            </Routes>
          </Router>
        </AppStateProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
