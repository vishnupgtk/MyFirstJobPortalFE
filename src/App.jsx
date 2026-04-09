import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import { useAuth, useAuthActions } from "./store/hooks";
import {
  ROLES,
  ALL_ROLES,
  ADMIN_ROLES,
  EMPLOYER_ROLES,
  JOB_SEEKER_ROLES,
  ADMIN_EMPLOYER_ROLES,
} from "./constants/roles.jsx";
import config from "./config/env";

// Home Components
import Login from "./components/home/login/Login";
import Register from "./components/home/register/Register";
import ForgotPassword from "./components/home/forgotpassword/ForgotPassword";

import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardRouter from "./routes/DashboardRouter";

// Admin Components
import AdminLanding from "./components/admin/AdminLanding/AdminLanding";
import AdminDashboard from "./components/admin/admindashboard/AdminDashboard";
import AdminRequests from "./components/admin/adminrequests/AdminRequests";
import CompanyHistory from "./components/admin/companyhistory/CompanyHistory";
import AllCompanyHistory from "./components/admin/allcompanyhistory/AllCompanyHistory";
import AdminJobSeekerHistory from "./components/admin/adminjobseekerhistory/AdminJobSeekerHistory";

// Employer Components
import EmployerDashboard from "./components/employer/employerdashboard/EmployerDashboard";
import PostJob from "./components/employer/PostJob/PostJob";
import EditJob from "./components/employer/EditJob/EditJob";
import MyJobs from "./components/employer/MyJobs/MyJobs";
import JobApplicants from "./components/employer/jobApplicants/JobApplicants";
import EmployerProfile from "./components/employer/EmployerProfile/EmployerProfile";
import CompanyProfile from "./components/employer/CompanyProfile/CompanyProfile";

// Job Seeker Components
import JobSeekerLanding from "./components/jobseeker/JobSeekerLanding/JobSeekerLanding";
import JobSeekerProfile from "./components/jobseeker/JobSeekerProfile/JobSeekerProfile";
import JobSearch from "./components/jobseeker/JobSearch/JobSearch";
import MyApplications from "./components/jobseeker/MyApplications/MyApplications";

// Common Components
import JobSeekerList from "./components/common/jobseekerlist/JobSeekerList";
import EmployerList from "./components/common/employerlist/EmployerList";
import Unauthorized from "./components/shared/Unauthorized/Unauthorized";
import ChatbotWidget from "./components/shared/ChatbotWidget/ChatbotWidget";

// AppContent component that contains the routing logic
function AppContent() {
  const { isAuthInitialized, token, isAuthenticated } = useAuth();
  const { hydrateAuth, markAuthInitialized } = useAuthActions();
  const location = useLocation();

  useEffect(() => {
    const localToken = localStorage.getItem(config.security.tokenStorageKey);

    if (localToken && !isAuthInitialized) {
      try {
        hydrateAuth(localToken);
      } catch (err) {
        console.error("Token hydration failed:", err);
        localStorage.removeItem(config.security.tokenStorageKey);
        markAuthInitialized();
      }
    } else if (!localToken && !isAuthInitialized) {
      markAuthInitialized();
    }
  }, [hydrateAuth, markAuthInitialized, isAuthInitialized]);

  //  wait before routing
  if (!isAuthInitialized) {
    return null; // or loader
  }

  return (
    <>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* MAIN DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        {/* ADMIN */}
        <Route
          path="/admin/landing"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminLanding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/history"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AllCompanyHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobseekers/history"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AdminJobSeekerHistory />
            </ProtectedRoute>
          }
        />
        {/* EMPLOYER */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={EMPLOYER_ROLES}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        {/* EMPLOYER JOB MANAGEMENT */}
        <Route
          path="/employer/jobs/new"
          element={
            <ProtectedRoute allowedRoles={EMPLOYER_ROLES}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:jobId/edit"
          element={
            <ProtectedRoute allowedRoles={EMPLOYER_ROLES}>
              <EditJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <ProtectedRoute allowedRoles={EMPLOYER_ROLES}>
              <MyJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:jobId/applicants"
          element={
            <ProtectedRoute allowedRoles={EMPLOYER_ROLES}>
              <JobApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/applicants"
          element={
            <ProtectedRoute allowedRoles={EMPLOYER_ROLES}>
              <JobApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/profile"
          element={
            <ProtectedRoute allowedRoles={EMPLOYER_ROLES}>
              <CompanyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/account"
          element={
            <ProtectedRoute allowedRoles={EMPLOYER_ROLES}>
              <EmployerProfile />
            </ProtectedRoute>
          }
        />
        {/* JOB SEEKER */}
        <Route
          path="/jobseeker/dashboard"
          element={
            <ProtectedRoute allowedRoles={JOB_SEEKER_ROLES}>
              <JobSeekerLanding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobseeker/profile"
          element={
            <ProtectedRoute allowedRoles={JOB_SEEKER_ROLES}>
              <JobSeekerProfile />
            </ProtectedRoute>
          }
        />
        {/* JOB SEEKER JOB SEARCH */}
        <Route
          path="/jobseeker/jobs"
          element={
            <ProtectedRoute allowedRoles={JOB_SEEKER_ROLES}>
              <JobSearch />
            </ProtectedRoute>
          }
        />
        {/* JOB SEEKER APPLICATIONS */}
        <Route
          path="/jobseeker/applications"
          element={
            <ProtectedRoute allowedRoles={JOB_SEEKER_ROLES}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobseekers"
          element={
            <ProtectedRoute allowedRoles={ADMIN_EMPLOYER_ROLES}>
              <JobSeekerList />
            </ProtectedRoute>
          }
        />
        {/* SHARED */}
        <Route
          path="/company/:id/history"
          element={
            <ProtectedRoute allowedRoles={ADMIN_EMPLOYER_ROLES}>
              <CompanyHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employers/:id"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <CompanyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobseekers/:id"
          element={
            <ProtectedRoute allowedRoles={ADMIN_EMPLOYER_ROLES}>
              <JobSeekerProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
      {location.pathname !== "/" &&
        location.pathname !== "/register" &&
        location.pathname !== "/forgot" &&
        location.pathname !== "/unauthorized" && <ChatbotWidget />}
    </>
  );
}

// Main App component with Redux providers
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;
