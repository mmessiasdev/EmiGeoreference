import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Polygon, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaSave, FaEraser, FaEdit, FaTrash } from "react-icons/fa"; // Importando os ícones
import { getPolygons, savePolygon, updatePolygon, deletePolygon } from "../services/api"; // Importando o serviço de API

// Ícone personalizado vermelho
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41], // Tamanho do ícone
  iconAnchor: [12, 41], // Ponto de ancoragem do ícone
  popupAnchor: [1, -34], // Ponto de ancoragem do popup
});

function MapComponent() {
  const [lineCoords, setLineCoords] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [savedPolygons, setSavedPolygons] = useState([]);
  const [polygonName, setPolygonName] = useState("");
  const [editingPolygonId, setEditingPolygonId] = useState(null); // ID do polígono sendo editado

  // Busca os polígonos salvos ao carregar o componente
  useEffect(() => {
    const fetchPolygons = async () => {
      const polygons = await getPolygons();
      setSavedPolygons(polygons);
    };
    fetchPolygons();
  }, []);

  // Componente para capturar eventos de clique no mapa
  function MapEvents() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        // Adiciona a coordenada à lista de pontos da linha
        setLineCoords((prevCoords) => [...prevCoords, [lat, lng]]);
        // Adiciona um marcador no local clicado
        setMarkers((prevMarkers) => [...prevMarkers, { lat, lng }]);
      },
    });
    return null;
  }

  // Função para salvar ou atualizar o polígono
  const handleSavePolygon = async () => {
    if (!polygonName || lineCoords.length < 2) {
      alert("Por favor, insira um nome para o polígono e desenhe pelo menos 2 pontos.");
      return;
    }

    if (editingPolygonId) {
      // Atualiza o polígono existente
      const updatedPolygon = await updatePolygon(editingPolygonId, polygonName, lineCoords);
      if (updatedPolygon) {
        setSavedPolygons((prev) =>
          prev.map((polygon) =>
            polygon.id === editingPolygonId ? updatedPolygon : polygon
          )
        );
        setEditingPolygonId(null); // Sai do modo de edição
      }
    } else {
      // Salva um novo polígono
      const savedPolygon = await savePolygon(polygonName, lineCoords);
      if (savedPolygon) {
        setSavedPolygons([...savedPolygons, savedPolygon]);
      }
    }

    // Limpa o formulário
    setPolygonName("");
    setLineCoords([]);
    // Não limpa os marcadores
  };

  // Função para editar um polígono
  const handleEditPolygon = (polygon) => {
    setPolygonName(polygon.name);
    setLineCoords(polygon.coordinates);
    setMarkers(polygon.coordinates.map((coord) => ({ lat: coord[0], lng: coord[1] })));
    setEditingPolygonId(polygon.id);
  };

  // Função para deletar um polígono
  const handleDeletePolygon = async (id) => {
    const success = await deletePolygon(id);
    if (success) {
      setSavedPolygons((prev) => prev.filter((polygon) => polygon.id !== id));
    }
  };

  return (
    <div>
      <div
        style={{
          position: "absolute",
          width: "100%",
          zIndex: "1",
          padding: "10px",
          background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))", // Degradê preto com transparência
          display: "flex", // Alinha os botões horizontalmente
          justifyContent: "center", // Centraliza os botões
        }}
      >
        {/* Input para o nome do polígono */}
        <input
          type="text"
          placeholder="Nome do Polígono"
          value={polygonName}
          onChange={(e) => setPolygonName(e.target.value)}
          style={{
            marginRight: "10px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        {/* Botão para salvar ou atualizar o polígono */}
        <button
          onClick={handleSavePolygon}
          style={{
            marginRight: "10px",
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            backgroundColor: "#ffffff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <FaSave style={{ marginRight: "8px" }} /> {/* Ícone de salvar */}
          {editingPolygonId ? "Atualizar Polígono" : "Salvar Polígono"}
        </button>

        {/* Botão para limpar a linha e os marcadores */}
        <button
          onClick={() => {
            setLineCoords([]);
            setMarkers([]);
            setPolygonName("");
            setEditingPolygonId(null);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            backgroundColor: "#ffffff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <FaEraser style={{ marginRight: "8px" }} /> {/* Ícone de limpar */}
          Limpar
        </button>
      </div>

      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        className="leaflet-container"
        style={{ position: "fixed", display: "flex", zIndex: "-1000" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents />
        {/* Renderiza a linha se houver pelo menos 2 pontos */}
        {lineCoords.length > 1 && <Polyline positions={lineCoords} color="blue" />}
        {/* Renderiza os marcadores */}
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]} icon={redIcon} />
        ))}
        {/* Renderiza os polígonos salvos */}
        {savedPolygons.map((polygon) => {
          if (polygon.coordinates && Array.isArray(polygon.coordinates)) {
            return (
              <div key={polygon.id}>
                <Polygon
                  positions={polygon.coordinates}
                  color={polygon.id === editingPolygonId ? "orange" : "green"} // Destaque o polígono sendo editado
                />
                {/* Botões de editar e deletar */}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: "10",
                    display: "flex",
                    gap: "8px",

                  }}
                >
                  <button
                    onClick={() => handleEditPolygon(polygon)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "4px 8px",
                      backgroundColor: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",

                    }}
                  >
                    <FaEdit style={{ marginRight: "4px" }} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeletePolygon(polygon.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "4px 8px",
                      backgroundColor: "#ff4d4d",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#ffffff",
                      
                    }}
                  >
                    <FaTrash style={{ marginRight: "4px" }} /> Deletar
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}

export default MapComponent;