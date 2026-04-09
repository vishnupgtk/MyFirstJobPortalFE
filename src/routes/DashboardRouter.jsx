import { Navigate } from "react-router-dom";
import { useAuth } from "../store/hooks";
import { ROLES } from "../constants/roles.jsx";
import AdminLanding from "../components/admin/AdminLanding/AdminLanding";
import EmployerDashboard from "../components/employer/employerdashboard/EmployerDashboard";
import JobSeekerLanding from "../components/jobseeker/JobSeekerLanding/JobSeekerLanding";

const DashboardRouter = () => {
  const { role } = useAuth();

  if (role === ROLES.ADMIN) return <AdminLanding />;
  if (role === ROLES.EMPLOYER) return <EmployerDashboard />;
  if (role === ROLES.JOB_SEEKER) return <JobSeekerLanding />;

  return <Navigate to="/" replace />;
};

export default DashboardRouter;
