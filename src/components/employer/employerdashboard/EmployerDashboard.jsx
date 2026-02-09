import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../../api/axios";
import CompanyProfileView from "../../common/companyprofileview/CompanyProfileView";
import CompanyProfileEdit from "../../common/companyprofileedit/CompanyProfileEdit";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import Toast from "../../shared/Toast/Toast";
import { useAuth } from "../../../store/hooks";
import { ROLES } from "../../../constants/roles.jsx";
import "./EmployerDashboard.css";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const { role } = useAuth();

  // Check if this is the employer's own profile page
  const isMyProfilePage =
    location.pathname === "/employer/dashboard" &&
    !id &&
    role === ROLES.EMPLOYER;

  const isReadOnlyView = Boolean(id) || role !== ROLES.EMPLOYER;

 
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showProfileView, setShowProfileView] = useState(isMyProfilePage);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const showBackButton = role === ROLES.ADMIN && Boolean(id);
  const showBackButtonForJobSeeker = role === ROLES.JOB_SEEKER && Boolean(id);
  const showBackButtonForEmployerProfile =
    role === ROLES.EMPLOYER && showProfileView;

  const showAnyBackButton =
    showBackButton ||
    showBackButtonForJobSeeker ||
    showBackButtonForEmployerProfile;

  // Toast helper function
  const showToast = (message, type = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  useEffect(() => {
    loadProfile();

    setShowProfileView(isMyProfilePage);
  }, [id, location.pathname]);

  const loadProfile = async () => {
    try {
      const url = isReadOnlyView ? `/view/company/${id}` : `/company/me`;

      const res = await api.get(url);

      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load company profile", err);

      // Show specific error message to user
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load company profile";

      showToast(`Error: ${errorMessage}`, "error");
    }
  };

  const handleSave = async (data) => {
    if (isReadOnlyView) return;

    // Check if profile has required companyId
    if (!profile?.companyId) {
      showToast(
        "Error: Company ID is missing. Please refresh the page and try again.",
        "error",
      );
      return;
    }

    // Client-side validation
    const validationErrors = validateCompanyData(data);
    if (validationErrors.length > 0) {
      showToast(
        `Please fix the following errors:\n${validationErrors.join("\n")}`,
        "error",
      );
      return;
    }

    try {
      const fields = [
        "companyName",
        "industry",
        "description",
        "address",
        "locations",
      ];

      const changedFields = fields.filter(
        (field) => data[field] !== profile[field],
      );

      if (changedFields.length === 0) {
        showToast("No changes detected", "info");
        setEditMode(false);
        return;
      }

      // Allow only one active request cycle per company until admin action.
      try {
        const pendingRes = await api.get("/company/pending");
        const pendingRequests = Array.isArray(pendingRes.data)
          ? pendingRes.data
          : [];
        const hasPendingForCompany = pendingRequests.some(
          (request) => String(request.companyId) === String(profile.companyId),
        );

        if (hasPendingForCompany) {
          showToast(
            "A change request is already pending. Please wait for admin approval or rejection before submitting another change.",
            "info",
          );
          return;
        }
      } catch (pendingError) {
        console.error("Failed to check pending requests:", pendingError);
      }

      // Track successful and failed updates
      const results = {
        successful: [],
        failed: [],
      };

      // Process each changed field
      for (let field of changedFields) {
        try {
          await api.post("/company/request-change", {
            companyId: profile.companyId,
            fieldName: field,
            newValue: data[field],
          });
          results.successful.push(field);
        } catch (fieldError) {
          console.error(`Failed to update ${field}:`, fieldError);

          // Extract specific error message from backend response
          const errorMessage =
            fieldError.response?.data?.message ||
            fieldError.response?.data?.error ||
            fieldError.message ||
            "Unknown error";

          results.failed.push({
            field,
            error: errorMessage,
          });
        }
      }

      // Show appropriate success/error messages
      if (results.successful.length > 0 && results.failed.length === 0) {
        showToast("Your changes were sent to Admin for approval", "success");
        setEditMode(false);
      } else if (results.successful.length > 0 && results.failed.length > 0) {
        const successMsg = `Successfully submitted: ${results.successful.join(", ")}`;
        const failMsg = `Failed to submit: ${results.failed.map((f) => `${f.field} (${f.error})`).join(", ")}`;
        showToast(`${successMsg}\n\n${failMsg}`, "info");
      } else {
        // All failed
        const failMsg = results.failed
          .map((f) => `${f.field}: ${f.error}`)
          .join("\n");
        showToast(`Failed to submit changes:\n${failMsg}`, "error");
      }
    } catch (err) {
      console.error("Unexpected error during save:", err);

      // Extract meaningful error message
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred";

      showToast(`Error: ${errorMessage}`, "error");
    }
  };

  // Simple validation function for company data
  const validateCompanyData = (data) => {
    const errors = [];

    // Basic required field validation
    if (!data.companyName?.trim()) {
      errors.push("• Company name is required");
    }

    if (!data.industry?.trim()) {
      errors.push("• Industry is required");
    }

    return errors;
  };

  const handleMyProfileClick = () => {
    setShowProfileView(true);
    // Update URL without page reload
    window.history.pushState({}, "", "/employer/dashboard");
  };

  const handleBackClick = () => {
    if (role === ROLES.ADMIN) {
      navigate("/admin/dashboard");
    } else if (role === ROLES.JOB_SEEKER) {
      navigate("/dashboard"); // Job seeker's employer list page
    } else if (role === ROLES.EMPLOYER) {
      navigate(-1);
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="employer-page">
      <CommonHeader
        userName={profile.employerName}
        showProfileButton={!showProfileView && role === ROLES.EMPLOYER}
        isReadOnly={isReadOnlyView}
        showRoleText={!isReadOnlyView}
        onMyProfileClick={handleMyProfileClick}
        showEditButton={showProfileView && !isReadOnlyView && !editMode}
        onEditProfile={() => setEditMode(true)}
        showMyJobsButton={showProfileView && !isReadOnlyView}
        showPostJobButton={showProfileView && !isReadOnlyView}
      />

      {/* Back Button for Admin/JobSeeker View */}
      {showAnyBackButton && (
        <div className="back-button-container">
          <button
            className="back-btn"
            onClick={handleBackClick}
          >
            Back
          </button>
        </div>
      )}

      <div className="company-banner">
        <h1>{profile.companyName}</h1>
        <span className="subtitle">
          {isReadOnlyView
            ? ""
            : showProfileView
              ? "My Profile - Job Management"
              : "Employer Dashboard"}
        </span>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Industry</span>
          <h3>{profile.industry || "-"}</h3>
        </div>

        <div className="stat-card">
          <span>Locations</span>
          <h3>{profile.locations?.split(",").length || 0}</h3>
        </div>
      </section>

      {!editMode || isReadOnlyView ? (
        <CompanyProfileView
          profile={profile}
          readOnly={isReadOnlyView}
          onEdit={!isReadOnlyView ? () => setEditMode(true) : null}
        />
      ) : (
        <CompanyProfileEdit
          profile={profile}
          onCancel={() => setEditMode(false)}
          onSave={handleSave}
        />
      )}

      {/* JOB MANAGEMENT FOOTER - ONLY SHOW WHEN NOT IN PROFILE VIEW */}
      {!showProfileView && !isReadOnlyView && role === ROLES.EMPLOYER && (
        <div className="dashboard-footer">
          <h3 className="footer-text">Job Management</h3>
          <div className="job-actions">
            <button
              className="footer-btn primary"
              onClick={() => navigate("/employer/jobs/new")}
            >
              + Post New Job
            </button>
            <button
              className="footer-btn secondary"
              onClick={() => navigate("/employer/jobs")}
            >
              My Jobs
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default EmployerDashboard;
