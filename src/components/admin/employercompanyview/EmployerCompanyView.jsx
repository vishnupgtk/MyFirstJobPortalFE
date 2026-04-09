import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import CompanyProfileView from "../../common/companyprofileview/CompanyProfileView";
import Toast from "../../shared/Toast/Toast";

const EmployerCompanyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/company/user/${id}`);
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to load employer company profile:", error);
      setToast({
        show: true,
        message: "Failed to load employer company details",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <CommonHeader
          userName="Admin"
          showProfileButton={false}
          showEmployerAudit={false}
          showJobSeekerAudit={false}
          showRoleText={true}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <CommonHeader
        userName={profile?.employerName || "Employer"}
        showProfileButton={false}
        showEmployerAudit={false}
        showJobSeekerAudit={false}
        isReadOnly={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mb-6 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          Back to Admin Dashboard
        </button>

        {profile ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{profile.companyName || "-"}</h1>
              <p className="text-sm text-gray-600 mt-1">Employer: {profile.employerName || "-"}</p>
            </div>
            <CompanyProfileView profile={profile} readOnly={true} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-gray-600">
            No company details found.
          </div>
        )}
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
};

export default EmployerCompanyView;
