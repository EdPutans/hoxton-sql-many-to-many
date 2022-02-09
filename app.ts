import Database from 'better-sqlite3';
import express from 'express';
import cors from 'cors';
import { Resp, Applicant, Interviewer, Interview } from './types'
import * as stmt from './statements'

//#region config
const app = express();
app.use(express.json());
app.use(cors());

const db = new Database(
  'museums.db',
  { verbose: console.log }
);
// #endregion

// #region init
db.prepare(stmt.initInterviewersTable).run()
db.prepare(stmt.initApplicantsTable).run()
db.prepare(stmt.initInterviewsTable).run()

//#endregion

//#region Queries
const selectALlApplicants = () => db.prepare(stmt.selectAllApplicants).all()
const selectAllInterviews = () => db.prepare(stmt.selectAllInterviews).all()
const selectAllinterviewers = () => db.prepare(stmt.selectAllinterviewers).all()

const selectApplicantById = (id: number) => db.prepare(stmt.selectApplicantById).get(id);
const selectInterviewerById = (id: number) => db.prepare(stmt.selecInterviewerById).get(id);
const selectInterviewById = (id: number) => db.prepare(stmt.selectInterviewById).get(id);

const selectInterviewsForApplicant = (applicantId: number) => db.prepare(stmt.selectInterviewByApplicantId).all(applicantId);
const selectInterviewsForInterviewer = (interviewerId: number) => db.prepare(stmt.selectInterviewByInterviewerId).all(interviewerId);

export const addInterviewer = ({ name, email }: Omit<Interviewer, 'id'>) => db.prepare(stmt.createInterviewer).run(name, email);
export const addApplicant = ({ name, email }: Omit<Applicant, 'id'>) => db.prepare(stmt.createApplicant).run(name, email);
export const addInterview = ({ date, score, interviewer_id, applicant_id }: Omit<Interview, 'id'>) => db.prepare(stmt.createInterview).run(date, score, interviewer_id, applicant_id)

//#endregion


//#region populators

const getPopulatedInterview = async (interview: Interview): Promise<Interview | null> => {
  if (!interview?.id) return null;

  const interviewer = await selectInterviewerById(interview.interviewer_id);
  const applicant = await selectApplicantById(interview.applicant_id);

  interview.applicant = applicant;
  interview.interviewer = interviewer;

  return interview;
}
const getPopulatedInterviewer = async (interviewer: Interviewer): Promise<Interviewer | null> => {
  if (!interviewer?.id) return null;

  const interviewsForInterviewer = await selectInterviewsForInterviewer(interviewer.id);
  if (interviewsForInterviewer) {
    interviewer.interviews = interviewsForInterviewer;

    for (let interview of interviewsForInterviewer) {
      const applicant = await selectApplicantById(interview.applicant_id);
      if (!applicant) return null;
      interview.applicant = applicant;
    }
  }

  return interviewer;
};
const getPopulatedApplicant = async (applicant: Applicant): Promise<Applicant | null> => {
  if (!applicant?.id) return null;

  const interviewsForApplicant = await selectInterviewsForApplicant(applicant.id);
  if (interviewsForApplicant) {
    applicant.interviews = interviewsForApplicant;

    for (let interview of interviewsForApplicant) {
      const interviewer = await selectInterviewerById(interview.interviewer_id);
      if (!interviewer) return null;

      interview.interviewer = interviewer;
    }
  }

  return applicant;
};
// #endregion


//#region get All


app.get('/interviewers', async (_, res: Resp<Interviewer[]>) => {
  const interviewers = await selectAllinterviewers();

  const result: Interviewer[] = [];
  for (let interviewer of interviewers) {
    if (!interviewer) continue;

    const populatedInterviewer = await getPopulatedInterviewer(interviewer);
    if (!populatedInterviewer) continue;

    result.push(populatedInterviewer);
  }

  res.send({ data: result })
})

app.get('/applicants', async (_, res: Resp<Applicant[]>) => {
  const applicants = await selectALlApplicants();

  const result: Interviewer[] = [];

  for (let applicant of applicants) {
    if (!applicant) continue;

    const populatedApplicant = await getPopulatedApplicant(applicant);
    if (!populatedApplicant) continue;

    result.push(populatedApplicant);
  }

  res.send({ data: result })
})

app.get('/interviews', async (_, res: Resp<Interview[]>) => {
  const interviews = await selectAllInterviews();

  const result: Interview[] = [];
  for (let interview of interviews) {
    const populatedInterviewer = await getPopulatedInterview(interview);
    if (!populatedInterviewer) continue;

    result.push(populatedInterviewer);
  }

  res.send({ data: result })
})
// #endregion

// #region get Single
app.get('/interviews/:id', async (req: { params: { id: string } }, res: Resp<Interview>) => {
  if (!req.params.id) res.send({ error: 'no id param, you did a dookie' })
  const id = Number(req.params.id)

  const interview = await selectInterviewById(id);
  if (!interview) return res.status(404).send({ error: 'Interview not found' })

  const populatedInterview = await getPopulatedInterview(interview);
  if (!populatedInterview) return res.status(400).send({ error: `GET populatedInterview ${id} had errors. Investigate` })

  res.send({ data: populatedInterview })
})
app.get('/interviewers/:id', async (req: { params: { id: string } }, res: Resp<Interviewer>) => {
  if (!req.params.id) res.send({ error: 'no id param, you did a dookie' })
  const id = Number(req.params.id)

  const interviewer = await selectInterviewerById(id);
  if (!interviewer) return res.status(404).send({ error: 'Interviewer not found' })

  const populatedInterviewer = await getPopulatedInterviewer(interviewer);
  if (!populatedInterviewer) return res.status(400).send({ error: `GET populatedInterviewer ${id} had errors. Investigate` })

  res.send({ data: populatedInterviewer })
})

app.get('/applicants/:id', async (req: { params: { id: string } }, res: Resp<Applicant>) => {
  if (!req.params.id) res.send({ error: 'no id param, you did a dookie' });
  const id = Number(req.params.id)

  const applicant = await selectInterviewerById(id);
  if (!applicant) return res.status(404).send({ error: 'Applicant not found' })

  const populatedApplicant = await getPopulatedApplicant(applicant);
  if (!populatedApplicant) return res.status(400).send({ error: `GET populatedApplicant ${id} had errors. Investigate` })

  res.send({ data: populatedApplicant })
})
// #endregion


//#region posting stuff

type Req<T> = { body: Omit<T, 'id'> };

app.post('/interviews', async (req: Req<Interview>, res: Resp<Interview>) => {
  const { date, score, interviewer_id, applicant_id } = req.body;

  if (!date || !score || !interviewer_id || !applicant_id) return res.status(400).send({ error: 'missing required params' });

  const { lastInsertRowid } = await addInterview({ date, score, interviewer_id, applicant_id });
  if (!lastInsertRowid) return res.status(400).send({ error: 'failed to add interview' });

  const interview = await selectInterviewById(Number(lastInsertRowid));

  res.send({ data: interview })
});

app.post('/interviewers', async (req: Req<Interviewer>, res: Resp<Interviewer>) => {
  const { email, name } = req.body;

  if (!email || !name) return res.status(400).send({ error: 'missing required params' });

  const { lastInsertRowid } = await addInterviewer({ name, email });
  if (!lastInsertRowid) return res.status(400).send({ error: 'failed to add interviewer' });

  const interviewer = await selectInterviewerById(Number(lastInsertRowid));

  res.send({ data: interviewer })
});

app.post('/applicants', async (req: Req<Applicant>, res: Resp<Applicant>) => {
  const { email, name } = req.body;

  if (!email || !name) return res.status(400).send({ error: 'missing required params' });

  const { lastInsertRowid } = await addApplicant({ name, email });
  if (!lastInsertRowid) return res.status(400).send({ error: 'failed to add applicant' });

  const applicant = await selectApplicantById(Number(lastInsertRowid));

  res.send({ data: applicant })
});

// #endgerion

app.listen(4000, () => {
  console.info('listening on port 4000');
})

