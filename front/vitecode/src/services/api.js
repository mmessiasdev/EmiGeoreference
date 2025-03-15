// api.js
const API_URL = "http://localhost:1337";


// Função para buscar todos os itens (polígonos e checkpoints)
export const getItems = async () => {
  const response = await fetch(`${API_URL}/polygons`);
  if (!response.ok) {
    throw new Error("Erro ao buscar itens");
  }
  return response.json();
};

// Função para salvar um item (polígono ou checkpoint)
export const saveItem = async (name, coordinates, markers, type) => {
  const response = await fetch(`${API_URL}/polygons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, coordinates, markers, type }),
  });
  if (!response.ok) {
    throw new Error("Erro ao salvar item");
  }
  return response.json();
};

// Função para atualizar um item (polígono ou checkpoint)
export const updateItem = async (id, name, coordinates, markers, type) => {
  const response = await fetch(`${API_URL}/polygons/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, coordinates, markers, type }),
  });
  if (!response.ok) {
    throw new Error("Erro ao atualizar item");
  }
  return response.json();
};

// Função para deletar um item (polígono ou checkpoint)
export const deleteItem = async (id) => {
  const response = await fetch(`${API_URL}/polygons/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Erro ao deletar item");
  }
  return response.ok;
};