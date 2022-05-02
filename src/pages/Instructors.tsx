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
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  TeacherDisciplines,
  Test,
  TestByTeacher,
} from "../services/api";

function Instructors() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [teachersDisciplines, setTeachersDisciplines] = useState<
    TestByTeacher[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructorFilter, setInstructorFilter] = useState<string>("");

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByTeacher(token);
      setTeachersDisciplines(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
    }
    loadPage();
  }, [token]);

  return (
    <>
      <TextField
        sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }}
        label="Pesquise por pessoa instrutora"
        onChange={(event) => setInstructorFilter(event.target.value)}
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
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TeachersDisciplinesAccordions
          token={token}
          categories={categories}
          teachersDisciplines={teachersDisciplines}
          instructorFilter={instructorFilter}
        />
      </Box>
    </>
  );
}

interface TeachersDisciplinesAccordionsProps {
  teachersDisciplines: TestByTeacher[];
  categories: Category[];
  instructorFilter: string;
  token: string | null;
}

function TeachersDisciplinesAccordions({
  categories,
  teachersDisciplines,
  instructorFilter,
  token,
}: TeachersDisciplinesAccordionsProps) {
  const teachers = getUniqueTeachers(teachersDisciplines);

  if (instructorFilter === "") {
    return (
      <Box sx={{ marginTop: "50px" }}>
        {teachers.map((teacher) => (
          <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold">{teacher}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {categories
                .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
                .map((category) => (
                  <Categories
                    token={token}
                    key={category.id}
                    category={category}
                    teacher={teacher}
                    teachersDisciplines={teachersDisciplines}
                  />
                ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  } else {
    return (
      <Box sx={{ marginTop: "50px" }}>
        {teachers
          .filter((teacher) => teacher.includes(instructorFilter))
          .map((teacher) => (
            <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{teacher}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {categories
                  .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
                  .map((category) => (
                    <Categories
                      token={token}
                      key={category.id}
                      category={category}
                      teacher={teacher}
                      teachersDisciplines={teachersDisciplines}
                    />
                  ))}
              </AccordionDetails>
            </Accordion>
          ))}
      </Box>
    );
  }
}

function getUniqueTeachers(teachersDisciplines: TestByTeacher[]) {
  return [
    ...new Set(
      teachersDisciplines.map(
        (teacherDiscipline) => teacherDiscipline.teacher.name
      )
    ),
  ];
}

function doesCategoryHaveTests(
  teacher: string,
  teachersDisciplines: TeacherDisciplines[]
) {
  return (category: Category) =>
    teachersDisciplines.filter(
      (teacherDiscipline) =>
        teacherDiscipline.teacher.name === teacher &&
        testOfThisCategory(teacherDiscipline, category)
    ).length > 0;
}

function testOfThisCategory(
  teacherDiscipline: TeacherDisciplines,
  category: Category
) {
  return teacherDiscipline.tests.some(
    (test) => test.category.id === category.id
  );
}

interface CategoriesProps {
  teachersDisciplines: TeacherDisciplines[];
  category: Category;
  teacher: string;
  token: string | null;
}

function Categories({
  category,
  teachersDisciplines,
  teacher,
  token,
}: CategoriesProps) {
  return (
    <>
      <Box sx={{ marginBottom: "8px" }}>
        <Typography fontWeight="bold">{category.name}</Typography>
        {teachersDisciplines
          .filter(
            (teacherDiscipline) => teacherDiscipline.teacher.name === teacher
          )
          .map((teacherDiscipline) => (
            <Tests
              token={token}
              key={teacherDiscipline.id}
              tests={teacherDiscipline.tests.filter(
                (test) => test.category.id === category.id
              )}
              disciplineName={teacherDiscipline.discipline.name}
            />
          ))}
      </Box>
    </>
  );
}

interface TestsProps {
  disciplineName: string;
  tests: Test[];
  token: string | null;
}

function Tests({ tests, disciplineName, token }: TestsProps) {
  function handleTestClick(token: string | null, testId: number) {
    if (!token) return;

    api.updateViews(token, testId);
  }

  return (
    <>
      {tests.map((test) => (
        <Typography key={test.id} color="#878787">
          <Link
            href={test.pdfUrl}
            target="_blank"
            underline="none"
            color="inherit"
            onClick={() => handleTestClick(token, test.id)}
          >{`${test.name} (${disciplineName}) (views:${test.views})`}</Link>
        </Typography>
      ))}
    </>
  );
}

export default Instructors;
