import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import { useAuth } from "../../../store/hooks";

const EmployerList = () => {
  const [employers, setEmployers] = useState([]);
  const navigate = useNavigate();

  const { role, user, token } = useAuth();

  useEffect(() => {
    loadEmployers();
  }, []);

  const loadEmployers = async () => {
    try {
      const res = await api.get("/users/employers");
      setEmployers(res.data);
    } catch (err) {
      console.error("Failed to load employers", err);
    }
  };

  return (
    <div className="table-page">
      <CommonHeader
        userName={user?.fullName}
        showProfileButton={true}
        showSearchButton={false}
        showApplicationsButton={false}
      />

      <h2>Employers</h2>

      <table className="data-table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employers.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No employers found
              </td>
            </tr>
          ) : (
            employers.map((e) => (
              <tr key={e.userId}>
                <td>{e.firstName}</td>
                <td>{e.lastName}</td>
                <td>{e.email}</td>
                <td>{e.roleName}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/employers/${e.userId}`)}
                    title="View employer"
                    aria-label="View employer"
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployerList;
