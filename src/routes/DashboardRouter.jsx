import { Navigate } from "react-router-dom";
import { useAuth } from "../store/hooks";
import { ROLES } from "../constants/roles.jsx";
import AdminDashboard from "../components/admin/admindashboard/AdminDashboard";
import JobApplicants from "../components/employer/jobApplicants/JobApplicants";
import MyApplications from "../components/jobseeker/MyApplications/MyApplications";

const DashboardRouter = () => {
  const { role } = useAuth();

  if (role === ROLES.ADMIN) return <AdminDashboard />;
  if (role === ROLES.EMPLOYER) return <JobApplicants />;
  if (role === ROLES.JOB_SEEKER) return <MyApplications />;

  return <Navigate to="/" replace />;
};

export default DashboardRouter;
