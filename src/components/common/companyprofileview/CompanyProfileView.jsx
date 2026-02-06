const CompanyProfileView = ({ profile, onEdit, readOnly }) => {
  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2>Company Profile</h2>
      </div>

      <ProfileRow label="Industry" value={profile.industry} />
      <ProfileRow label="What We Do" value={profile.description} />
      <ProfileRow label="Address" value={profile.address} />
      <ProfileRow label="Locations" value={profile.locations} />
    </div>
  );
};

const ProfileRow = ({ label, value }) => (
  <div className="profile-row">
    <label>{label}:</label>
    <p>{value}</p>
  </div>
);

export default CompanyProfileView;
