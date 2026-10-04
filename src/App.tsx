import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AdminLayout } from './components/layout/AdminLayout';
import './App.css';

// Root Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { AccessRestrictedPage } from './pages/access-restricted/AccessRestrictedPage';
import { ErrorPage } from './pages/errors/ErrorPage';

// SFS Pages
import { SFSOverviewPage } from './pages/sfs/SFSOverviewPage';
import { SFSBlueprintsPage } from './pages/sfs/SFSBlueprintsPage';
import { SFSEditBlueprintPage } from './pages/sfs/SFSEditBlueprintPage';
import { SFSUploadBlueprintPage } from './pages/sfs/SFSUploadBlueprintPage';
import { SFSCategoriesPage } from './pages/sfs/SFSCategoriesPage';
import { SFSUploadCategoryPage } from './pages/sfs/SFSUploadCategoryPage';
import { SFSUsersPage } from './pages/sfs/SFSUsersPage';
import { SFSNotificationsPage } from './pages/sfs/SFSNotificationsPage';
import { SFSLogsPage } from './pages/sfs/SFSLogsPage';

// SkilTrix Pages
import { SkiltrixOverviewPage } from './pages/skiltrix/SkiltrixOverviewPage';
import { SkiltrixInternshipsPage } from './pages/skiltrix/SkiltrixInternshipsPage';
import { SkiltrixCoursesPage } from './pages/skiltrix/SkiltrixCoursesPage';
import { SkiltrixVideosPage } from './pages/skiltrix/SkiltrixVideosPage';
import { SkiltrixCompaniesPage } from './pages/skiltrix/SkiltrixCompaniesPage';
import { SkiltrixFileSystemPage } from './pages/skiltrix/SkiltrixFileSystemPage';
import { SkiltrixLanguagesPage } from './pages/skiltrix/SkiltrixLanguagesPage';
import { SkiltrixUsersPage } from './pages/skiltrix/SkiltrixUsersPage';
import { SkiltrixSubmissionsPage } from './pages/skiltrix/SkiltrixSubmissionsPage';
import { SkiltrixCompilerPricingPage } from './pages/skiltrix/SkiltrixCompilerPricingPage';

// SonicOra Pages
import { SonicoraOverviewPage } from './pages/sonicora/SonicoraOverviewPage';
import { SonicoraMovieUploadPage } from './pages/sonicora/SonicoraMovieUploadPage';
import { SonicoraSongUploadPage } from './pages/sonicora/SonicoraSongUploadPage';
import { SonicoraHeroUploadPage } from './pages/sonicora/SonicoraHeroUploadPage';

// Transport Hub & Krishi
import { TransportHubPage } from './pages/transport_hub/TransportHubPage';
import { KrishiPage } from './pages/krishi/KrishiPage';

// Database Manager
import { DatabaseManagerPage } from './pages/database/DatabaseManagerPage';

// Logs Module
import { LogsPage } from './pages/logs/LogsPage';

// Users Module
import { UsersPage } from './pages/users/UsersPage';

// User Profile Module
import { UserProfilePage } from './pages/user_profile/UserProfilePage';
import { UserLogActivityPage } from './pages/user_profile/UserLogActivityPage';
import { AuthCallback } from './auth/Callback';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone full-screen pages */}
            <Route path="/access-restricted" element={<AccessRestrictedPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Admin App Shell with Topbar & Collapsible Dynamic Sidebars */}
            <Route element={<AdminLayout />}>
              {/* Main Admin Dashboard */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/payments" element={<PaymentsPage />} />

              {/* SFS Module Routes */}
              <Route path="/sfs" element={<SFSOverviewPage />} />
              <Route path="/sfs/blueprints" element={<SFSBlueprintsPage />} />
              <Route path="/sfs/planets" element={<SFSBlueprintsPage />} />
              <Route path="/sfs/edit_bp" element={<SFSEditBlueprintPage />} />
              <Route path="/sfs/upload_bp" element={<SFSUploadBlueprintPage />} />
              <Route path="/sfs/categories" element={<SFSCategoriesPage />} />
              <Route path="/sfs/upload_category" element={<SFSUploadCategoryPage />} />
              <Route path="/sfs/users" element={<SFSUsersPage />} />
              <Route path="/sfs/notifications" element={<SFSNotificationsPage />} />
              <Route path="/sfs/logs" element={<SFSLogsPage />} />

              {/* SkilTrix Module Routes */}
              <Route path="/skiltrix" element={<SkiltrixOverviewPage />} />
              <Route path="/skiltrix/internships" element={<SkiltrixInternshipsPage />} />
              <Route path="/skiltrix/courses" element={<SkiltrixCoursesPage />} />
              <Route path="/skiltrix/videos" element={<SkiltrixVideosPage />} />
              <Route path="/skiltrix/companies" element={<SkiltrixCompaniesPage />} />
              <Route path="/skiltrix/code" element={<SkiltrixFileSystemPage />} />
              <Route path="/skiltrix/file-system" element={<SkiltrixFileSystemPage />} />
              <Route path="/skiltrix/languages" element={<SkiltrixLanguagesPage />} />
              <Route path="/skiltrix/users" element={<SkiltrixUsersPage />} />
              <Route path="/skiltrix/submissions" element={<SkiltrixSubmissionsPage />} />
              <Route path="/skiltrix/compiler-pricing" element={<SkiltrixCompilerPricingPage />} />

              {/* SonicOra Module Routes */}
              <Route path="/sonicora" element={<SonicoraOverviewPage />} />
              <Route path="/sonicora/movie_upload" element={<SonicoraMovieUploadPage />} />
              <Route path="/sonicora/song_upload" element={<SonicoraSongUploadPage />} />
              <Route path="/sonicora/hero_upload" element={<SonicoraHeroUploadPage />} />

              {/* Transport Hub & Krishi Routes */}
              <Route path="/transport-hub" element={<TransportHubPage />} />
              <Route path="/krishi" element={<KrishiPage />} />

              {/* Database Manager Routes */}
              <Route path="/database" element={<DatabaseManagerPage />} />

              {/* Logs Module Routes */}
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/logs/errors" element={<LogsPage />} />
              <Route path="/logs/total-activity" element={<LogsPage />} />

              {/* Users Directory Routes */}
              <Route path="/users" element={<UsersPage />} />

              {/* User Profile & Audit Trail Routes */}
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/profile/log-activity" element={<UserLogActivityPage />} />

              {/* 404 Fallback within layout */}
              <Route path="*" element={<ErrorPage code={404} title="404 - Page Not Found" message="The requested admin page does not exist." />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
