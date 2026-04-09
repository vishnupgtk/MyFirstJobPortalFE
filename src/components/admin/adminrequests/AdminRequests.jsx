import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import Toast from "../../shared/Toast/Toast";
import { useAuth, useAuthActions } from "../../../store/hooks";
import { 
  Shield, 
  LogOut, 
  ChevronLeft, 
  CheckCircle, 
  XCircle,
  Clock,
  Building2,
  FileText,
  User,
  Calendar,
  Search,
  Filter
} from "lucide-react";

export default function AdminRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("all");
  const [showFieldFilter, setShowFieldFilter] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedField, list]);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/company/pending");
      setList(res.data);
      setFilteredList(res.data);
    } catch (error) {
      setToast({ show: true, message: "Failed to fetch requests", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...list];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.fieldName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedField !== "all") {
      filtered = filtered.filter((item) => item.fieldName === selectedField);
    }

    setFilteredList(filtered);
  };

  const approve = async (id) => {
    try {
      await api.post("/company/approve", { requestId: id });
      setList((prev) => prev.filter((x) => x.requestId !== id));
      setToast({ show: true, message: "Request approved successfully", type: "success" });
    } catch (error) {
      setToast({ show: true, message: "Failed to approve request", type: "error" });
    }
  };

  const reject = async (id) => {
    try {
      await api.post("/company/reject", { requestId: id });
      setList((prev) => prev.filter((x) => x.requestId !== id));
      setToast({ show: true, message: "Request rejected successfully", type: "success" });
    } catch (error) {
      setToast({ show: true, message: "Failed to reject request", type: "error" });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const uniqueFields = [...new Set(list.map((item) => item.fieldName))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/admin/landing")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Employer Requests</h1>
                <p className="text-xs text-gray-500">Review pending change requests</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{list.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Filtered Results</p>
                <p className="text-3xl font-bold text-gray-900">{filteredList.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unique Companies</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Set(list.map(item => item.companyName)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by company, field, or requester..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFieldFilter(!showFieldFilter)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filter by Field</span>
                  {selectedField !== "all" && (
                    <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                      1
                    </span>
                  )}
                </button>
                
                {showFieldFilter && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={() => {
                        setSelectedField("all");
                        setShowFieldFilter(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        selectedField === "all" ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"
                      }`}
                    >
                      All Fields
                    </button>
                    {uniqueFields.map((field) => (
                      <button
                        key={field}
                        onClick={() => {
                          setSelectedField(field);
                          setShowFieldFilter(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          selectedField === field ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"
                        }`}
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedField("all");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-600">
                {list.length === 0 
                  ? "There are no pending employer change requests at the moment."
                  : "No requests match your current filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Field
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Old Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      New Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Requested By
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredList.map((r) => (
                    <tr key={r.requestId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => r.companyId && navigate(`/company/${r.companyId}/history`)}
                          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>{r.companyName}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          {r.fieldName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {r.oldValue || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium max-w-xs truncate">
                          {r.newValue || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{r.requestedBy}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => approve(r.requestId)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => reject(r.requestId)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
}
