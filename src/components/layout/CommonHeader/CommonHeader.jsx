import { useNavigate } from "react-router-dom";
import { useAuth, useAuthActions } from "../../../store/hooks";
import {
  ROLES,
  isAdmin,
  isEmployer,
  isJobSeeker,
} from "../../../constants/roles.jsx";
import NotificationBell from "../../shared/NotificationBell/NotificationBell";
import "./CommonHeader.css";

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
    if (isAdmin(role)) return "common-header-avatar admin";
    if (isEmployer(role)) return "common-header-avatar employer";
    if (isJobSeeker(role)) return "common-header-avatar jobseeker";
    return "common-header-avatar";
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
      if (isEmployer(role)) navigate("/employer/dashboard");
      if (isJobSeeker(role)) navigate("/jobseeker/profile");
    }
  };

  return (
    <div className="common-header">
      <div className="common-header-left">
        <div className={getAvatarClass()}>{getInitials()}</div>
        <div className="common-header-user-info">
          <div className="common-header-name">{displayName}</div>
          {showRoleText && (
            <div className="common-header-role">{getRoleDisplay()}</div>
          )}
        </div>
      </div>

      <div className="common-header-actions">
        {/* Edit Profile Button */}
        {showEditButton && !isReadOnly && (
          <button
            className="common-header-btn edit-btn"
            onClick={onEditProfile}
            title="Edit Profile"
          >
            ✏️
          </button>
        )}

        {/* Admin-specific buttons */}
        {isAdmin(role) && (
          <>
            {showEmployerAudit && (
              <button
                onClick={() => navigate("/admin/history")}
                className="common-header-btn admin-btn"
              >
                Employer Audit
              </button>
            )}
            {showJobSeekerAudit && (
              <button
                onClick={() => navigate("/admin/jobseekers/history")}
                className="common-header-btn admin-btn"
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
                className="common-header-btn employer-btn"
              >
                Post Job
              </button>
            )}
            {showMyJobsButton && (
              <button
                onClick={() => navigate("/employer/jobs")}
                className="common-header-btn employer-btn"
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
                className="common-header-btn jobseeker-btn"
              >
                Job Openings
              </button>
            )}
            {showApplicationsButton && (
              <button
                onClick={() => navigate("/jobseeker/applications")}
                className="common-header-btn jobseeker-btn"
              >
                My Applications
              </button>
            )}
          </>
        )}

        {/* Profile Button - Not shown for admins */}
        {showProfileButton && !isAdmin(role) && (
          <button
            className="common-header-btn profile-btn"
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
            className="common-header-btn logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default CommonHeader;
