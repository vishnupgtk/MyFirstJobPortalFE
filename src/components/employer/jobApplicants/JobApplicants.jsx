import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import Toast from "../../shared/Toast/Toast";
import EmployerNavbar from "../EmployerNavbar/EmployerNavbar";
import BackButton from "../../shared/BackButton/BackButton";

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const isAllApplicantsView = !jobId;

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [hasJobs, setHasJobs] = useState(true);
  const [showMatchingScores, setShowMatchingScores] = useState(false);

  useEffect(() => {
    loadApplicants();
  }, [jobId, showMatchingScores]);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      if (!jobId) {
        const jobsResponse = await api.get("/jobs/my-jobs");
        const jobs = jobsResponse.data || [];
        if (jobs.length > 0) {
          setHasJobs(true);
          const applicantsByJob = await Promise.all(
            jobs.map(async (job) => {
              const endpoint = showMatchingScores 
                ? `/jobs/${job.jobId}/applicants-with-scores`
                : `/jobs/${job.jobId}/applicants`;
              const res = await api.get(endpoint);
              return (res.data || []).map((applicant) => ({
                ...applicant,
                jobId: job.jobId,
                jobTitle: job.title,
              }));
            }),
          );
          setApplicants(applicantsByJob.flat());
          return;
        }
        setHasJobs(false);
        setApplicants([]);
        return;
      }

      const endpoint = showMatchingScores 
        ? `/jobs/${jobId}/applicants-with-scores`
        : `/jobs/${jobId}/applicants`;
      const response = await api.get(endpoint);
      setApplicants(response.data);
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

  const updateApplicationStatus = async (applicantUserId, newStatus, targetJobId = jobId) => {
    const key = `${targetJobId}-${applicantUserId}-${newStatus}`;
    setUpdatingStatus(prev => ({ ...prev, [key]: true }));

    try {
      await api.put(`/jobs/${targetJobId}/applicants/${applicantUserId}/status`, {
        status: newStatus
      });

      setApplicants(prev => 
        prev.map(applicant => 
          applicant.userId === applicantUserId &&
          String(applicant.jobId || jobId || "") === String(targetJobId || "")
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
      <>
        <EmployerNavbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading applicants...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <EmployerNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isAllApplicantsView ? "All Applicants" : "Job Applicants"}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {applicants.length} {applicants.length === 1 ? "applicant" : "applicants"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMatchingScores}
                    onChange={(e) => setShowMatchingScores(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Match Scores</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!error && !jobId && !hasJobs && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Posted Yet</h3>
            <p className="text-gray-600 mb-6">Post a job to start receiving applicants</p>
            <button
              onClick={() => navigate("/employer/jobs/new")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Post New Job
            </button>
          </div>
        )}

        {!error && applicants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">
              When job seekers apply for this position, they'll appear here
            </p>
            <button
              onClick={() => navigate("/employer/jobs")}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200"
            >
              Back to My Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant) => (
              <div
                key={`${applicant.userId}-${applicant.jobId || "any"}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
              >
                {/* Applicant Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {applicant.fullName}
                      </h3>
                      {showMatchingScores && applicant.matchPercentage != null && (
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                            applicant.matchPercentage >= 80 ? "bg-green-100 text-green-800" :
                            applicant.matchPercentage >= 60 ? "bg-blue-100 text-blue-800" :
                            applicant.matchPercentage >= 40 ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {applicant.matchPercentage.toFixed(0)}% Match
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{applicant.email}</p>
                    {isAllApplicantsView && applicant.jobTitle && (
                      <p className="text-sm text-blue-600 mt-1">{applicant.jobTitle}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        applicant.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : applicant.status === "Reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : applicant.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {applicant.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      Applied {formatDate(applicant.appliedAt)}
                    </span>
                  </div>
                </div>

                {/* Match Details */}
                {showMatchingScores && applicant.matchDetails && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Match Breakdown</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Skills Match</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(applicant.matchDetails.skillMatch.score * 100).toFixed(0)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">
                            {(applicant.matchDetails.skillMatch.score * 100).toFixed(0)}%
                          </span>
                        </div>
                        {applicant.matchDetails.skillMatch.matchedRequiredSkills.length > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {applicant.matchDetails.skillMatch.matchedRequiredSkills.join(", ")}
                          </p>
                        )}
                        {applicant.matchDetails.skillMatch.missingRequiredSkills.length > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            ✗ Missing: {applicant.matchDetails.skillMatch.missingRequiredSkills.join(", ")}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Experience Match</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(applicant.matchDetails.experienceMatch.score * 100).toFixed(0)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">
                            {(applicant.matchDetails.experienceMatch.score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {applicant.matchDetails.experienceMatch.candidateYears || 0} years 
                          {applicant.matchDetails.experienceMatch.requiredYears && 
                            ` (Required: ${applicant.matchDetails.experienceMatch.requiredYears})`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {applicant.skills && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {applicant.skills.split(",").map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewProfile(applicant.userId)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    View Profile
                  </button>

                  <div className="flex gap-2">
                    {applicant.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(applicant.userId, "Reviewed", applicant.jobId || jobId)}
                          disabled={updatingStatus[`${applicant.jobId || jobId}-${applicant.userId}-Reviewed`]}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus[`${applicant.jobId || jobId}-${applicant.userId}-Reviewed`] ? "..." : "Review"}
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(applicant.userId, "Accepted", applicant.jobId || jobId)}
                          disabled={updatingStatus[`${applicant.jobId || jobId}-${applicant.userId}-Accepted`]}
                          className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus[`${applicant.jobId || jobId}-${applicant.userId}-Accepted`] ? "..." : "Accept"}
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(applicant.userId, "Rejected", applicant.jobId || jobId)}
                          disabled={updatingStatus[`${applicant.jobId || jobId}-${applicant.userId}-Rejected`]}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus[`${applicant.jobId || jobId}-${applicant.userId}-Rejected`] ? "..." : "Reject"}
                        </button>
                      </>
                    )}

                    {applicant.status === "Reviewed" && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(applicant.userId, "Accepted", applicant.jobId || jobId)}
                          disabled={updatingStatus[`${applicant.jobId || jobId}-${applicant.userId}-Accepted`]}
                          className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus[`${applicant.jobId || jobId}-${applicant.userId}-Accepted`] ? "..." : "Accept"}
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(applicant.userId, "Rejected", applicant.jobId || jobId)}
                          disabled={updatingStatus[`${applicant.jobId || jobId}-${applicant.userId}-Rejected`]}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus[`${applicant.jobId || jobId}-${applicant.userId}-Rejected`] ? "..." : "Reject"}
                        </button>
                      </>
                    )}

                    {(applicant.status === "Accepted" || applicant.status === "Rejected") && (
                      <div className="px-4 py-2 text-gray-600 font-medium">
                        {applicant.status === "Accepted"
                          ? "✓ Application Accepted"
                          : "✗ Application Rejected"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
    </>
  );
};

export default JobApplicants;
