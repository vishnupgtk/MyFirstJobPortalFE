import { useState } from "react";

const JobSeekerProfileEdit = ({ profile, onCancel, onSave }) => {
  const [form, setForm] = useState({
    summary: profile.summary || "",
    education: profile.education || "",
    college: profile.college || "",
    skills: profile.skills || ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="js-modal-overlay" onClick={onCancel}>
      <div className="js-modal" onClick={(e) => e.stopPropagation()}>
        <div className="js-modal-header">
          <h3>Edit Profile</h3>
          <button className="js-modal-close" onClick={onCancel} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="js-modal-body">
          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            placeholder="Profile summary"
          />

          <input
            name="education"
            value={form.education}
            onChange={handleChange}
            placeholder="Education"
          />

          <input
            name="college"
            value={form.college}
            onChange={handleChange}
            placeholder="College"
          />

          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="Skills (comma separated)"
          />
        </div>

        <div className="js-modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-save" onClick={() => onSave(form)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerProfileEdit;
