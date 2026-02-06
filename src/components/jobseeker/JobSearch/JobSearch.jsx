import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import Toast from "../../shared/Toast/Toast";
import { useAuth } from "../../../store/hooks";
import "./JobSearch.css";

const JobSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyingJobs, setApplyingJobs] = useState(new Set());

  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({
      isVisible: true,
      message,
      type,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    loadJobs();
    loadMyApplications(); // Load existing applications
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs");
      setJobs(response.data);
    } catch (err) {
      setError("Failed to load jobs");
      console.error("Load jobs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyApplications = async () => {
    try {
      const response = await api.get("/jobs/my-applications");
      const appliedJobIds = response.data.map((app) => app.jobId);
      setAppliedJobs(new Set(appliedJobIds));
    } catch (err) {
      console.error("Failed to load applications:", err);
      // Don't show error to user, just log it
    }
  };

  const handleApply = async (jobId) => {
    // Prevent multiple clicks
    if (applyingJobs.has(jobId) || appliedJobs.has(jobId)) {
      return;
    }

    try {
      // Add to applying set to show loading state
      setApplyingJobs((prev) => new Set([...prev, jobId]));

      await api.post(`/jobs/${jobId}/apply`);

      // Add to applied jobs set
      setAppliedJobs((prev) => new Set([...prev, jobId]));

      // Show success message
      showToast(
        " Application submitted successfully! The employer has been notified via email.",
        "success",
      );
    } catch (err) {
      console.error("Apply error:", err);

      // Check if it's an "already applied" error
      if (
        err.response?.status === 400 &&
        (err.response?.data?.includes?.("already applied") ||
          err.message?.includes("already applied"))
      ) {
        // If already applied, add to applied set and show info message
        setAppliedJobs((prev) => new Set([...prev, jobId]));
        showToast("You have already applied for this job", "info");
      } else {
        // For other errors, show generic error message
        showToast("Failed to apply for job. Please try again.", "error");
      }
    } finally {
      // Remove from applying set
      setApplyingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const getButtonState = (jobId) => {
    if (appliedJobs.has(jobId)) {
      return { text: "Applied", disabled: true, className: "applied-button" };
    }
    if (applyingJobs.has(jobId)) {
      return {
        text: "Applying...",
        disabled: true,
        className: "applying-button",
      };
    }
    return { text: "Apply Now", disabled: false, className: "apply-button" };
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
      <div className="job-board-page">
        <CommonHeader
          userName={user?.fullName}
          showProfileButton={true}
          showSearchButton={false}
          showApplicationsButton={true}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-board-page">
      <CommonHeader
        userName={user?.fullName}
        showProfileButton={true}
        showSearchButton={false}
        showApplicationsButton={true}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className="job-board-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1>Find Your Dream Job</h1>
            <p>Discover amazing opportunities from top companies</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{jobs.length}</span>
                <span className="stat-label">Open Positions</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Companies</span>
              </div>
              <div className="stat">
                <span className="stat-number">Remote</span>
                <span className="stat-label">Friendly</span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No Jobs Available</h3>
            <p>Check back later for new opportunities</p>
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Jobs Section */}
            <div className="jobs-section">
              <div className="section-header">
                <h2>Latest Opportunities</h2>
                <p>Hand-picked jobs from leading companies</p>
              </div>

              <div className="jobs-list">
                {jobs.map((job) => {
                  const buttonState = getButtonState(job.jobId);

                  return (
                    <div key={job.jobId} className="job-item">
                      <div className="job-header">
                        <div className="job-title-section">
                          <h3 className="job-title">{job.title}</h3>
                          <div className="company-info">
                            <span className="company-name">{job.postedBy}</span>
                            <span className="job-location">
                              {job.location || "Remote"}
                            </span>
                          </div>
                        </div>
                        <div className="job-meta">
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
                          <span className="posted-date">
                            {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="job-description">
                        <p>{job.description}</p>
                      </div>

                      {job.requiredSkills && (
                        <div className="skills-section">
                          <div className="skills-list">
                            {job.requiredSkills
                              .split(",")
                              .slice(0, 4)
                              .map((skill, index) => (
                                <span key={index} className="skill-tag">
                                  {skill.trim()}
                                </span>
                              ))}
                            {job.requiredSkills.split(",").length > 4 && (
                              <span className="skill-tag more">
                                +{job.requiredSkills.split(",").length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="job-footer">
                        <div className="job-details">
                          <span className="detail-item">
                            <span className="detail-icon">💰</span>
                            Competitive Salary
                          </span>
                          {/* <span className="detail-item">
                            <span className="detail-icon">🏢</span>
                            {job.employmentType || "Full-time"}
                          </span> */}
                        </div>
                        <button
                          className={buttonState.className}
                          onClick={() => handleApply(job.jobId)}
                          disabled={buttonState.disabled}
                        >
                          {buttonState.text}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Call to Action */}
            <div className="cta-section">
              <h3>Ready to take the next step?</h3>
              <p>Join thousands of professionals who found their dream job</p>
              <button
                className="cta-button"
                onClick={() => navigate("/jobseeker/profile")}
              >
                Update Your Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
