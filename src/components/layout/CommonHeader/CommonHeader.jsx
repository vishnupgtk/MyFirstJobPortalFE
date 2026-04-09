import { useNavigate } from "react-router-dom";
import { useAuth, useAuthActions } from "../../../store/hooks";
import {
  ROLES,
  isAdmin,
  isEmployer,
  isJobSeeker,
} from "../../../constants/roles.jsx";
import NotificationBell from "../../shared/NotificationBell/NotificationBell";

const CommonHeader = ({
  // User info
  userName,
  userEmail,

  // Display options
  showProfileButton = true,
  showEditButton = false,
  isReadOnly = false,
  showRoleText = true,

  // Role-specific buttons
  showEmployerAudit = true,
  showJobSeekerAudit = true,
  showSearchButton = false,
  showApplicationsButton = false,
  showMyJobsButton = false,
  showPostJobButton = false,

  // Callbacks
  onEditProfile,
  onMyProfileClick,
}) => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { logout } = useAuthActions();

  // Get user display name
  const displayName = userName || user?.fullName || userEmail || "User";

  // Generate initials based on role and name
  const getInitials = () => {
    if (displayName && displayName !== "User") {
      return displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    // Fallback initials based on role
    if (isAdmin(role)) return "AD";
    if (isEmployer(role)) return "EM";
    if (isJobSeeker(role)) return "JS";
    return "U";
  };

  // Get role display text
  const getRoleDisplay = () => {
    if (isReadOnly) return "Read Only View";

    if (isAdmin(role)) return "System Administrator";
    if (isEmployer(role)) return "Employer Dashboard";
    if (isJobSeeker(role)) {
      if (role === ROLES.ADMIN || role === ROLES.EMPLOYER) {
        return "Viewed by Admin";
      }
      return "Job Seeker Dashboard";
    }
    return "Dashboard";
  };

  // Get avatar color based on role
  const getAvatarClass = () => {
    if (isAdmin(role)) return "bg-gradient-to-br from-red-500 to-red-600";
    if (isEmployer(role)) return "bg-gradient-to-br from-indigo-500 to-indigo-600";
    if (isJobSeeker(role)) return "bg-gradient-to-br from-green-500 to-green-600";
    return "bg-gradient-to-br from-gray-500 to-gray-600";
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileClick = () => {
    if (onMyProfileClick) {
      onMyProfileClick();
    } else {
      // Default navigation based on role
      if (isAdmin(role)) navigate("/admin/dashboard");
      if (isEmployer(role)) navigate("/employer/profile");
      if (isJobSeeker(role)) navigate("/jobseeker/profile");
    }
  };

  return (
    <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - User Info */}
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${getAvatarClass()} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {getInitials()}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{displayName}</div>
              {showRoleText && (
                <div className="text-sm text-gray-500">{getRoleDisplay()}</div>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            {/* Edit Profile Button */}
            {showEditButton && !isReadOnly && (
              <button
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                onClick={onEditProfile}
                title="Edit Profile"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}

            {/* Admin-specific buttons */}
            {isAdmin(role) && (
              <>
                {showEmployerAudit && (
                  <button
                    onClick={() => navigate("/admin/history")}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                  >
                    Employer Audit
                  </button>
                )}
                {showJobSeekerAudit && (
                  <button
                    onClick={() => navigate("/admin/jobseekers/history")}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                  >
                    JobSeeker Audit
                  </button>
                )}
              </>
            )}

            {/* Employer-specific buttons */}
            {isEmployer(role) && (
              <>
                <NotificationBell />
                {showPostJobButton && (
                  <button
                    onClick={() => navigate("/employer/jobs/new")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                  >
                    Post Job
                  </button>
                )}
                {showMyJobsButton && (
                  <button
                    onClick={() => navigate("/employer/jobs")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                  >
                    My Jobs
                  </button>
                )}
              </>
            )}

            {/* Job Seeker-specific buttons */}
            {isJobSeeker(role) && role === ROLES.JOB_SEEKER && (
              <>
                {showSearchButton && (
                  <button
                    onClick={() => navigate("/jobseeker/jobs")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    Job Openings
                  </button>
                )}
                {showApplicationsButton && (
                  <button
                    onClick={() => navigate("/jobseeker/applications")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    My Applications
                  </button>
                )}
              </>
            )}

            {/* Profile Button - Not shown for admins */}
            {showProfileButton && !isAdmin(role) && (
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                onClick={handleProfileClick}
              >
                My Profile
              </button>
            )}

            {/* Logout Button - only show for current user's role */}
            {((isAdmin(role) && role === ROLES.ADMIN) ||
              (isEmployer(role) && role === ROLES.EMPLOYER) ||
              (isJobSeeker(role) && role === ROLES.JOB_SEEKER)) && (
              <button
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-medium text-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonHeader;
