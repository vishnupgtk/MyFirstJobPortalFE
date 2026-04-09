import { useNavigate } from "react-router-dom";
import { useAuth, useAuthActions } from "../../../store/hooks";
import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  FileText, 
  TrendingUp, 
  Shield,
  LogOut,
  ChevronRight,
  Activity
} from "lucide-react";

const AdminLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeEmployers: 0,
    jobSeekers: 0,
    activeJobs: 0,
    usersChangePercent: 0,
    employersChangePercent: 0,
    jobSeekersChangePercent: 0,
    jobsChangePercent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/admin/statistics");
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const stats = [
    { 
      label: "Total Users", 
      value: loading ? "..." : statistics.totalUsers.toLocaleString(), 
      change: loading ? "..." : `${statistics.usersChangePercent > 0 ? '+' : ''}${statistics.usersChangePercent}%`, 
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      isPositive: statistics.usersChangePercent >= 0
    },
    { 
      label: "Active Employers", 
      value: loading ? "..." : statistics.activeEmployers.toLocaleString(), 
      change: loading ? "..." : `${statistics.employersChangePercent > 0 ? '+' : ''}${statistics.employersChangePercent}%`, 
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      isPositive: statistics.employersChangePercent >= 0
    },
    { 
      label: "Job Seekers", 
      value: loading ? "..." : statistics.jobSeekers.toLocaleString(), 
      change: loading ? "..." : `${statistics.jobSeekersChangePercent > 0 ? '+' : ''}${statistics.jobSeekersChangePercent}%`, 
      icon: UserCheck,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      isPositive: statistics.jobSeekersChangePercent >= 0
    },
    { 
      label: "Active Jobs", 
      value: loading ? "..." : statistics.activeJobs.toLocaleString(), 
      change: loading ? "..." : `${statistics.jobsChangePercent > 0 ? '+' : ''}${statistics.jobsChangePercent}%`, 
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      isPositive: statistics.jobsChangePercent >= 0
    }
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View, edit, and manage all platform users",
      icon: Users,
      path: "/admin/dashboard",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Employer Requests",
      description: "Review pending employer verification requests",
      icon: Shield,
      path: "/admin/requests",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Company History",
      description: "View all company profile change history",
      icon: Activity,
      path: "/admin/history",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Job Seeker History",
      description: "Track job seeker profile modifications",
      icon: TrendingUp,
      path: "/admin/jobseekers/history",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Control Center</h1>
                <p className="text-xs text-gray-500">JobPortal Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName || "Admin"}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.fullName?.charAt(0) || "A"}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullName || "Admin"}! 
          </h2>
          <p className="text-gray-600">
            Monitor platform activity, manage users, and track hiring performance in real-time.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <span className={`text-sm font-semibold ${stat.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all hover:-translate-y-1 text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLanding;
