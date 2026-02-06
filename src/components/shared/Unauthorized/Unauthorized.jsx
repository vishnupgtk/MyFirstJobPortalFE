import { Link } from "react-router-dom";
import "./Unauthorized.css";

const Unauthorized = () => {
  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <h1>Access denied</h1>
        <p>You don’t have permission to view this page.</p>
        <div className="unauthorized-actions">
          <Link className="unauthorized-link" to="/">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
