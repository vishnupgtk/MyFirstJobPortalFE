import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../store/hooks";
import Toast from "../../shared/Toast/Toast";
import EmployerNavbar from "../EmployerNavbar/EmployerNavbar";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [jobsOverview, setJobsOverview] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, jobsRes, applicantsRes] = await Promise.all([
        api.get("/jobs/dashboard/metrics"),
        api.get("/jobs/dashboard/jobs-overview"),
        api.get("/jobs/dashboard/recent-applicants"),
      ]);

      setMetrics(metricsRes.data);
      setJobsOverview(jobsRes.data);
      setRecentApplicants(applicantsRes.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setToast({
        show: true,
        message: "Failed to load dashboard data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Reviewed: "bg-blue-100 text-blue-800",
      Accepted: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleQuickAction = async (applicantUserId, jobId, action) => {
    try {
      await api.put(`/jobs/${jobId}/applicants/${applicantUserId}/status`, {
        status: action,
      });
      setToast({
        show: true,
        message: `Application ${action.toLowerCase()} successfully`,
        type: "success",
      });
      loadDashboardData();
    } catch (err) {
      setToast({
        show: true,
        message: "Failed to update application status",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <>
        <EmployerNavbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <EmployerNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard
              title="Active Jobs"
              value={metrics?.activeJobs || 0}
              icon="📋"
              color="blue"
              onClick={() => navigate("/employer/jobs")}
            />
            <MetricCard
              title="Total Applicants"
              value={metrics?.totalApplicants || 0}
              icon="👥"
              color="purple"
              onClick={() => navigate("/employer/applicants")}
            />
            <MetricCard
              title="New (24h)"
              value={metrics?.newApplicants || 0}
              icon="🆕"
              color="green"
              trend={metrics?.newApplicants > 0 ? "up" : null}
            />
            <MetricCard
              title="Shortlisted"
              value={metrics?.shortlistedCandidates || 0}
              icon="⭐"
              color="yellow"
            />
            <MetricCard
              title="Interviews"
              value={metrics?.interviewsScheduled || 0}
              icon="📅"
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Jobs Overview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Jobs Overview
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage your active job postings
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/employer/jobs")}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1 hover:underline"
                  >

                  </button>
                </div>
                <div className="overflow-x-auto">
                  {jobsOverview.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <div className="text-6xl mb-4">📝</div>
                      <p className="text-gray-500 mb-6 text-lg">
                        No jobs posted yet
                      </p>
                      <button
                        onClick={() => navigate("/employer/jobs/new")}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <span className="mr-2">+</span>
                        <span>Post your first job</span>
                      </button>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Job Title
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Applicants
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            New
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {jobsOverview.map((job) => (
                          <tr
                            key={job.jobId}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {job.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Posted {formatDate(job.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">
                                {job.applicantCount}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {job.newApplicantCount > 0 ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                  +{job.newApplicantCount}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  job.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {job.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/employer/jobs/${job.jobId}/applicants`,
                                  )
                                }
                                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                              >
                                View Applicants →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Applications
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Latest candidate submissions
                  </p>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {recentApplicants.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <div className="text-5xl mb-4">📭</div>
                      <p className="text-gray-500 text-sm">
                        No applications yet
                      </p>
                    </div>
                  ) : (
                    recentApplicants.map((applicant) => (
                      <div
                        key={`${applicant.userId}-${applicant.jobId}`}
                        className="px-6 py-4 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {applicant.fullName}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {applicant.jobTitle}
                            </p>
                          </div>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(applicant.status)}`}
                          >
                            {applicant.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-medium">
                            {formatDate(applicant.appliedAt)}
                          </span>
                          <div className="flex gap-2">
                            {applicant.status === "Pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleQuickAction(
                                      applicant.userId,
                                      applicant.jobId,
                                      "Accepted",
                                    )
                                  }
                                  className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Accept"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickAction(
                                      applicant.userId,
                                      applicant.jobId,
                                      "Rejected",
                                    )
                                  }
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() =>
                                navigate(`/jobseekers/${applicant.userId}`)
                              }
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.show}
            onClose={() => setToast({ show: false, message: "", type: "" })}
          />
        )}
      </div>
    </>
  );
};

const MetricCard = ({ title, value, icon, color = "blue", trend, onClick }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    purple:
      "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    green:
      "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    yellow:
      "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
    red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-md p-6 text-white transform transition-all duration-200 ${
        onClick ? "cursor-pointer hover:scale-105 hover:shadow-xl" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-4xl opacity-90">{icon}</span>
        {trend && (
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-bold flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            New
          </span>
        )}
      </div>
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-sm font-medium opacity-90">{title}</div>
    </div>
  );
};

export default EmployerDashboard;
