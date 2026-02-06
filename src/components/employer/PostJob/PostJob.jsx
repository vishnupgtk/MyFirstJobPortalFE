import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import { useAuth } from "../../../store/hooks";
import Toast from "../../shared/Toast/Toast";
import "./PostJob.css";

export default function PostJob() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    experienceLevel: "",
    employmentType: "",
    location: "",
    salaryRange: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate all required fields
    const requiredFields = {
      title: "Job Title",
      description: "Job Description", 
      requiredSkills: "Required Skills",
      experienceLevel: "Experience Level",
      employmentType: "Employment Type",
      location: "Location",
      salaryRange: "Salary Range"
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === "") {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      const errorMessage = `Please fill in all required fields: ${missingFields.join(", ")}`;
      setError(errorMessage);
      setToast({
        show: true,
        message: errorMessage,
        type: "error"
      });
      setLoading(false);
      return;
    }

    try {
      await api.post("/jobs", formData);
      setToast({
        show: true,
        message: "Job posted successfully!",
        type: "success"
      });
      setTimeout(() => navigate("/employer/jobs"), 2000);
    } catch (err) {
      setError("Failed to post job. Please try again.");
      setToast({
        show: true,
        message: "Failed to post job. Please try again.",
        type: "error"
      });
      console.error("Post job error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-page">
      <CommonHeader 
        userName={user?.fullName} 
        showProfileButton={true}
        showMyJobsButton={true}
      />

      <div className="post-job-container">
        <div className="post-job-header">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h1>Post New Job</h1>
          <p>Fill out the details below to post a new job opening</p>
        </div>

        <form className="post-job-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. New York, NY / Remote"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows="6"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employmentType">Employment Type *</label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experienceLevel">Experience Level *</label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select Level</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="requiredSkills">Required Skills *</label>
            <input
              type="text"
              id="requiredSkills"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Python, SQL (comma separated)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="salaryRange">Salary Range *</label>
            <input
              type="text"
              id="salaryRange"
              name="salaryRange"
              value={formData.salaryRange}
              onChange={handleChange}
              placeholder="e.g. $80,000 - $120,000 per year"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
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
}

