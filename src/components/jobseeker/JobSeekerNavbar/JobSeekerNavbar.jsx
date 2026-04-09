import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, useAuthActions } from "../../../store/hooks";
import NotificationBell from "../../shared/NotificationBell/NotificationBell";

const JobSeekerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { logout } = useAuthActions();

  const isProfilePage = location.pathname === "/jobseeker/profile";
  const isDashboardPage = location.pathname === "/jobseeker/dashboard" || location.pathname === "/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/jobseeker/dashboard");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Navigation */}
          <div className="flex items-center space-x-1">
            {!isDashboardPage && (
              <button
                onClick={handleBack}
                className="p-2 mr-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                title="Back"
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <button
              onClick={() => navigate("/jobseeker/dashboard")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isDashboardPage
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/jobseeker/jobs")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive("/jobseeker/jobs")
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Find Jobs
            </button>
            <button
              onClick={() => navigate("/jobseeker/applications")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive("/jobseeker/applications")
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              My Applications
            </button>
          </div>

          {/* Right Side - Profile & Actions */}
          <div className="flex items-center space-x-4">
            <NotificationBell />
                        <button
              onClick={() => navigate("/jobseeker/profile")}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>My Profile</span>
            </button>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">Job Seeker</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                {getInitials(user?.fullName)}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default JobSeekerNavbar;
