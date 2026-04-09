import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../../api/axios";
import EmployerNavbar from "../EmployerNavbar/EmployerNavbar";
import CompanyProfileView from "../../common/companyprofileview/CompanyProfileView";
import CompanyProfileEdit from "../../common/companyprofileedit/CompanyProfileEdit";
import Toast from "../../shared/Toast/Toast";
import { ChevronLeft, Shield, LogOut } from "lucide-react";
import { useAuth, useAuthActions } from "../../../store/hooks";
import { ROLES } from "../../../constants/roles.jsx";
import "../employerdashboard/EmployerDashboard.css";

const CompanyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role, user } = useAuth();
  const { logout } = useAuthActions();
  const isAdminReadOnlyView = role === ROLES.ADMIN && Boolean(id);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    loadProfile();
  }, [id, role]);

  useEffect(() => {
    if (!isAdminReadOnlyView) {
      setEditing(searchParams.get("edit") === "1");
    }
  }, [searchParams, isAdminReadOnlyView]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (isAdminReadOnlyView) {
        const adminUrls = [
          `/company/user/${id}`,
          `/admin/company/${id}`,
          `/view/company/${id}`,
        ];

        let loaded = false;
        for (const url of adminUrls) {
          try {
            const res = await api.get(url);
            setProfile(res.data);
            loaded = true;
            break;
          } catch (innerErr) {
            if (innerErr?.response?.status !== 404) {
              throw innerErr;
            }
          }
        }

        if (!loaded) {
          throw new Error("Company profile endpoint not found");
        }
      } else {
        const res = await api.get("/company/me");
        setProfile(res.data);
      }
    } catch (err) {
      console.error("Load company profile error:", err);
      setToast({
        show: true,
        message: "Failed to load company profile",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleSave = async (updatedProfile) => {
    try {
      const fieldMap = {
        companyName: "CompanyName",
        industry: "Industry",
        description: "Description",
        address: "Address",
        locations: "Locations",
        companyType: "CompanyType",
      };

      const requests = Object.entries(fieldMap)
        .filter(([key]) => (profile?.[key] || "") !== (updatedProfile?.[key] || ""))
        .map(([key, fieldName]) =>
          api.post("/company/request-change", {
            companyId: profile.companyId,
            fieldName,
            newValue: updatedProfile[key] || "",
          }),
        );

      if (requests.length === 0) {
        setEditing(false);
        return;
      }

      await Promise.all(requests);
      setEditing(false);
      setSearchParams({});
      setToast({
        show: true,
        message: "Change request submitted for admin approval",
        type: "success",
      });
      await loadProfile();
    } catch (err) {
      console.error("Save company profile error:", err);
      setToast({
        show: true,
        message: "Failed to submit profile changes",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <>
        {isAdminReadOnlyView ? (
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate("/admin/dashboard")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Company View</h1>
                    <p className="text-xs text-gray-500">Read-only employer company details</p>
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
        ) : (
          <EmployerNavbar />
        )}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-gray-600 font-medium">Loading company profile...</div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        {isAdminReadOnlyView ? (
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate("/admin/dashboard")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Company View</h1>
                    <p className="text-xs text-gray-500">Read-only employer company details</p>
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
        ) : (
          <EmployerNavbar />
        )}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-gray-600 font-medium">No company profile found</div>
        </div>
      </>
    );
  }

  return (
    <>
      {isAdminReadOnlyView ? (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Company View</h1>
                  <p className="text-xs text-gray-500">Read-only employer company details</p>
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
      ) : (
        <EmployerNavbar />
      )}
      <div className="employer-page">
        <div className="company-banner">
          <h1>{profile.companyName}</h1>
          <p className="subtitle">My Profile - Job Management</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Industry</span>
            <h3>{profile.industry || "-"}</h3>
          </div>
          <div className="stat-card">
            <span>Locations</span>
            <h3>{profile.locations || "-"}</h3>
          </div>
          <div className="stat-card">
            <span>Company Type</span>
            <h3>{profile.companyType || "-"}</h3>
          </div>
        </div>

        <CompanyProfileView
          profile={profile}
          readOnly={true}
          onEdit={() => {}}
        />

        {editing && !isAdminReadOnlyView && (
          <CompanyProfileEdit
            profile={profile}
            onCancel={() => {
              setEditing(false);
              setSearchParams({});
            }}
            onSave={handleSave}
          />
        )}
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

export default CompanyProfile;
