import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import Toast from "../../shared/Toast/Toast";
import { useAuth } from "../../../store/hooks";
import JobSeekerNavbar from "../JobSeekerNavbar/JobSeekerNavbar";

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
    loadMyApplications();
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
    }
  };

  const handleApply = async (jobId) => {
    if (applyingJobs.has(jobId) || appliedJobs.has(jobId)) {
      return;
    }

    try {
      setApplyingJobs((prev) => new Set([...prev, jobId]));

      await api.post(`/jobs/${jobId}/apply`);

      setAppliedJobs((prev) => new Set([...prev, jobId]));

      showToast(
        "Application submitted successfully! The employer has been notified via email.",
        "success",
      );
    } catch (err) {
      console.error("Apply error:", err);

      if (
        err.response?.status === 400 &&
        (err.response?.data?.includes?.("already applied") ||
          err.message?.includes("already applied"))
      ) {
        setAppliedJobs((prev) => new Set([...prev, jobId]));
        showToast("You have already applied for this job", "info");
      } else {
        showToast("Failed to apply for job. Please try again.", "error");
      }
    } finally {
      setApplyingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const getButtonState = (jobId) => {
    if (appliedJobs.has(jobId)) {
      return { text: "Applied", disabled: true, className: "bg-gray-400 cursor-not-allowed" };
    }
    if (applyingJobs.has(jobId)) {
      return {
        text: "Applying...",
        disabled: true,
        className: "bg-green-400 cursor-wait",
      };
    }
    return { text: "Apply Now", disabled: false, className: "bg-green-600 hover:bg-green-700" };
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
      "Full-time": "bg-green-100 text-green-800",
      "Part-time": "bg-yellow-100 text-yellow-800",
      Contract: "bg-purple-100 text-purple-800",
      Internship: "bg-blue-100 text-blue-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <>
        <JobSeekerNavbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading opportunities...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <JobSeekerNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-4">Find Your Dream Job</h1>
            <p className="text-xl opacity-90 mb-6">Discover amazing opportunities from top companies</p>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{jobs.length}</div>
                <div className="text-sm opacity-90">Open Positions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm opacity-90">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">Remote</div>
                <div className="text-sm opacity-90">Friendly</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-16 text-center">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Available</h3>
              <p className="text-gray-600 mb-6">Check back later for new opportunities</p>
              <button
                onClick={() => navigate("/jobseeker/dashboard")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Jobs Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Latest Opportunities</h2>
                    <p className="text-gray-600">Hand-picked jobs from leading companies</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {jobs.map((job) => {
                    const buttonState = getButtonState(job.jobId);

                    return (
                      <div
                        key={job.jobId}
                        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {job.postedBy}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location || "Remote"}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(job.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {job.employmentType && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEmploymentTypeColor(job.employmentType)}`}>
                                {job.employmentType}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">{job.description}</p>

                        {job.requiredSkills && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {job.requiredSkills
                                .split(",")
                                .slice(0, 6)
                                .map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                                  >
                                    {skill.trim()}
                                  </span>
                                ))}
                              {job.requiredSkills.split(",").length > 6 && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                  +{job.requiredSkills.split(",").length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Competitive Salary
                            </span>
                          </div>
                          <button
                            className={`px-6 py-2 text-white rounded-lg font-semibold transition-all ${buttonState.className}`}
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
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-2">Ready to take the next step?</h3>
                <p className="text-lg opacity-90 mb-6">Join thousands of professionals who found their dream job</p>
                <button
                  onClick={() => navigate("/jobseeker/profile")}
                  className="px-8 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Update Your Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default JobSearch;
