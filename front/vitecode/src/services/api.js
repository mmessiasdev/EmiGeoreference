import axios from "axios";

const API_URL = "http://localhost:1337";

// Busca todos os polígonos salvos
export const getPolygons = async () => {
  try {
    const response = await axios.get(`${API_URL}/polygons`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar polígonos:", error);
    return [];
  }
};

// Salva um novo polígono
export const savePolygon = async (name, coordinates) => {
  try {
    const response = await axios.post(`${API_URL}/polygons`, {
      name,
      coordinates,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar polígono:", error);
    return null;
  }
};

// Atualiza um polígono existente
export const updatePolygon = async (id, name, coordinates) => {
  try {
    const response = await axios.put(`${API_URL}/polygons/${id}`, {
      name,
      coordinates,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar polígono:", error);
    return null;
  }
};

// Deleta um polígono existente
export const deletePolygon = async (id) => {
  try {
    await axios.delete(`${API_URL}/polygons/${id}`);
    return true;
  } catch (error) {
    console.error("Erro ao deletar polígono:", error);
    return false;
  }
};