import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import { useAuth } from "../../../store/hooks";
import Toast from "../../shared/Toast/Toast";
import "./JobApplicants.css";

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [hasJobs, setHasJobs] = useState(true);

  useEffect(() => {
    loadApplicants();
  }, [jobId]);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      if (!jobId) {
        const jobsResponse = await api.get("/jobs/my-jobs");
        const jobs = jobsResponse.data || [];
        if (jobs.length > 0) {
          setHasJobs(true);
          navigate(`/employer/jobs/${jobs[0].jobId}/applicants`, { replace: true });
          return;
        }
        setHasJobs(false);
        setApplicants([]);
        setJobTitle("");
        return;
      }

      const response = await api.get(`/jobs/${jobId}/applicants`);
      setApplicants(response.data);

      // Get job title from first applicant or make separate API call
      if (response.data.length > 0) {
        // You might want to add job title to the applicants response
        // For now, we'll set a generic title
        setJobTitle("Job Position");
      }
    } catch (err) {
      setError("Failed to load applicants");
      console.error("Load applicants error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "#f59e0b",
      Reviewed: "#06b6d4", 
      Accepted: "#10b981",
      Rejected: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const updateApplicationStatus = async (applicantUserId, newStatus) => {
    const key = `${applicantUserId}-${newStatus}`;
    setUpdatingStatus(prev => ({ ...prev, [key]: true }));

    try {
      await api.put(`/jobs/${jobId}/applicants/${applicantUserId}/status`, {
        status: newStatus
      });

      // Update local state
      setApplicants(prev => 
        prev.map(applicant => 
          applicant.userId === applicantUserId 
            ? { ...applicant, status: newStatus }
            : applicant
        )
      );

      setToast({
        show: true,
        message: `Application ${newStatus.toLowerCase()} successfully`,
        type: "success"
      });
    } catch (err) {
      console.error("Update status error:", err);
      setToast({
        show: true,
        message: "Failed to update application status",
        type: "error"
      });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/jobseekers/${userId}`);
  };

  if (loading) {
    return (
      <div className="job-applicants-page">
        <CommonHeader
          userName={user?.fullName}
          showProfileButton={true}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-applicants-page">
      <CommonHeader
        userName={user?.fullName}
        showProfileButton={true}
        showPostJobButton={true}
        showMyJobsButton={true}
      />

      <div className="applicants-container">
        <div className="applicants-header">
          <div className="header-content">
            <h1>Job Applicants</h1>
            <p>Review and manage applications for this position</p>
            <div className="applicant-stats">
              <span className="stat">
                <strong>{applicants.length}</strong> Total Applicants
              </span>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {!error && !jobId && !hasJobs && (
          <div className="empty-state">
            <div className="empty-icon">ðŸ“‹</div>
            <h3>No Jobs Posted Yet</h3>
            <p>Post a job to start receiving applicants</p>
            <button
              className="back-to-jobs-btn"
              onClick={() => navigate("/employer/jobs/new")}
            >
              Post New Job
            </button>
          </div>
        )}

        {jobId && applicants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Applications Yet</h3>
            <p>When job seekers apply for this position, they'll appear here</p>
            <button
              className="back-to-jobs-btn"
              onClick={() => navigate("/employer/jobs")}
            >
              Back to My Jobs
            </button>
          </div>
        ) : (
          <div className="applicants-list">
            {applicants.map((applicant) => (
              <div key={applicant.userId} className="applicant-card">
                <div className="applicant-header">
                  <div className="applicant-info">
                    <h3 className="applicant-name">{applicant.fullName}</h3>
                    <p className="applicant-email">{applicant.email}</p>
                  </div>
                  <div className="applicant-meta">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(applicant.status),
                      }}
                    >
                      {applicant.status}
                    </span>
                    <span className="applied-date">
                      Applied {formatDate(applicant.appliedAt)}
                    </span>
                  </div>
                </div>

                <div className="applicant-body">
                  {applicant.skills && (
                    <div className="skills-section">
                      <h4>Skills</h4>
                      <div className="skills-list">
                        {applicant.skills.split(",").map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="applicant-actions">
                  <div className="primary-actions">
                    <button
                      className="view-profile-btn"
                      onClick={() => handleViewProfile(applicant.userId)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      View Profile
                    </button>
                  </div>
                  
                  <div className="status-actions">
                    {applicant.status === "Pending" && (
                      <>
                        <button
                          className="status-btn review-btn"
                          onClick={() => updateApplicationStatus(applicant.userId, "Reviewed")}
                          disabled={updatingStatus[`${applicant.userId}-Reviewed`]}
                        >
                          {updatingStatus[`${applicant.userId}-Reviewed`] ? "" : "Review"}
                        </button>
                        <button
                          className="status-btn accept-btn"
                          onClick={() => updateApplicationStatus(applicant.userId, "Accepted")}
                          disabled={updatingStatus[`${applicant.userId}-Accepted`]}
                        >
                          {updatingStatus[`${applicant.userId}-Accepted`] ? "" : "Accept"}
                        </button>
                        <button
                          className="status-btn reject-btn"
                          onClick={() => updateApplicationStatus(applicant.userId, "Rejected")}
                          disabled={updatingStatus[`${applicant.userId}-Rejected`]}
                        >
                          {updatingStatus[`${applicant.userId}-Rejected`] ? "" : "Reject"}
                        </button>
                      </>
                    )}
                    
                    {applicant.status === "Reviewed" && (
                      <>
                        <button
                          className="status-btn accept-btn"
                          onClick={() => updateApplicationStatus(applicant.userId, "Accepted")}
                          disabled={updatingStatus[`${applicant.userId}-Accepted`]}
                        >
                          {updatingStatus[`${applicant.userId}-Accepted`] ? "" : "Accept"}
                        </button>
                        <button
                          className="status-btn reject-btn"
                          onClick={() => updateApplicationStatus(applicant.userId, "Rejected")}
                          disabled={updatingStatus[`${applicant.userId}-Rejected`]}
                        >
                          {updatingStatus[`${applicant.userId}-Rejected`] ? "" : "Reject"}
                        </button>
                      </>
                    )}
                    
                    {(applicant.status === "Accepted" || applicant.status === "Rejected") && (
                      <div className="status-final">
                        {applicant.status === "Accepted" ? "✓ Application Accepted" : "✗ Application Rejected"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
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

export default JobApplicants;
