export const ROLES = {
  ADMIN: "Admin",
  EMPLOYER: "Employer",
  JOB_SEEKER: "JobSeeker",
};

export const isAdmin = (role) => role === ROLES.ADMIN;
export const isEmployer = (role) => role === ROLES.EMPLOYER;
export const isJobSeeker = (role) => role === ROLES.JOB_SEEKER;
// Role arrays for route protection
export const ADMIN_ROLES = [ROLES.ADMIN];
export const EMPLOYER_ROLES = [ROLES.EMPLOYER];
export const JOB_SEEKER_ROLES = [ROLES.JOB_SEEKER];
export const ADMIN_EMPLOYER_ROLES = [ROLES.ADMIN, ROLES.EMPLOYER];
export const ALL_ROLES = [ROLES.ADMIN, ROLES.EMPLOYER, ROLES.JOB_SEEKER];
// Role display names (if different from constants)
export const ROLE_DISPLAY_NAMES = {
  [ROLES.ADMIN]: "Administrator",
  [ROLES.EMPLOYER]: "Employer",
  [ROLES.JOB_SEEKER]: "Job Seeker",
};
