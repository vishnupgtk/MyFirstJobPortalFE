import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import Toast from "../../shared/Toast/Toast";
import EmployerNavbar from "../EmployerNavbar/EmployerNavbar";

const MyJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    loadMyJobs();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [jobs, filter, searchQuery, sortBy]);

  const loadMyJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs/my-jobs");
      setJobs(response.data);
    } catch (err) {
      console.error("Load jobs error:", err);
      setToast({ show: true, message: "Failed to load jobs", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...jobs];

    if (searchQuery) {
      result = result.filter((job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter === "Active") {
      result = result.filter((job) => job.status !== "Closed");
    } else if (filter === "Closed") {
      result = result.filter((job) => job.status === "Closed");
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "applicants") {
      result.sort((a, b) => (b.applicantCount || 0) - (a.applicantCount || 0));
    }

    setFilteredJobs(result);
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

  const handleCloseJob = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/close`);
      setToast({ show: true, message: "Job closed successfully", type: "success" });
      await loadMyJobs();
    } catch (err) {
      console.error("Close job error:", err);
      setToast({ show: true, message: "Failed to close job", type: "error" });
    }
  };

  if (loading) {
    return (
      <>
        <EmployerNavbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading your jobs...</p>
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
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
              <p className="text-gray-600 mt-1">{jobs.length} {jobs.length === 1 ? "job" : "jobs"} posted</p>
            </div>

          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filter Tabs */}
              <div className="flex space-x-2">
                {["All", "Active", "Closed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === tab
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search by job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="applicants">Most Applicants</option>
              </select>
            </div>
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Start by posting your first job"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => navigate("/employer/jobs/new")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  Post Your First Job
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEmploymentTypeColor(job.employmentType)}`}>
                              {job.employmentType}
                            </span>
                            {job.location && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {job.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              job.status === "Closed"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {job.status || "Active"}
                          </span>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{job.applicantCount || 0}</div>
                            <div className="text-xs text-gray-500">Applicants</div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

                      {job.requiredSkills && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requiredSkills.split(",").slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-500">Posted {formatDate(job.createdAt)}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/employer/jobs/${job.jobId}/applicants`)}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-all text-sm"
                          >
                            View Applicants
                          </button>
                          <button
                            onClick={() => navigate(`/employer/jobs/${job.jobId}/edit`)}
                            disabled={job.status === "Closed"}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCloseJob(job.jobId)}
                            disabled={job.status === "Closed"}
                            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {job.status === "Closed" ? "Closed" : "Close Job"}
                          </button>
                        </div>
                      </div>
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
          isVisible={toast.show}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
    </>
  );
};

export default MyJobs;
