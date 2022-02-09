
import { Response as IResponse } from 'express';


export type Resp<T> = IResponse<{ data: T } | { error: string }>

export type Applicant = {
  id: number,
  name: string,
  email: string
  interviews?: Interview[]
}

export type Interviewer = Applicant;

export type Interview = {
  id: number,
  date: string;
  score: number;
  interviewer_id: number;
  applicant_id: number;
  applicant?: Applicant;
  interviewer?: Interviewer;
}