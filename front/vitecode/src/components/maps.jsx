import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Polygon, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Importe o CSS do Leaflet
import { FaSave, FaEraser, FaEdit, FaTrash } from "react-icons/fa"; // Importando os ícones
import { getPolygons, savePolygon, updatePolygon, deletePolygon } from "../services/api"; // Importando o serviço de API
import { colors } from "../constants/theme"; // Importando as cores do tema

// Ícone personalizado vermelho
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41], // Tamanho do ícone
  iconAnchor: [12, -1], // Ponto de ancoragem do ícone
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
      const updatedPolygon = await updatePolygon(editingPolygonId, polygonName, lineCoords, markers);
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
      const savedPolygon = await savePolygon(polygonName, lineCoords, markers);
      if (savedPolygon) {
        setSavedPolygons([...savedPolygons, savedPolygon]);
      }
    }

    // Limpa o formulário e a linha, mas mantém os marcadores
    setPolygonName("");
    setLineCoords([]);
  };

  // Função para editar um polígono
  const handleEditPolygon = (polygon) => {
    setPolygonName(polygon.name);
    setLineCoords(polygon.coordinates);
    setMarkers(polygon.markers || []); // Carrega os marcadores salvos
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
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Mapa */}
      <div style={{ position: "absolute", width: "100%", height: "100vh" }}>
        <div
          style={{
            position: "absolute",
            width: "100%",
            zIndex: "1000",
            padding: "10px",
            background: `linear-gradient(to top, transparent, ${colors.black})`, // Usando a cor do tema
            display: "flex", // Alinha os botões horizontalmente
            justifyContent: "end",
            gap: "8px", // Espaçamento entre os botões
          }}
        >
          {/* Input para o nome do polígono */}
          <input
            type="text"
            placeholder="Nome do Polígono"
            value={polygonName}
            onChange={(e) => setPolygonName(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: `1px solid ${colors.secondary}`, // Usando a cor do tema
            }}
          />

          {/* Botão para salvar ou atualizar o polígono */}
          <button
            onClick={handleSavePolygon}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              backgroundColor: colors.black, // Usando a cor do tema
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
              backgroundColor: colors.black, // Usando a cor do tema
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
        {/* Contêiner do Mapa */}
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: "100vh", width: "100%", position: "relative" }} // Altura e largura definidas
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />          <MapEvents />
          {/* Renderiza a linha se houver pelo menos 2 pontos */}
          {lineCoords.length > 1 && (
            <Polyline positions={lineCoords} color={colors.polyline} /> // Usando a cor do tema
          )}
          {/* Renderiza os marcadores atuais */}
          {markers.map((marker, index) => (
            <Marker key={index} position={[marker.lat, marker.lng]} icon={redIcon} />
          ))}
          {/* Renderiza os polígonos salvos e seus marcadores */}
          {savedPolygons.map((polygon) => {
            if (polygon.coordinates && Array.isArray(polygon.coordinates)) {
              return (
                <React.Fragment key={polygon.id}>
                  <Polygon
                    positions={polygon.coordinates}
                    color={
                      polygon.id === editingPolygonId
                        ? colors.polygonEdit // Usando a cor do tema
                        : colors.polygonSaved // Usando a cor do tema
                    }
                  />
                  {/* Renderiza os marcadores salvos */}
                  {polygon.markers &&
                    polygon.markers.map((marker, index) => (
                      <Marker
                        key={`${polygon.id}-${index}`}
                        position={[marker.lat, marker.lng]}
                        icon={redIcon} // Usando o ícone personalizado
                      />
                    ))}
                </React.Fragment>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>

      {/* Painel lateral para listar e gerenciar polígonos */}
      <div
        style={{
          width: "300px",
          padding: "10px",
          background: colors.background, // Usando a cor do tema
          overflowY: "auto",
          zIndex: "1000",
          color: colors.black,
        }}
      >
        <h2>Polígonos Salvos</h2>
        {savedPolygons.map((polygon) => (
          <div
            key={polygon.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              background: colors.primary, // Usando a cor do tema
              borderRadius: "4px",
              color: colors.white,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <strong>{polygon.name}</strong>
            <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleEditPolygon(polygon)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  backgroundColor: colors.primary, // Usando a cor do tema
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: colors.black, // Usando a cor do tema
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
                  backgroundColor: colors.danger, // Usando a cor do tema
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: colors.black, // Usando a cor do tema
                }}
              >
                <FaTrash style={{ marginRight: "4px" }} /> Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MapComponent;