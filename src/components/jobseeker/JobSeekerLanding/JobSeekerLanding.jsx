import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../store/hooks";
import Toast from "../../shared/Toast/Toast";
import JobSeekerNavbar from "../JobSeekerNavbar/JobSeekerNavbar";

const JobSeekerLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    availableJobs: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [applicationsRes, jobsRes, profileRes] = await Promise.all([
        api.get("/jobs/my-applications"),
        api.get("/jobs"),
        api.get("/jobseeker/profile"),
      ]);

      const applications = applicationsRes.data;
      
      setStats({
        totalApplications: applications.length,
        pendingApplications: applications.filter(a => a.status === "Pending").length,
        acceptedApplications: applications.filter(a => a.status === "Accepted").length,
        rejectedApplications: applications.filter(a => a.status === "Rejected").length,
        availableJobs: jobsRes.data.length,
      });

      setRecentApplications(applications.slice(0, 5));
      setProfile(profileRes.data);
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

  const calculateProfileCompletion = () => {
    if (!profile) return { percentage: 0, missingFields: [] };

    const fields = [
      { name: 'summary', label: 'About/Summary', value: profile.summary },
      { name: 'education', label: 'Education', value: profile.education },
      { name: 'college', label: 'College/University', value: profile.college },
      { name: 'skills', label: 'Skills', value: profile.skills },
      { name: 'resume', label: 'Resume', value: profile.resumeFileName },
    ];

    const filledFields = fields.filter(field => field.value && field.value.trim() !== '');
    const percentage = Math.round((filledFields.length / fields.length) * 100);
    const missingFields = fields.filter(field => !field.value || field.value.trim() === '');

    return { percentage, missingFields };
  };

  const profileCompletion = calculateProfileCompletion();

  if (loading) {
    return (
      <>
        <JobSeekerNavbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-green-600 rounded-full opacity-20 animate-pulse"></div>
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
      <JobSeekerNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.fullName?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your job search today
            </p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <MetricCard
              title="Total Applications"
              value={stats.totalApplications}
              icon="📋"
              color="blue"
              onClick={() => navigate("/jobseeker/applications")}
            />
            <MetricCard
              title="Pending"
              value={stats.pendingApplications}
              icon="⏳"
              color="yellow"
              onClick={() => navigate("/jobseeker/applications?filter=Pending")}
            />
            <MetricCard
              title="Accepted"
              value={stats.acceptedApplications}
              icon="✅"
              color="green"
              onClick={() => navigate("/jobseeker/applications?filter=Accepted")}
              trend={stats.acceptedApplications > 0 ? "up" : null}
            />
            <MetricCard
              title="Available Jobs"
              value={stats.availableJobs}
              icon="💼"
              color="purple"
              onClick={() => navigate("/jobseeker/jobs")}
            />
            <MetricCard
              title="Profile Views"
              value="--"
              icon="👁️"
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Recent Applications
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Track your latest job applications
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/jobseeker/applications")}
                    className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center space-x-1 hover:underline"
                  >
                    <span>View All</span>
                    <span>→</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {recentApplications.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-gray-500 mb-6 text-lg">
                        No applications yet
                      </p>
                      <button
                        onClick={() => navigate("/jobseeker/jobs")}
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <span className="mr-2">🚀</span>
                        <span>Start Applying</span>
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
                            Company
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Applied
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {recentApplications.map((app) => (
                          <tr
                            key={app.jobId}
                            className="hover:bg-green-50 transition-colors cursor-pointer"
                            onClick={() => navigate("/jobseeker/applications")}
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {app.title}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">
                                {app.postedBy}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status || "Pending")}`}
                              >
                                {app.status || "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                              {formatDate(app.appliedAt || app.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    Quick Actions
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your job search
                  </p>
                </div>
                <div className="p-6 space-y-3">
                  <QuickActionButton
                    icon="🔍"
                    title="Browse Jobs"
                    description="Find new opportunities"
                    onClick={() => navigate("/jobseeker/jobs")}
                    color="green"
                  />
                  <QuickActionButton
                    icon="👤"
                    title="Update Profile"
                    description="Keep your profile current"
                    onClick={() => navigate("/jobseeker/profile")}
                    color="blue"
                  />
                  <QuickActionButton
                    icon="📄"
                    title="Upload Resume"
                    description="Add or update your resume"
                    onClick={() => navigate("/jobseeker/profile?edit=1")}
                    color="purple"
                  />
                  <QuickActionButton
                    icon="📊"
                    title="View Applications"
                    description="Track application status"
                    onClick={() => navigate("/jobseeker/applications")}
                    color="yellow"
                  />
                </div>
              </div>

              {/* Profile Completion */}
              <div className="mt-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-md p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Profile Strength</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Complete your profile</span>
                    <span className="font-semibold">{profileCompletion.percentage}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-500" 
                      style={{ width: `${profileCompletion.percentage}%` }}
                    ></div>
                  </div>
                </div>
                {profileCompletion.percentage === 100 ? (
                  <p className="text-sm opacity-90 mb-4">
                    🎉 Your profile is complete! You're ready to impress employers.
                  </p>
                ) : (
                  <div className="text-sm opacity-90 mb-4">
                    <p className="mb-2">Missing fields:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {profileCompletion.missingFields.slice(0, 3).map((field) => (
                        <li key={field.name}>{field.label}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => navigate(profileCompletion.percentage === 100 ? "/jobseeker/profile" : "/jobseeker/profile?edit=1")}
                  className="w-full bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  {profileCompletion.percentage === 100 ? "View Profile" : "Complete Profile"}
                </button>
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
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    yellow: "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
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
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
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

const QuickActionButton = ({ icon, title, description, onClick, color }) => {
  const colorClasses = {
    green: "hover:bg-green-50 hover:border-green-200",
    blue: "hover:bg-blue-50 hover:border-blue-200",
    purple: "hover:bg-purple-50 hover:border-purple-200",
    yellow: "hover:bg-yellow-50 hover:border-yellow-200",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start space-x-3 p-4 border border-gray-200 rounded-lg transition-all ${colorClasses[color]}`}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 text-left">
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

export default JobSeekerLanding;
