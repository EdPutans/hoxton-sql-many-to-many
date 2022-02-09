
// #region INIT
export const initInterviewersTable = `CREATE TABLE IF NOT EXISTS interviewers (
  name text NOT NULL,
  email text NOT NULL,
  id INTEGER PRIMARY KEY AUTOINCREMENT
);`

export const initApplicantsTable = `CREATE TABLE IF NOT EXISTS applicants (
  name text NOT NULL,
  email text NOT NULL,
  id INTEGER PRIMARY KEY AUTOINCREMENT
);
`

export const initInterviewsTable = `CREATE TABLE IF NOT EXISTS interviews (
  date text NOT NULL,
  score INTEGER NOT NULL,
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  interviewer_id INTEGER NOT NULL,
  applicant_id INTEGER NOT NULL, 

  FOREIGN KEY(interviewer_id) REFERENCES interviewers(id),
  FOREIGN KEY(applicant_id) REFERENCES applicants(id)
);
`
// #endregion

export const selectAllApplicants = `SELECT * FROM applicants;`
export const selectAllInterviews = `SELECT * FROM interviews;`
export const selectAllinterviewers = `SELECT * FROM interviewers;`
export const selectApplicantById = `SELECT * FROM applicants where id=?;`
export const selecInterviewerById = `SELECT * FROM interviewers where id=?;`
export const selectInterviewById = `SELECT * FROM interviews where id=?;`
export const selectInterviewByApplicantId = `SELECT * FROM interviews WHERE applicant_id = ?;`
export const selectInterviewByInterviewerId = `SELECT * FROM interviews WHERE interviewer_id = ?;`
export const createInterviewer = `INSERT INTO interviewers (name, email) VALUES (?, ?);`
export const createApplicant = `INSERT INTO applicants (name, email) VALUES (?, ?);`
export const createInterview = `INSERT INTO interviews (date, score, interviewer_id, applicant_id) VALUES (?, ?, ?, ?);`