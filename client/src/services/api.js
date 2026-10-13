import axios from "axios";
import { setUserData } from "../redux/userSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

export const getCurrentUser = async (dispatch) => {
  try {
    const result = await api.get("/api/user/currentuser");
    dispatch(setUserData(result.data));
  } catch (error) {
    console.error("Get current user failed:", error);
  }
};

export const generateNotes = async (payload) => {
  try {
    const result = await api.post("/api/notes/generate-notes", payload);
    return result.data;
  } catch (error) {
    console.error("Generate notes failed:", error);
    throw error;
  }
};

export const downloadPdf = async (result) => {
  try {
    const response = await api.post(
      "/api/pdf/generate-pdf",
      { result },
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ExamNotesAI.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF download failed:", error);
    throw new Error("PDF download failed");
  }
};