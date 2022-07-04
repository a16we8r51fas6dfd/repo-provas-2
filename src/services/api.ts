import axios from "axios";

const baseAPI = axios.create({
  baseURL: "process.env.DATABASE_URL",
});

interface UserData {
  email: string;
  password: string;
}

function getConfig(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function signUp(signUpData: UserData) {
  await axios.post(`${baseURL}/sign-up`, signUpData);
}

async function signIn(signInData: UserData) {
  return axios.post<{ token: string }>(``${baseURL}/sign-in`, signInData);
}

export interface Term {
  id: number;
  number: number;
}

export interface Discipline {
  id: number;
  name: string;
  teacherDisciplines: TeacherDisciplines[];
  term: Term;
}

export interface TeacherDisciplines {
  id: number;
  discipline: Discipline;
  teacher: Teacher;
  tests: Test[];
}

export interface Teacher {
  id: number;
  name: string;
}

export interface FilterTeachers {
  id: number;
  discipline: Discipline[];
  teacher: Teacher;
}

export interface Category {
  id: number;
  name: string;
}

export interface Test {
  id: number;
  name: string;
  pdfUrl: string;
  category: Category;
  views: number;
}

export interface NewTest {
  name: string;
  pdfUrl: string;
  category: string;
  discipline: string;
  teacher: string;
}

export type TestByDiscipline = Term & {
  disciplines: Discipline[];
};

export type TestByTeacher = TeacherDisciplines & {
  teacher: Teacher;
  disciplines: Discipline[];
  tests: Test[];
};

async function getTestsByDiscipline(token: string) {
  const config = getConfig(token);
  return axios.get<{ tests: TestByDiscipline[] }>(
    `${baseURL}/tests?groupBy=disciplines`,
    config
  );
}

async function getTestsByTeacher(token: string) {
  const config = getConfig(token);
  return axios.get<{ tests: TestByTeacher[] }>(
    `${baseURL}/tests?groupBy=teachers`,
    config
  );
}

async function getCategories(token: string) {
  const config = getConfig(token);
  return axios.get<{ categories: Category[] }>(`${baseURL}/categories`, config);
}

async function getDisciplines(token: string) {
  const config = getConfig(token);
  return axios.get<{ disciplines: Discipline[] }>(`${baseURL}/disciplines`, config);
}

async function getTeacherByDiscipline(token: string, discipline: string) {
  const config = getConfig(token);
  return axios.get<{ teachers: FilterTeachers[] }>(
    `${baseURL}/teachers/${discipline}`,
    config
  );
}

async function insertNewTest(token: string, newTest: NewTest) {
  const config = getConfig(token);
  return axios.post(`${baseURL}/tests`, newTest, config);
}

async function updateViews(token: string, testId: number) {
  const identifier = {
    id: testId,
  };
  const config = getConfig(token);
  return axios.patch(`${baseURL}/tests, identifier, config);
}

const api = {
  signUp,
  signIn,
  getTestsByDiscipline,
  getTestsByTeacher,
  getCategories,
  getDisciplines,
  getTeacherByDiscipline,
  insertNewTest,
  updateViews,
};

export default api;
