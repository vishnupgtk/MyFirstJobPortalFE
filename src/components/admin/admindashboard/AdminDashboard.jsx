import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import Toast from "../../shared/Toast/Toast";
import { ROLES } from "../../../constants/roles.jsx";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]); // Store original data for reset
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
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // No need for manual token validation - ProtectedRoute handles this
    fetchUsersPaginated(1);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // USERS - Paginated
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
      setOriginalUsers(res.data.users); // Store original data
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
    } finally {
      setLoading(false);
    }
  };

  // USER CRUD
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
      fetchUsersPaginated(pagination.pageNumber, pagination.pageSize); // Refresh current page
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

      // If this was the last user on the current page and we're not on page 1, go to previous page
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

  // SORTING FUNCTIONALITY
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...users].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // Handle case-insensitive sorting for strings
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

  // ROLE FILTERING
  const handleRoleFilterChange = (role) => {
    let newRoleFilter;
    if (roleFilter.includes(role)) {
      newRoleFilter = roleFilter.filter((r) => r !== role);
    } else {
      newRoleFilter = [...roleFilter, role];
    }
    setRoleFilter(newRoleFilter);
    applyFilters(newRoleFilter);
  };

  const applyFilters = (roles) => {
    let filteredUsers = [...originalUsers];

    if (roles.length > 0) {
      filteredUsers = filteredUsers.filter((user) =>
        roles.includes(user.roleName),
      );
    }

    setUsers(filteredUsers);

    // Reset sorting when applying filters
    setSortConfig({ key: null, direction: null });
  };

  // RESET FUNCTIONALITY
  const handleReset = () => {
    setUsers([...originalUsers]);
    setSortConfig({ key: null, direction: null });
    setRoleFilter([]);
    setShowRoleDropdown(false);
  };

  // TOGGLE ROLE DROPDOWN
  const toggleRoleDropdown = () => {
    setShowRoleDropdown(!showRoleDropdown);
  };

  // GET SORT ICON
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return "↕️"; // Default sort icon
    }
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="admin-page">
      {/* HEADER */}
      <CommonHeader
        showEmployerAudit={true}
        showJobSeekerAudit={true}
        showProfileButton={false}
      />

      {/* USERS */}
      <div className="admin-card">
        <div className="users-header">
          <h2>Users</h2>
          <div className="users-header-actions">
            <button
              className="pending-requests-btn"
              onClick={() => navigate("/admin/requests")}
              title="Employer Request"
              aria-label="Employer Request"
            >
              Employer Request
            </button>
            {/* <button className="btn-reset" onClick={handleReset}>
              Reset
            </button> */}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("firstName")}
                  >
                    First Name {getSortIcon("firstName")}
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("lastName")}
                  >
                    Last Name {getSortIcon("lastName")}
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("email")}
                  >
                    Email {getSortIcon("email")}
                  </th>
                  <th className="role-header" ref={dropdownRef}>
                    <div className="role-header-content">
                      <span>Role</span>
                      <button
                        className="role-filter-btn"
                        onClick={toggleRoleDropdown}
                      >
                        🔽
                      </button>
                      {showRoleDropdown && (
                        <div className="role-dropdown">
                          <div className="role-dropdown-content">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={roleFilter.includes(ROLES.EMPLOYER)}
                                onChange={() =>
                                  handleRoleFilterChange(ROLES.EMPLOYER)
                                }
                              />
                              Employer
                            </label>
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={roleFilter.includes(ROLES.JOB_SEEKER)}
                                onChange={() =>
                                  handleRoleFilterChange(ROLES.JOB_SEEKER)
                                }
                              />
                              JobSeeker
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId}>
                    <td>{u.firstName}</td>
                    <td>{u.lastName}</td>
                    <td>{u.email}</td>
                    <td>{u.roleName}</td>
                    <td>
                      <div className="action-icons">
                        <span
                          className="view-link"
                          onClick={() => handleRoleClick(u)}
                          title="View user"
                          aria-label="View user"
                        >
                          👁️
                        </span>
                        <span
                          className="action-link edit"
                          onClick={() => handleEdit(u)}
                          title="Edit user"
                        >
                          ✏️
                        </span>
                        <span
                          className="action-link delete"
                          onClick={() => handleDeleteClick(u.userId)}
                          title="Delete user"
                        >
                          🗑️
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}

            {/* Bottom Right Pagination Section */}
            <div className="pagination-wrapper">
              <div className="pagination-right">
                <div className="pagination-info-bottom">
                  <span>
                    Showing{" "}
                    {pagination.totalCount > 0
                      ? (pagination.pageNumber - 1) * pagination.pageSize + 1
                      : 0}{" "}
                    to{" "}
                    {Math.min(
                      pagination.pageNumber * pagination.pageSize,
                      pagination.totalCount,
                    )}{" "}
                    of {pagination.totalCount} users
                  </span>
                  <select
                    className="page-size-select"
                    value={pagination.pageSize}
                    onChange={(e) =>
                      handlePageSizeChange(Number(e.target.value))
                    }
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                {pagination.totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.pageNumber - 1)
                      }
                      disabled={!pagination.hasPreviousPage}
                      className="pagination-btn"
                    >
                      Previous
                    </button>

                    <div className="page-numbers">
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
                              className={`page-number ${pagination.pageNumber === pageNum ? "active" : ""}`}
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
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {editModal.show && (
        <div className="modal-overlay">
          <div className="edit-modal-content">
            <div className="edit-modal-header">
              <h3>Edit User</h3>
              <button className="close-btn" onClick={handleModalClose}>
                ×
              </button>
            </div>
            <div className="edit-modal-body">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={editData.firstName}
                  onChange={(e) =>
                    setEditData({ ...editData, firstName: e.target.value })
                  }
                  placeholder="Enter first name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={editData.lastName}
                  onChange={(e) =>
                    setEditData({ ...editData, lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="edit-modal-actions">
              <button className="btn-cancel" onClick={handleModalClose}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleUpdate}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDeleteConfirm}>
                Delete
              </button>
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

