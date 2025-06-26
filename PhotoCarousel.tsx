import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import { IPhotoCarouselProps, IPhoto } from '../types';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './PhotoCarousel.css';

const PhotoCarousel: React.FC<IPhotoCarouselProps> = ({
  photos,
  onClose,
  onChangeIndex,
  currentIndex = 0
}) => {
  // Formatarea datei din timestamp-ul fotografiei
  const formatDate = (timestamp: string | null): string => {
    if (!timestamp) return 'Dată necunoscută';
    
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Format dată invalid';
    }
  };
  
  // Funcție pentru afișarea coordonatelor în format citibil
  const formatCoordinates = (photo: IPhoto): string => {
    if (photo.latitude === null || photo.longitude === null) {
      return 'Coordonate GPS indisponibile';
    }
    
    // Formatul DD°MM'SS"
    const formatDMS = (coordinate: number, isLatitude: boolean): string => {
      const absolute = Math.abs(coordinate);
      const degrees = Math.floor(absolute);
      const minutes = Math.floor((absolute - degrees) * 60);
      const seconds = ((absolute - degrees) * 60 - minutes) * 60;
      
      const direction = isLatitude
        ? coordinate >= 0 ? 'N' : 'S'
        : coordinate >= 0 ? 'E' : 'V';
      
      return `${degrees}° ${minutes}' ${seconds.toFixed(2)}" ${direction}`;
    };
    
    const latDMS = formatDMS(photo.latitude, true);
    const lngDMS = formatDMS(photo.longitude, false);
    
    return `${latDMS}, ${lngDMS}`;
  };
  
  return (
    <div className="photo-carousel-container">
      <Carousel
        selectedItem={currentIndex}
        onChange={onChangeIndex}
        showArrows={true}
        showStatus={true}
        showIndicators={true}
        showThumbs={true}
        infiniteLoop={true}
        dynamicHeight={false}
        emulateTouch={true}
        swipeable={true}
        className="main-carousel"
      >
        {photos.map((photo, index) => (
          <div key={`${photo.id}-${index}`} className="carousel-slide">
            <img src={photo.url} alt={photo.title || 'Fotografie Roma'} />
            <div className="photo-info">
              <h3>{photo.title || 'Fotografie Roma'}</h3>
              <div className="photo-metadata">
                <div className="metadata-item">
                  <span className="metadata-label">Data:</span>
                  <span className="metadata-value">{formatDate(photo.timestamp)}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Locație:</span>
                  <span className="metadata-value">{formatCoordinates(photo)}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Nume fișier:</span>
                  <span className="metadata-value">{photo.originalName}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
      
      {onClose && (
        <button 
          className="carousel-close-btn"
          onClick={onClose}
          aria-label="Închide"
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default PhotoCarousel;