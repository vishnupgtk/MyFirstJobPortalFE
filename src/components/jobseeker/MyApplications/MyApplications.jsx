import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../store/hooks";
import JobSeekerNavbar from "../JobSeekerNavbar/JobSeekerNavbar";

const MyApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("filter") || "All");

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam) {
      setActiveFilter(filterParam);
      filterApplications(filterParam);
    } else {
      setActiveFilter("All");
      setFilteredApplications(applications);
    }
  }, [searchParams, applications]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs/my-applications");
      setApplications(response.data);
      
      const filterParam = searchParams.get("filter");
      if (filterParam) {
        const filtered = response.data.filter(app => (app.status || "Pending") === filterParam);
        setFilteredApplications(filtered);
      } else {
        setFilteredApplications(response.data);
      }
    } catch (err) {
      setError("Failed to load applications");
      console.error("Load applications error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = (status) => {
    if (status === "All") {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(app => (app.status || "Pending") === status);
      setFilteredApplications(filtered);
    }
  };

  const handleFilterChange = (status) => {
    setActiveFilter(status);
    if (status === "All") {
      setSearchParams({});
      setFilteredApplications(applications);
    } else {
      setSearchParams({ filter: status });
      filterApplications(status);
    }
  };

  const getStatusCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => (app.status || "Pending") === "Pending").length,
      reviewed: applications.filter(app => app.status === "Reviewed").length,
      accepted: applications.filter(app => app.status === "Accepted").length,
      rejected: applications.filter(app => app.status === "Rejected").length,
    };
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

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Reviewed: "bg-blue-100 text-blue-800",
      Accepted: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <>
        <JobSeekerNavbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading your applications...</p>
          </div>
        </div>
      </>
    );
  }

  const counts = getStatusCounts();

  return (
    <>
      <JobSeekerNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-2">Track your job application status</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <div className="flex flex-wrap gap-2">
              <FilterButton
                label="All"
                count={counts.all}
                active={activeFilter === "All"}
                onClick={() => handleFilterChange("All")}
                color="gray"
              />
              <FilterButton
                label="Pending"
                count={counts.pending}
                active={activeFilter === "Pending"}
                onClick={() => handleFilterChange("Pending")}
                color="yellow"
              />
              <FilterButton
                label="Reviewed"
                count={counts.reviewed}
                active={activeFilter === "Reviewed"}
                onClick={() => handleFilterChange("Reviewed")}
                color="blue"
              />
              <FilterButton
                label="Accepted"
                count={counts.accepted}
                active={activeFilter === "Accepted"}
                onClick={() => handleFilterChange("Accepted")}
                color="green"
              />
              <FilterButton
                label="Rejected"
                count={counts.rejected}
                active={activeFilter === "Rejected"}
                onClick={() => handleFilterChange("Rejected")}
                color="red"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-16 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {activeFilter === "All" ? "No Applications Yet" : `No ${activeFilter} Applications`}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeFilter === "All" 
                  ? "Start applying for jobs to see them here"
                  : `You don't have any ${activeFilter.toLowerCase()} applications`
                }
              </p>
              {activeFilter === "All" ? (
                <button
                  onClick={() => navigate("/jobseeker/jobs")}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Search Jobs
                </button>
              ) : (
                <button
                  onClick={() => handleFilterChange("All")}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  View All Applications
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredApplications.map((job) => (
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
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status || "Pending")}`}>
                        {job.status || "Pending"}
                      </span>
                      {job.employmentType && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEmploymentTypeColor(job.employmentType)}`}>
                          {job.employmentType}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {job.description.length > 200
                      ? `${job.description.substring(0, 200)}...`
                      : job.description}
                  </p>

                  {job.requiredSkills && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills
                          .split(",")
                          .slice(0, 5)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        {job.requiredSkills.split(",").length > 5 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            +{job.requiredSkills.split(",").length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Posted:</span>
                        <span className="ml-1">{formatDate(job.createdAt)}</span>
                      </span>
                      {job.appliedAt && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Applied:</span>
                          <span className="ml-1">{formatDate(job.appliedAt)}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      Status: {job.status || "Pending"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const FilterButton = ({ label, count, active, onClick, color }) => {
  const colorClasses = {
    gray: active 
      ? "bg-gray-600 text-white border-gray-600" 
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
    yellow: active 
      ? "bg-yellow-500 text-white border-yellow-500" 
      : "bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50",
    blue: active 
      ? "bg-blue-500 text-white border-blue-500" 
      : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50",
    green: active 
      ? "bg-green-500 text-white border-green-500" 
      : "bg-white text-green-700 border-green-300 hover:bg-green-50",
    red: active 
      ? "bg-red-500 text-white border-red-500" 
      : "bg-white text-red-700 border-red-300 hover:bg-red-50",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${colorClasses[color]}`}
    >
      {label} <span className={`ml-1 ${active ? "opacity-90" : "opacity-60"}`}>({count})</span>
    </button>
  );
};

export default MyApplications;
