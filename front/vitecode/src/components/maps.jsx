import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Polygon, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaSave, FaEraser, FaEdit, FaTrash, FaSignOutAlt } from "react-icons/fa"; // Adicione o ícone de saída
import { getItems, saveItem, updateItem, deleteItem } from "../services/api.js";
import { colors } from "./constants/theme.js";
import { useNavigate } from "react-router-dom"; // Importe useNavigate para redirecionar

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, -1],
  popupAnchor: [1, -34],
});

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, -1],
  popupAnchor: [1, -34],
});

function MapComponent() {
  const [lineCoords, setLineCoords] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemType, setItemType] = useState("polygon");
  const navigate = useNavigate(); // Hook para redirecionar

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await getItems();
        setSavedItems(items);
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      }
    };
    fetchItems();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt"); // Remove o token JWT
    navigate("/login"); // Redireciona para a tela de login
  };

  function MapEvents() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        if (itemType === "polygon") {
          setLineCoords((prevCoords) => [...prevCoords, [lat, lng]]);
        }
        setMarkers((prevMarkers) => [...prevMarkers, { lat, lng }]);
      },
    });
    return null;
  }

  const handleSaveItem = async () => {
    if (!itemName || (itemType === "polygon" && lineCoords.length < 2)) {
      alert(`Por favor, insira um nome e ${itemType === "polygon" ? "desenhe pelo menos 2 pontos" : "selecione uma coordenada"}.`);
      return;
    }

    const itemData = {
      name: itemName,
      coordinates: itemType === "polygon" ? lineCoords : markers,
      markers: markers,
      type: itemType,
    };

    if (editingItemId) {
      const updatedItem = await updateItem(
        editingItemId,
        itemData.name,
        itemData.coordinates,
        itemData.markers,
        itemData.type
      );
      if (updatedItem) {
        setSavedItems((prev) =>
          prev.map((item) => (item.id === editingItemId ? updatedItem : item))
        );
        setEditingItemId(null);
      }
    } else {
      const savedItem = await saveItem(
        itemData.name,
        itemData.coordinates,
        itemData.markers,
        itemData.type
      );
      if (savedItem) {
        setSavedItems([...savedItems, savedItem]);
      }
    }

    setItemName("");
    setLineCoords([]);
    setMarkers([]);
  };

  const handleEditItem = (item) => {
    setItemName(item.name);
    setLineCoords(item.coordinates);
    setMarkers(item.markers || []);
    setEditingItemId(item.id);
    setItemType(item.type);
  };

  const handleDeleteItem = async (id) => {
    const success = await deleteItem(id);
    if (success) {
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ position: "absolute", width: "100%", height: "100vh" }}>
        <div
          style={{
            position: "absolute",
            width: "100%",
            zIndex: "1000",
            padding: "10px",
            background: `linear-gradient(to top, transparent, ${colors.black})`,
            display: "flex",
            justifyContent: "end",
            gap: "8px",
          }}
        >
          <input
            type="text"
            placeholder={`Nome do ${itemType === "polygon" ? "Polígono" : "Checkpoint"}`}
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: `1px solid ${colors.secondary}`,
            }}
          />
          <select
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: `1px solid ${colors.secondary}`,
            }}
          >
            <option value="polygon">Polígono</option>
            <option value="checkpoint">Checkpoint</option>
          </select>
          <button
            onClick={handleSaveItem}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              backgroundColor: colors.black,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <FaSave style={{ marginRight: "8px" }} />
            {editingItemId ? "Atualizar" : "Salvar"}
          </button>
          <button
            onClick={() => {
              setLineCoords([]);
              setMarkers([]);
              setItemName("");
              setEditingItemId(null);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              backgroundColor: colors.black,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <FaEraser style={{ marginRight: "8px" }} />
            Limpar
          </button>
          {/* Botão de Sair da Conta */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              backgroundColor: colors.danger,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <FaSignOutAlt style={{ marginRight: "8px" }} />
            Sair
          </button>
        </div>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: "100vh", width: "100%", position: "relative" }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
          <MapEvents />
          {lineCoords.length > 1 && itemType === "polygon" && (
            <Polyline positions={lineCoords} color={colors.polyline} />
          )}
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={[marker.lat, marker.lng]}
              icon={itemType === "polygon" ? redIcon : blueIcon}
            />
          ))}
          {savedItems.map((item) => {
            if (item.type === "polygon" && Array.isArray(item.coordinates)) {
              return (
                <React.Fragment key={item.id}>
                  <Polygon
                    positions={item.coordinates}
                    color={
                      item.id === editingItemId
                        ? colors.polygonEdit
                        : colors.polygonSaved
                    }
                  />
                  {item.coordinates.map((coordinate, index) => (
                    <Marker
                      key={`${item.id}-${index}`}
                      position={[coordinate[0], coordinate[1]]}
                      icon={redIcon}
                    />
                  ))}
                </React.Fragment>
              );
            } else if (item.type === "checkpoint" && Array.isArray(item.coordinates)) {
              return (
                <React.Fragment key={item.id}>
                  {item.coordinates.map((coordinate, index) => (
                    <Marker
                      key={`${item.id}-${index}`}
                      position={[coordinate.lat, coordinate.lng]}
                      icon={blueIcon}
                    />
                  ))}
                </React.Fragment>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>
      <div
        style={{
          width: "300px",
          padding: "10px",
          background: colors.background,
          overflowY: "auto",
          zIndex: "1000",
          color: colors.black,
        }}
      >
        <h2>Itens Salvos</h2>
        {savedItems.map((item) => (
          <div
            key={item.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              background: colors.primary,
              borderRadius: "4px",
              color: colors.white,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <strong>{item.name}</strong> ({item.type})
            <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleEditItem(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  backgroundColor: colors.primary,
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: colors.black,
                }}
              >
                <FaEdit style={{ marginRight: "4px" }} /> Editar
              </button>
              <button
                onClick={() => handleDeleteItem(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  backgroundColor: colors.danger,
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: colors.black,
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