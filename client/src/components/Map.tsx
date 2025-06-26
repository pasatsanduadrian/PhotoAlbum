import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { IMapProps, IPhotoGroup, IAttraction } from '../types';
import { findNearestAttraction } from '../utils/groupByLocation';

import 'leaflet/dist/leaflet.css';
import './Map.css';

// Componentă pentru centrearea hărții pe Roma
const SetViewOnLoad: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

// Componenta pentru marcator personalizat cu imagine
const CustomMarker: React.FC<{ 
  group: IPhotoGroup, 
  onClick: (groupId: string) => void,
  attractions: Record<string, IAttraction>
}> = ({ group, onClick, attractions }) => {
  // Creăm un icon personalizat cu miniatura fotografiei
  const customIcon = new L.Icon({
    iconUrl: group.thumbnailUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    className: 'custom-marker-icon'
  });

  // Găsim atracția cea mai apropiată de această locație
  const nearestAttraction = findNearestAttraction(
    group.latitude, 
    group.longitude, 
    attractions
  );

  // Titlul pentru popup
  const title = nearestAttraction || 
    (group.mostRecentPhoto.title || 'Fotografie Roma');

  return (
    <Marker 
      position={[group.latitude, group.longitude]} 
      icon={customIcon}
      eventHandlers={{
        click: () => onClick(group.id)
      }}
    >
      <Popup>
        <div className="marker-popup">
          <h3>{title}</h3>
          <p>{group.count} fotografi{group.count === 1 ? 'e' : 'i'}</p>
          <button 
            className="view-photos-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClick(group.id);
            }}
          >
            Vezi fotografiile
          </button>
        </div>
      </Popup>
    </Marker>
  );
};

// Componenta principală Map
const Map: React.FC<IMapProps> = ({ 
  photoGroups, 
  attractions, 
  onMarkerClick,
  config
}) => {
  // Configurația pentru hartă
  const { center, zoom, minZoom, maxZoom } = config;
  
  return (
    <div className="map-container">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        minZoom={minZoom || 5}
        maxZoom={maxZoom || 18}
        scrollWheelZoom={true}
        className="map"
      >
        <SetViewOnLoad center={center} zoom={zoom} />
        
        {/* Stratul de bază OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Gruparea marcatorilor pentru performanță */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          disableClusteringAtZoom={16}
        >
          {/* Marcatorii pentru grupurile de fotografii */}
          {photoGroups.map((group) => (
            <CustomMarker
              key={group.id}
              group={group}
              onClick={onMarkerClick}
              attractions={attractions}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default Map;
