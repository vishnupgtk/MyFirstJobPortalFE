import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../store/hooks";
import CommonHeader from "../../layout/CommonHeader/CommonHeader";
import { ROLES } from "../../../constants/roles.jsx";

const JobSeekerList = () => {
  const [jobSeekers, setJobSeekers] = useState([]);
  const navigate = useNavigate();

  const { token, role, user } = useAuth();

  useEffect(() => {
    loadJobSeekers();
  }, []);

  const loadJobSeekers = async () => {
    try {
      const res = await api.get("/users/jobseekers");
      setJobSeekers(res.data);
    } catch (error) {
      console.error("Failed to load job seekers", error);
    }
  };

  return (
    <div className="table-page">
      {/* HEADER FOR EMPLOYER */}
      {role === ROLES.EMPLOYER && (
        <CommonHeader
          userName={user?.fullName}
          showProfileButton={true}
          isReadOnly={false}
          onMyProfileClick={() => navigate("/employer/dashboard")}
        />
      )}

      <h2>Job Seekers</h2>

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
          {jobSeekers.map((js) => (
            <tr key={js.userId}>
              <td>{js.firstName}</td>
              <td>{js.lastName}</td>
              <td>{js.email}</td>
              <td>{js.roleName}</td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/jobseekers/${js.userId}`)}
                  title="View job seeker"
                  aria-label="View job seeker"
                >
                  👁️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobSeekerList;
