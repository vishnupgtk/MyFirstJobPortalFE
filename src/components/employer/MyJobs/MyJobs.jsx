import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import { useAuth } from "../../../store/hooks";
import "./MyJobs.css";

const MyJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyJobs();
  }, []);

  const loadMyJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs/my-jobs");
      setJobs(response.data);
    } catch (err) {
      setError("Failed to load jobs");
      console.error("Load jobs error:", err);
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

  if (loading) {
    return (
      <div className="my-jobs-page">
        <CommonHeader
          userName={user?.fullName}
          showProfileButton={true}
          showPostJobButton={true}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-jobs-page">
      <CommonHeader
        userName={user?.fullName}
        showProfileButton={true}
        showPostJobButton={true}
      />

      <div className="my-jobs-container">
        <div className="my-jobs-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="header-content">
            <h1>My Posted Jobs</h1>
            <p>Manage your job postings and view applicants</p>
          </div>
          {/* <button
            className="post-job-btn"
            onClick={() => navigate("/employer/jobs/new")}
          >
            + Post New Job
          </button> */}
        </div>

        {error && <div className="error-message">{error}</div>}

        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Jobs Posted Yet</h3>
            <p>
              Start by posting your first job to attract talented candidates
            </p>
            <button
              className="post-first-job-btn"
              onClick={() => navigate("/employer/jobs/new")}
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.jobId} className="job-card">
                <div className="job-card-header">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-meta">
                    <span className="job-date">
                      Posted {formatDate(job.createdAt)}
                    </span>
                    {job.employmentType && (
                      <span
                        className="employment-type"
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

                <div className="job-card-body">
                  <p className="job-description">
                    {job.description.length > 150
                      ? `${job.description.substring(0, 150)}...`
                      : job.description}
                  </p>

                  <div className="job-details">
                    {job.location && (
                      <div className="job-detail">
                        <span className="detail-icon">📍</span>
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.requiredSkills && (
                      <div className="job-detail">
                        <span className="detail-icon">🛠️</span>
                        <span>{job.requiredSkills}</span>
                      </div>
                    )}
                    {job.salaryRange && (
                      <div className="job-detail">
                        <span className="detail-icon">💰</span>
                        <span>{job.salaryRange}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="job-card-footer">
                  <div className="applicant-count">
                    <span className="count-number">
                      {job.applicantCount || 0}
                    </span>
                    <span className="count-label">
                      {(job.applicantCount || 0) === 1
                        ? "Applicant"
                        : "Applicants"}
                    </span>
                  </div>
                  <button
                    className="view-applicants-btn"
                    onClick={() =>
                      navigate(`/employer/jobs/${job.jobId}/applicants`)
                    }
                  >
                    View Applicants
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
