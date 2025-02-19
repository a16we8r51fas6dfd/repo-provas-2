import { AirlineSeatReclineExtraOutlined } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
} from "../services/api";

function Disciplines() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [terms, setTerms] = useState<TestByDiscipline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [disciplineFilter, setDisciplineFilter] = useState<string>("");
  const [reload, setReload] = useState<boolean>(false);

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByDiscipline(token);
      setTerms(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
    }
    loadPage();
  }, [token, reload]);

  return (
    <>
      <TextField
        sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }}
        label="Pesquise por disciplina"
        onChange={(event) => setDisciplineFilter(event.target.value)}
      />
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TermsAccordions
          token={token}
          categories={categories}
          terms={terms}
          disciplineFilter={disciplineFilter}
          reload={reload}
          setReload={setReload}
        />
      </Box>
    </>
  );
}

interface TermsAccordionsProps {
  categories: Category[];
  terms: TestByDiscipline[];
  disciplineFilter: string;
  token: string | null;
  reload: boolean;
  setReload: Dispatch<SetStateAction<boolean>>;
}

function TermsAccordions({
  categories,
  terms,
  disciplineFilter,
  token,
  reload,
  setReload,
}: TermsAccordionsProps) {
  return (
    <Box sx={{ marginTop: "50px" }}>
      {terms.map((term) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={term.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{term.number} Período</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DisciplinesAccordions
              token={token}
              categories={categories}
              disciplines={term.disciplines}
              disciplineFilter={disciplineFilter}
              reload={reload}
              setReload={setReload}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

interface DisciplinesAccordionsProps {
  categories: Category[];
  disciplines: Discipline[];
  disciplineFilter: string;
  token: string | null;
  reload: boolean;
  setReload: Dispatch<SetStateAction<boolean>>;
}

function DisciplinesAccordions({
  categories,
  disciplines,
  disciplineFilter,
  token,
  reload,
  setReload,
}: DisciplinesAccordionsProps) {
  if (disciplines.length === 0)
    return (
      <React.Fragment>
        <Typography>Nenhuma prova para esse período...</Typography>{" "}
      </React.Fragment>
    );
  if (disciplineFilter === "") {
    return (
      <>
        {disciplines.map((discipline) => (
          <Accordion
            sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
            key={discipline.id}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold">{discipline.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Categories
                setReload={setReload}
                reload={reload}
                token={token}
                categories={categories}
                teachersDisciplines={discipline.teacherDisciplines}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </>
    );
  } else {
    return (
      <>
        {disciplines
          .filter((discipline) => discipline.name.includes(disciplineFilter))
          .map((discipline) => (
            <Accordion
              sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
              key={discipline.id}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{discipline.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Categories
                  setReload={setReload}
                  reload={reload}
                  token={token}
                  categories={categories}
                  teachersDisciplines={discipline.teacherDisciplines}
                />
              </AccordionDetails>
            </Accordion>
          ))}
      </>
    );
  }
}

interface CategoriesProps {
  categories: Category[];
  teachersDisciplines: TeacherDisciplines[];
  token: string | null;
  reload: boolean;
  setReload: Dispatch<SetStateAction<boolean>>;
}

function Categories({
  categories,
  teachersDisciplines,
  token,
  reload,
  setReload,
}: CategoriesProps) {
  if (teachersDisciplines.length === 0)
    return <Typography>Nenhuma prova para essa disciplina...</Typography>;

  return (
    <>
      {categories
        .filter(doesCategoryHaveTests(teachersDisciplines))
        .map((category) => (
          <Box key={category.id}>
            <Typography fontWeight="bold">{category.name}</Typography>
            <TeachersDisciplines
              setReload={setReload}
              reload={reload}
              token={token}
              categoryId={category.id}
              teachersDisciplines={teachersDisciplines}
            />
          </Box>
        ))}
    </>
  );
}

interface TeacherDisciplineProps {
  teachersDisciplines: TeacherDisciplines[];
  categoryId: number;
  token: string | null;
  reload: boolean;
  setReload: Dispatch<SetStateAction<boolean>>;
}

function doesCategoryHaveTests(teachersDisciplines: TeacherDisciplines[]) {
  return (category: Category) =>
    teachersDisciplines.filter((teacherDiscipline) =>
      someTestOfCategory(teacherDiscipline.tests, category.id)
    ).length > 0;
}

function someTestOfCategory(tests: Test[], categoryId: number) {
  return tests.some((test) => test.category.id === categoryId);
}

function testOfCategory(test: Test, categoryId: number) {
  return test.category.id === categoryId;
}

function TeachersDisciplines({
  categoryId,
  teachersDisciplines,
  token,
  reload,
  setReload,
}: TeacherDisciplineProps) {
  const testsWithDisciplines = teachersDisciplines.map((teacherDiscipline) => ({
    tests: teacherDiscipline.tests,
    teacherName: teacherDiscipline.teacher.name,
  }));

  return (
    <Tests
      categoryId={categoryId}
      testsWithTeachers={testsWithDisciplines}
      token={token}
      reload={reload}
      setReload={setReload}
    />
  );
}

interface TestsProps {
  testsWithTeachers: { tests: Test[]; teacherName: string }[];
  categoryId: number;
  token: string | null;
  reload: boolean;
  setReload: Dispatch<SetStateAction<boolean>>;
}

function Tests({
  categoryId,
  testsWithTeachers: testsWithDisciplines,
  token,
  reload,
  setReload,
}: TestsProps) {
  async function handleTestClick(token: string | null, testId: number) {
    if (!token) return;

    await api.updateViews(token, testId);

    if (reload) {
      setReload(false);
    } else {
      setReload(true);
    }
  }

  return (
    <>
      {testsWithDisciplines.map((testsWithDisciplines) =>
        testsWithDisciplines.tests
          .filter((test) => testOfCategory(test, categoryId))
          .map((test) => (
            <Typography key={test.id} color="#878787">
              <Link
                href={test.pdfUrl}
                target="_blank"
                underline="none"
                color="inherit"
                onClick={() => handleTestClick(token, test.id)}
              >{`${test.name} (${testsWithDisciplines.teacherName}) (views: ${test.views})`}</Link>
            </Typography>
          ))
      )}
    </>
  );
}

export default Disciplines;
