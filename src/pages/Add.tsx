import {
  Autocomplete,
  Box,
  Button,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

function Add() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [selectDiscipline, setSelectDiscipline] = React.useState<any>([]);
  const [selectCategory, setSelectCategory] = React.useState<any>([]);
  const [selectInstructors, setSelectInstructors] = React.useState<any>([]);

  interface Test {
    name: string;
    pdfUrl: string;
    category: string;
    discipline: string;
    teacher: string;
  }

  const [formData, setFormData] = React.useState<Test>({
    name: "",
    pdfUrl: "",
    category: "",
    discipline: "",
    teacher: "",
  });

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: disciplinesData } = await api.getDisciplines(token);
      setSelectDiscipline(
        disciplinesData.disciplines.map((discipline: any) => discipline.name)
      );

      const { data: categoriesData } = await api.getCategories(token);
      setSelectCategory(
        categoriesData.categories.map((category: any) => category.name)
      );
    }
    loadPage();
  }, [token]);

  useEffect(() => {
    async function loadInstructors() {
      if (!token) return;

      if (!formData.discipline) return;

      const { data: instructorsData } = await api.getTeacherByDiscipline(
        token,
        formData.discipline
      );

      const instructorsFiltered = instructorsData.teachers.filter(
        (object: any) => object.discipline.name === formData.discipline
      );

      setSelectInstructors(
        instructorsFiltered.map((object: any) => object.teacher.name)
      );
    }
    loadInstructors();
  }, [token, formData.discipline]);

  const handleChangeTitle = (e: React.ChangeEvent<any>): void => {
    setFormData({ ...formData, name: e.target.value as string });
  };

  const handleChangeUrl = (e: React.ChangeEvent<any>): void => {
    setFormData({ ...formData, pdfUrl: e.target.value as string });
  };

  async function handleSubmit(e: React.FormEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!token) return;
    await api.insertNewTest(token, formData);
    setFormData({
      name: "",
      pdfUrl: "",
      category: "",
      discipline: "",
      teacher: "",
    });
  }
  return (
    <>
      <Typography
        sx={{
          marginX: "auto",
          marginBottom: "45px",
          width: "450px",
          textAlign: "center",
          fontWeight: "500",
          fontSize: "24px",
        }}
      >
        Adicione uma prova
      </Typography>
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
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/app/adicionar")}
          >
            Adicionar
          </Button>
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            marginTop: "50px",
            marginBottom: "50px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <TextField
            label="Título da prova"
            variant="outlined"
            onChange={handleChangeTitle}
          />
          <TextField
            label="PDF da prova"
            variant="outlined"
            onChange={handleChangeUrl}
          />
          <Autocomplete
            options={selectCategory}
            renderInput={(params) => (
              <TextField {...params} label="Categoria" />
            )}
            onChange={(event: any, value: string | null) => {
              setFormData({ ...formData, category: value as string });
            }}
          />
          <Autocomplete
            options={selectDiscipline}
            renderInput={(params) => (
              <TextField {...params} label="Disciplina" />
            )}
            onChange={(event: any, value: string | null) => {
              setFormData({ ...formData, discipline: value as string });
            }}
          />
          <Autocomplete
            key={formData.discipline}
            disabled={formData.discipline === "" || !formData.discipline}
            options={selectInstructors}
            renderInput={(params) => (
              <TextField {...params} label="Pessoa Instrutora" />
            )}
            onChange={(event: any, value: string | null) => {
              setFormData({ ...formData, teacher: value as string });
            }}
          />
          <Button type="submit" variant="contained">
            enviar
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default Add;
