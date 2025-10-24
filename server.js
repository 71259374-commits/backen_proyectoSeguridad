import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;


const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // reemplaza \n por saltos de línea reales
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const SPREADSHEET_ID = process.env.SPREADSHEET_ID

app.get("/api/estudiante/:dni", async (req, res) => {
  const dni = req.params.dni;
  try {
    const sheets = google.sheets({ version: "v4", auth })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Estudiantes!A2:H",
    });

    const filas = response.data.values;
    const headers = ["DNI","nombre","apellido_P","apellido_M","estado","carrera","turno","ciclo"];
    const estudiantes = filas.map(fila => Object.fromEntries(headers.map((h,i)=>[h,fila[i]])));
    const estudiante = estudiantes.find(e=>e.DNI===dni)

    if(estudiante) res.json(estudiante)
    else res.status(404).json({error:"No encontrado"})
  } catch(e) {
    console.error(e)
    res.status(500).json({error:"Error al conectar con la hoja"})
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
