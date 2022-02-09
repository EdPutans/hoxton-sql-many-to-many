import { addApplicant, addInterview, addInterviewer } from './app';

const seed = async () => {

  await addInterviewer({
    name: "Steve The Middle Management Guy", email: "you_shall_not@be.employed"
  })
  await addInterviewer({
    name: "Miranda Cosgrove", email: "why_am_i@even.here"
  })

  await addApplicant({ name: "Ed", email: "ed@email.com" })
  await addApplicant({ name: "Nico", email: "nico@email.com" })
  await addApplicant({ name: "Dan Abramov", email: "dan_abramov@react.all" })

  await addInterview({
    interviewer_id: 1, applicant_id: 1, score: 10, date: '2022-01-05'
  })
  await addInterview({
    interviewer_id: 1, applicant_id: 2, score: 11, date: '2022-01-05'
  })
  await addInterview({
    interviewer_id: 1, applicant_id: 3, score: 12, date: '2022-01-05'
  })
  await addInterview({
    interviewer_id: 2, applicant_id: 2, score: 100, date: '2021-12-11'
  })
}

seed();