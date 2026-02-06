import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import JobSeekerProfileEdit from "../../common/jobseekerprofileedit/JobSeekerProfileEdit";
import Toast from "../../shared/Toast/Toast";
import { useAuth } from "../../../store/hooks";
import { ROLES } from "../../../constants/roles.jsx";
import "./JobSeekerDashboard.css";

const JobSeekerDashboard = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { role, token } = useAuth();

  const isJobSeeker = role === ROLES.JOB_SEEKER;

  const isMyProfilePage =
    isJobSeeker && location.pathname === "/jobseeker/profile";

  const showMyProfileButton =
    isJobSeeker && location.pathname !== "/jobseeker/profile";

  const canEdit = isMyProfilePage;

  // Show back button when admin/employer is viewing OR job seeker is on their profile page
  const isReadOnlyView =
    (role === ROLES.ADMIN || role === ROLES.EMPLOYER) && Boolean(id);
  const showBackButtonForJobSeekerProfile = isJobSeeker && isMyProfilePage;
  const showBackButton = isReadOnlyView || showBackButtonForJobSeekerProfile;

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.pathname]);

  const loadProfile = async () => {
    try {
      const url = isMyProfilePage
        ? "/jobseeker/profile"
        : `/view/jobseeker/${id}`;

      const res = await api.get(url);

      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load job seeker profile", err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get("/jobseeker/history");
      setHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleSave = async (data) => {
    try {
      await api.put("/jobseeker/profile", data);
      setEditMode(false);
      loadProfile();
      setToast({
        show: true,
        message: "Profile updated successfully",
        type: "success"
      });
    } catch {
      setToast({
        show: true,
        message: "Update failed",
        type: "error"
      });
    }
  };

  const handleBackClick = () => {
    if (role === ROLES.ADMIN) {
      navigate("/admin/dashboard");
    } else if (role === ROLES.EMPLOYER) {
      navigate(-1);
    } else if (role === ROLES.JOB_SEEKER) {
      navigate(-1);
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="jobseeker-page">
      <CommonHeader
        userName={profile.fullName}
        showProfileButton={showMyProfileButton}
        showSearchButton={isMyProfilePage}
        showApplicationsButton={isMyProfilePage}
        showEditButton={canEdit && !editMode}
        isReadOnly={isReadOnlyView}
        showRoleText={!isReadOnlyView}
        onEditProfile={() => setEditMode(true)}
      />

      {/* Back Button for Admin View */}
      {showBackButton && (
        <div className="back-button-container">
          <button
            className="back-btn"
            onClick={handleBackClick}
          >
            Back
          </button>
        </div>
      )}

      {!editMode && (
        <div className="js-grid">
          <div className="js-card">
            <h3>About</h3>
            <p>{profile.summary || "-"}</p>

            <h4>Skills</h4>
            <div className="skill-row">
              {profile.skills
                ? profile.skills.split(",").map((s) => (
                    <span key={s} className="skill-chip">
                      {s.trim()}
                    </span>
                  ))
                : "-"}
            </div>
          </div>

          <div className="js-card">
            <h3>Education</h3>
            <p>
              <strong>{profile.education || "-"}</strong>
            </p>
            <p>{profile.college || "-"}</p>
          </div>
        </div>
      )}

      {editMode && canEdit && (
        <JobSeekerProfileEdit
          profile={profile}
          onCancel={() => setEditMode(false)}
          onSave={handleSave}
        />
      )}

      {/* VIEW HISTORY BUTTON */}
      {/* {canEdit && !showHistory && (
        <button className="btn-outline" onClick={loadHistory}>
          View Change History
        </button>
      )} */}

      {/*  HISTORY UI */}
      {showHistory && (
        <div className="js-card">
          <h3>Change History</h3>

          {history.length === 0 ? (
            <p>No changes recorded.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>Changed By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.fieldName}</td>
                    <td>{h.oldValue || "-"}</td>
                    <td>{h.newValue || "-"}</td>
                    <td>{h.changedBy}</td>
                    <td>{new Date(h.changedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
};

export default JobSeekerDashboard;
