import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import uploadService from '../api/upload';
import { IPhoto } from '../types';
import 'leaflet/dist/leaflet.css';
import './Timeline.css';

const MAP_CONFIG = {
  center: [41.9028, 12.4964] as [number, number],
  zoom: 13,
  minZoom: 5,
  maxZoom: 18
};

const Timeline: React.FC = () => {
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      const timelinePhotos = await uploadService.getTimelinePhotos();
      setPhotos(timelinePhotos);
    };
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [photos]);

  const path = photos.map((p) => [p.latitude!, p.longitude!] as [number, number]);
  const currentPhoto = photos[currentIndex];

  const markerIcon = currentPhoto
    ? new L.Icon({
        iconUrl: currentPhoto.url,
        iconSize: [48, 48],
        className: 'timeline-marker'
      })
    : undefined;

  return (
    <div className="timeline-container">
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        scrollWheelZoom={true}
        className="map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {path.length > 1 && <Polyline positions={path} color="blue" />}
        {currentPhoto && (
          <Marker position={[currentPhoto.latitude!, currentPhoto.longitude!]} icon={markerIcon!}>
            <Popup>
              <img src={currentPhoto.url} alt={currentPhoto.title} width="160" />
            </Popup>
          </Marker>
        )}
      </MapContainer>
      {currentPhoto && (
        <div className="timeline-photo-info">
          <img src={currentPhoto.url} alt={currentPhoto.title} />
          <p>{currentPhoto.title}</p>
        </div>
      )}
    </div>
  );
};

export default Timeline;
