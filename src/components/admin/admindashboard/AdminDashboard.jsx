import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import Toast from "../../shared/Toast/Toast";
import { ROLES } from "../../../constants/roles.jsx";
import {
  Users,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  LogOut,
  ArrowUpDown,
} from "lucide-react";
import { useAuth, useAuthActions } from "../../../store/hooks";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [editModal, setEditModal] = useState({ show: false, user: null });
  const [editData, setEditData] = useState({ firstName: "", lastName: "" });
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    userId: null,
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [roleFilter, setRoleFilter] = useState([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsersPaginated(1);
  }, []);

  const fetchUsersPaginated = async (
    pageNumber = 1,
    pageSize = pagination.pageSize,
  ) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/users/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      );
      setUsers(res.data.users);
      setOriginalUsers(res.data.users);
      setPagination({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalCount: res.data.totalCount,
        totalPages: res.data.totalPages,
        hasNextPage: res.data.hasNextPage,
        hasPreviousPage: res.data.hasPreviousPage,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      setToast({
        show: true,
        message: "Failed to fetch users",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditModal({ show: true, user });
    setEditData({ firstName: user.firstName, lastName: user.lastName });
  };

  const handleModalClose = () => {
    setEditModal({ show: false, user: null });
    setEditData({ firstName: "", lastName: "" });
  };

  const handleUpdate = async () => {
    if (!editModal.user) return;

    try {
      await api.put(`/admin/users/${editModal.user.userId}`, {
        userId: editModal.user.userId,
        firstName: editData.firstName,
        lastName: editData.lastName,
      });

      handleModalClose();
      fetchUsersPaginated(pagination.pageNumber, pagination.pageSize);
      setToast({
        show: true,
        message: "User updated successfully",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to update user",
        type: "error",
      });
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, userId: id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/users/${deleteConfirm.userId}`);

      if (users.length === 1 && pagination.pageNumber > 1) {
        fetchUsersPaginated(pagination.pageNumber - 1, pagination.pageSize);
      } else {
        fetchUsersPaginated(pagination.pageNumber, pagination.pageSize);
      }

      setToast({
        show: true,
        message: "User deleted successfully",
        type: "success",
      });
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to delete user",
        type: "error",
      });
    } finally {
      setDeleteConfirm({ show: false, userId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, userId: null });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsersPaginated(newPage, pagination.pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newPageSize }));
    fetchUsersPaginated(1, newPageSize);
  };

  const handleRoleClick = (user) => {
    if (user.roleName === ROLES.EMPLOYER) navigate(`/employers/${user.userId}`);
    else if (user.roleName === ROLES.JOB_SEEKER)
      navigate(`/jobseekers/${user.userId}`);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...users].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setUsers(sortedUsers);
  };

  const handleRoleFilterChange = (role) => {
    let newRoleFilter;
    if (roleFilter.includes(role)) {
      newRoleFilter = roleFilter.filter((r) => r !== role);
    } else {
      newRoleFilter = [...roleFilter, role];
    }
    setRoleFilter(newRoleFilter);
    applyFilters(newRoleFilter, searchTerm);
  };

  const applyFilters = (roles, search) => {
    let filteredUsers = [...originalUsers];

    if (roles.length > 0) {
      filteredUsers = filteredUsers.filter((user) =>
        roles.includes(user.roleName),
      );
    }

    if (search) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()),
      );
    }

    setUsers(filteredUsers);
    setSortConfig({ key: null, direction: null });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(roleFilter, value);
  };

  const handleReset = () => {
    setUsers([...originalUsers]);
    setSortConfig({ key: null, direction: null });
    setRoleFilter([]);
    setSearchTerm("");
    setShowRoleDropdown(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case ROLES.EMPLOYER:
        return "bg-purple-100 text-purple-700 border-purple-200";
      case ROLES.JOB_SEEKER:
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-xs text-gray-500">
                  Manage all platform users
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.fullName || "Admin"}
                  </p>
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
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filter by Role</span>
                  {roleFilter.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                      {roleFilter.length}
                    </span>
                  )}
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <label className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roleFilter.includes(ROLES.EMPLOYER)}
                        onChange={() => handleRoleFilterChange(ROLES.EMPLOYER)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Employer
                      </span>
                    </label>
                    <label className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roleFilter.includes(ROLES.JOB_SEEKER)}
                        onChange={() =>
                          handleRoleFilterChange(ROLES.JOB_SEEKER)
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Job Seeker
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort("firstName")}
                          className="flex items-center space-x-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                        >
                          <span>First Name</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort("lastName")}
                          className="flex items-center space-x-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                        >
                          <span>Last Name</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort("email")}
                          className="flex items-center space-x-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                        >
                          <span>Email</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr
                        key={u.userId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {u.firstName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {u.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(u.roleName)}`}
                          >
                            {u.roleName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleRoleClick(u)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View user"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(u)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(u.userId)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {pagination.totalCount > 0
                          ? (pagination.pageNumber - 1) * pagination.pageSize +
                            1
                          : 0}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.pageNumber * pagination.pageSize,
                          pagination.totalCount,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {pagination.totalCount}
                      </span>{" "}
                      users
                    </span>
                    <select
                      value={pagination.pageSize}
                      onChange={(e) =>
                        handlePageSizeChange(Number(e.target.value))
                      }
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>

                  {pagination.totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.pageNumber - 1)
                        }
                        disabled={!pagination.hasPreviousPage}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.pageNumber <= 3) {
                              pageNum = i + 1;
                            } else if (
                              pagination.pageNumber >=
                              pagination.totalPages - 2
                            ) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = pagination.pageNumber - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  pagination.pageNumber === pageNum
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <button
                        onClick={() =>
                          handlePageChange(pagination.pageNumber + 1)
                        }
                        disabled={!pagination.hasNextPage}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button
                onClick={handleModalClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) =>
                    setEditData({ ...editData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) =>
                    setEditData({ ...editData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Confirm Delete
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default AdminDashboard;
