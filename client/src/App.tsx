import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { LogPage } from './pages/LogPage';
import { GoalsPage } from './pages/GoalsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public standalone routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* App routes — wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/select" element={<HomePage />} />
          <Route path="/dashboard/:userId" element={<DashboardPage />} />
          <Route path="/calculator/:userId" element={<CalculatorPage />} />
          <Route path="/log/:userId" element={<LogPage />} />
          <Route path="/goals/:userId" element={<GoalsPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
