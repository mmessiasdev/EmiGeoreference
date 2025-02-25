import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaSave, FaEraser } from "react-icons/fa"; // Importando os ícones

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
        {/* Botão para salvar as coordenadas da linha */}
        <button
          onClick={() => console.log("Coordenadas da linha:", lineCoords)}
          style={{
            marginRight: "10px",
            display: "flex",
            alignItems: "start",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <FaSave style={{ marginRight: "8px" }} /> {/* Ícone de salvar */}
          Salvar Linha
        </button>

        {/* Botão para limpar a linha e os marcadores */}
        <button
          onClick={() => {
            setLineCoords([]);
            setMarkers([]);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <FaEraser style={{ marginRight: "8px" }} /> {/* Ícone de limpar */}
          Limpar Linha
        </button>
      </div>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        className="leaflet-container"
        style={{ position: "fixed", display: "flex" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents />
        {/* Renderiza a linha se houver pelo menos 2 pontos */}
        {lineCoords.length > 1 && <Polyline positions={lineCoords} color="blue" />}
        {/* Renderiza os marcadores */}
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]} icon={redIcon} />
        ))}
      </MapContainer>




    </div>
  );
}

export default MapComponent;