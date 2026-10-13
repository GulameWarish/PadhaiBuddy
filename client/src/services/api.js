import axios from "axios";
import { setUserData } from "../redux/userSlice";

// Axios instance using env var (set REACT_APP_API_URL in Netlify)
// Falls back to http://localhost:8000 for local development
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  withCredentials: true, // required if backend uses cookies/sessions
});

export const getCurrentUser = async (dispatch) => {
  try {
    const result = await api.get("/api/user/currentuser");
    dispatch(setUserData(result.data));
  } catch (error) {
    console.log(error);
  }
};

export const generateNotes = async (payload) => {
  try {
    const result = await api.post("/api/notes/generate-notes", payload);
    console.log(result.data);
    return result.data;
  } catch (error) {
    console.log(error);
  }
};

export const downloadPdf = async (result) => {
  try {
    const response = await api.post(
      "/api/pdf/generate-pdf",
      { result },
      { responseType: "blob" } // withCredentials already set on api instance
    );

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ExamNotesAI.pdf";
    link.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error("PDF download failed");
  }
};