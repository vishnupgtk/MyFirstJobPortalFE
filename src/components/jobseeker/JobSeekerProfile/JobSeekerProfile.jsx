import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../api/axios";
import Toast from "../../shared/Toast/Toast";
import { useAuth } from "../../../store/hooks";
import { ROLES } from "../../../constants/roles.jsx";
import JobSeekerNavbar from "../JobSeekerNavbar/JobSeekerNavbar";

const JobSeekerProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, user } = useAuth();

  const isJobSeeker = role === ROLES.JOB_SEEKER;
  const isMyProfilePage = isJobSeeker && location.pathname === "/jobseeker/profile";
  const canEdit = isMyProfilePage;
  const isReadOnlyView = (role === ROLES.ADMIN || role === ROLES.EMPLOYER) && Boolean(id);

  const [profile, setProfile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    summary: "",
    education: "",
    college: "",
    skills: "",
  });
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    loadProfile();
  }, [id, location.pathname]);

  useEffect(() => {
    if (searchParams.get("edit") === "1" && canEdit) {
      setShowEditModal(true);
    }
  }, [searchParams, canEdit]);

  const loadProfile = async () => {
    try {
      const url = isMyProfilePage ? "/jobseeker/profile" : `/view/jobseeker/${id}`;
      const res = await api.get(url);
      setProfile(res.data);
      setEditData({
        summary: res.data.summary || "",
        education: res.data.education || "",
        college: res.data.college || "",
        skills: res.data.skills || "",
      });
    } catch (err) {
      console.error("Failed to load job seeker profile", err);
    }
  };

  const handleSave = async () => {
    try {
      await api.put("/jobseeker/profile", editData);
      setShowEditModal(false);
      loadProfile();
      setToast({
        show: true,
        message: "Profile updated successfully",
        type: "success",
      });
      // Remove edit parameter from URL
      navigate(location.pathname, { replace: true });
    } catch {
      setToast({
        show: true,
        message: "Update failed",
        type: "error",
      });
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    // Reset edit data to original profile data
    setEditData({
      summary: profile?.summary || "",
      education: profile?.education || "",
      college: profile?.college || "",
      skills: profile?.skills || "",
    });
    // Remove edit parameter from URL
    navigate(location.pathname, { replace: true });
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await api.post("/jobseeker/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast({
        show: true,
        message: "Resume uploaded successfully",
        type: "success",
      });
      loadProfile();
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || "Failed to upload resume",
        type: "error",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your resume?")) return;

    try {
      await api.delete("/jobseeker/resume");
      setToast({
        show: true,
        message: "Resume deleted successfully",
        type: "success",
      });
      loadProfile();
    } catch {
      setToast({
        show: true,
        message: "Failed to delete resume",
        type: "error",
      });
    }
  };

  const handleResumeDownload = async () => {
    try {
      const url = isMyProfilePage 
        ? "/jobseeker/resume/download" 
        : `/view/jobseeker/${id}/resume`;
      
      const response = await api.get(url, {
        responseType: "blob",
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = profile.resumeFileName || "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setToast({
        show: true,
        message: "Failed to download resume",
        type: "error",
      });
    }
  };

  const handleBackClick = () => {
    if (role === ROLES.ADMIN) {
      navigate("/admin/dashboard");
    } else if (role === ROLES.EMPLOYER) {
      navigate(-1);
    } else if (role === ROLES.JOB_SEEKER) {
      navigate("/jobseeker/dashboard");
    }
  };

  if (!profile) {
    return (
      <>
        {isJobSeeker && <JobSeekerNavbar />}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isJobSeeker && <JobSeekerNavbar />}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          {(isReadOnlyView || isMyProfilePage) && (
            <button
              onClick={handleBackClick}
              className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
            </button>
          )}

          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
            <div className="h-32 bg-gradient-to-r from-green-500 to-teal-600"></div>
            <div className="px-8 pb-8">
              <div className="flex items-end justify-between -mt-16 mb-6">
                <div className="flex items-end space-x-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold">
                    {profile.fullName?.charAt(0) || "U"}
                  </div>
                  <div className="pb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                    <p className="text-gray-600 mt-1">{profile.email}</p>
                    {profile.education && (
                      <p className="text-sm text-gray-500 mt-1">🎓 {profile.education}</p>
                    )}
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Resume Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Resume</h2>
                  <p className="text-sm text-gray-500">Upload your resume (PDF, DOC, DOCX - Max 5MB)</p>
                </div>
              </div>
            </div>

            {profile.resumeFileName ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{profile.resumeFileName}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded {profile.resumeUploadedAt ? new Date(profile.resumeUploadedAt).toLocaleDateString() : "recently"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleResumeDownload}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all"
                  >
                    Download
                  </button>
                  {canEdit && (
                    <>
                      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all cursor-pointer">
                        Update
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      <button
                        onClick={handleResumeDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {canEdit ? (
                  <>
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-gray-500 mb-4">No resume uploaded yet</p>
                    <label className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold cursor-pointer transition-all shadow-md hover:shadow-lg">
                      {uploading ? "Uploading..." : "Upload Resume"}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </>
                ) : (
                  <p className="text-gray-500">No resume available</p>
                )}
              </div>
            )}
          </div>
          {/* About Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              About
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {profile.summary || "No summary provided"}
            </p>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills ? (
                profile.skills.split(",").map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {skill.trim()}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </span>
              Education
            </h2>
            <div>
              <p className="font-semibold text-gray-900">{profile.education || "Not specified"}</p>
              <p className="text-gray-600 mt-1">{profile.college || "Not specified"}</p>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && canEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* About */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    About / Summary
                  </label>
                  <textarea
                    value={editData.summary}
                    onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    value={editData.skills}
                    onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="e.g., JavaScript, React, Node.js (comma separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                </div>

                {/* Education */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Education / Degree
                  </label>
                  <input
                    type="text"
                    value={editData.education}
                    onChange={(e) => setEditData({ ...editData, education: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                  />
                </div>

                {/* College */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={editData.college}
                    onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Institution name"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

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

export default JobSeekerProfile;
