import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import { useAuth } from "../../../store/hooks";
import "./MyApplications.css";

const MyApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs/my-applications");
      setApplications(response.data);
    } catch (err) {
      setError("Failed to load applications");
      console.error("Load applications error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEmploymentTypeColor = (type) => {
    const colors = {
      "Full-time": "#10b981",
      "Part-time": "#f59e0b",
      Contract: "#8b5cf6",
      Internship: "#06b6d4",
    };
    return colors[type] || "#6b7280";
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

  if (loading) {
    return (
      <div className="my-applications-page">
        <CommonHeader
          userName={user?.fullName}
          showProfileButton={true}
          showSearchButton={true}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-applications-page">
      <CommonHeader
        userName={user?.fullName}
        showProfileButton={true}
        showSearchButton={true}
        showApplicationsButton={false}
      />

      <div className="applications-container">
        <div className="applications-header compact">
          <div className="header-content">
            <div className="header-text">
              <h1>My Applications</h1>
              <p>Track your job application status</p>
            </div>
            <div className="applications-stats">
              <span className="stat">
                <strong>{applications.length}</strong> Total Applications
              </span>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Applications Yet</h3>
            <p>Start applying for jobs to see them here</p>
            <button
              className="search-jobs-btn"
              onClick={() => navigate("/jobseeker/jobs")}
            >
              Search Jobs
            </button>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((job) => (
              <div key={job.jobId} className="application-card">
                <div className="application-header">
                  <div className="job-info">
                    <h3 className="job-title">{job.title}</h3>
                    <div className="company-info">
                      <span className="company-name">{job.postedBy}</span>
                      <span className="job-location">
                        {job.location || "Remote"}
                      </span>
                    </div>
                  </div>
                  <div className="application-meta">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(
                          job.status || "Pending",
                        ),
                      }}
                    >
                      {job.status || "Pending"}
                    </span>
                    {job.employmentType && (
                      <span
                        className="employment-badge"
                        style={{
                          backgroundColor: getEmploymentTypeColor(
                            job.employmentType,
                          ),
                        }}
                      >
                        {job.employmentType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="application-body">
                  <p className="job-description">
                    {job.description.length > 150
                      ? `${job.description.substring(0, 150)}...`
                      : job.description}
                  </p>

                  {job.requiredSkills && (
                    <div className="skills-section">
                      <div className="skills-list">
                        {job.requiredSkills
                          .split(",")
                          .slice(0, 3)
                          .map((skill, index) => (
                            <span key={index} className="skill-tag">
                              {skill.trim()}
                            </span>
                          ))}
                        {job.requiredSkills.split(",").length > 3 && (
                          <span className="skill-tag more">
                            +{job.requiredSkills.split(",").length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="application-footer">
                  <div className="application-dates">
                    <span className="date-item">
                      <span className="date-label">Posted:</span>
                      <span className="date-value">
                        {formatDate(job.createdAt)}
                      </span>
                    </span>
                    {job.appliedAt && (
                      <span className="date-item">
                        <span className="date-label">Applied:</span>
                        <span className="date-value">
                          {formatDate(job.appliedAt)}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="application-actions">
                    <span className="application-status">
                      Application {job.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;

