import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import UploadForm from './components/UploadForm';
import Modal from './components/Modal';
import PhotoCarousel from './components/PhotoCarousel';
import { IPhoto, IPhotoGroup, IAttraction } from './types';
import { groupPhotosByLocation, findNearestAttraction } from './utils/groupByLocation';
import uploadService from './api/upload';
import './App.css';

// Datele despre atracții turistice din Roma
const ROME_ATTRACTIONS: Record<string, IAttraction> = {
  'Colosseum': {
    name: 'Colosseum',
    description: 'Colosseum din Roma, numit în antichitate Amfiteatrul Flavian, este cel mai impresionant monument al Romei. Este vizitat de 6 milioane de oameni anual.',
    coords: [41.8902, 12.4922]
  },
  'Roman Forum': {
    name: 'Roman Forum',
    description: 'Situat între Piazza Venezia și Colosseum, Forumul Roman a fost centrul activităților politice și sociale ale cetățenilor romani.',
    coords: [41.8925, 12.4853]
  },
  'Trevi Fountain': {
    name: 'Fontana di Trevi',
    description: 'Fontana di Trevi este cea mai frumoasă și spectaculoasă fântână din Roma. Milioane de oameni o vizitează în fiecare an pentru a-și face o dorință.',
    coords: [41.9009, 12.4833]
  },
  'Pantheon': {
    name: 'Pantheon',
    description: 'Finalizat de Hadrian în anul 126 d.Hr., Pantheonul pretinde că este cea mai bine conservată clădire din Roma antică. O capodoperă a arhitecturii romane.',
    coords: [41.8986, 12.4768]
  },
  'Spanish Steps': {
    name: 'Treptele Spaniole',
    description: 'Ca locul multor evenimente și spectacole de modă, Treptele Spaniole sunt unul dintre cele mai renumite locuri din Roma.',
    coords: [41.9059, 12.4823]
  },
  'Vatican City': {
    name: 'Vatican',
    description: 'Piazza San Pietro se află în Vatican la picioarele Bazilicii. Una dintre cele mai faimoase piețe din lume.',
    coords: [41.9022, 12.4534]
  }
};

// Configurația hărții pentru Roma
const MAP_CONFIG = {
  center: [41.9028, 12.4964] as [number, number],
  zoom: 13,
  minZoom: 5,
  maxZoom: 18
};

const App: React.FC = () => {
  // State pentru aplicație
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [photoGroups, setPhotoGroups] = useState<IPhotoGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Obținem grupul de fotografii selectat
  const selectedGroupData = selectedGroup
    ? photoGroups.find(group => group.id === selectedGroup)
    : null;
  
  // Găsim atracția cea mai apropiată pentru grupul selectat
  const nearestAttraction = selectedGroupData
    ? findNearestAttraction(
        selectedGroupData.latitude,
        selectedGroupData.longitude,
        ROME_ATTRACTIONS,
        0.001
      )
    : null;
  
  // Descrierea pentru modal
  const modalDescription = nearestAttraction
    ? ROME_ATTRACTIONS[nearestAttraction].description
    : 'Fotografie din Roma';
  
  // Titlul pentru modal
  const modalTitle = nearestAttraction
    ? ROME_ATTRACTIONS[nearestAttraction].name
    : (selectedGroupData?.photos[0]?.title || 'Fotografie din Roma');
  
  // Încărcăm fotografiile la inițializarea componentei
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const fetchedPhotos = await uploadService.getAllPhotos();
        setPhotos(fetchedPhotos);
      } catch (err) {
        console.error('Error loading photos:', err);
        setError('Eroare la încărcarea fotografiilor. Vă rugăm să încercați din nou mai târziu.');
      }
    };
    
    loadPhotos();
  }, []);
  
  // Grupăm fotografiile după coordonate GPS când se schimbă
  useEffect(() => {
    const groups = groupPhotosByLocation(photos);
    setPhotoGroups(groups);
  }, [photos]);
  
  // Handler pentru click pe marker
  const handleMarkerClick = (groupId: string) => {
    setSelectedGroup(groupId);
    setModalOpen(true);
  };
  
  // Handler pentru închiderea modalului
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedGroup(null);
  };
  
  // Handler pentru completarea încărcării
  const handleUploadComplete = (newPhotos: IPhoto[]) => {
    setPhotos(prevPhotos => [...newPhotos, ...prevPhotos]);
    setIsUploading(false);
    setError(null);
  };
  
  // Handler pentru eroare la încărcare
  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg);
    setIsUploading(false);
  };
  
  return (
    <div className="app">
      <header className="header">
        <h1>Harta Fotografiilor din Roma</h1>
        <p className="subtitle">Încărcați fotografii cu date GPS și explorați-le pe hartă</p>
      </header>
      
      <main className="main-content">
        <div className="upload-section">
          <UploadForm 
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
          
          {error && (
            <div className="error-notification">
              {error}
              <button 
                className="close-error-btn"
                onClick={() => setError(null)}
              >
                &times;
              </button>
            </div>
          )}
        </div>
        
        <div className="map-section">
          <Map
            photoGroups={photoGroups}
            attractions={ROME_ATTRACTIONS}
            onMarkerClick={handleMarkerClick}
            config={MAP_CONFIG}
          />
        </div>
      </main>
      
      {/* Modal pentru afișarea fotografiilor */}
      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={modalTitle}
        description={modalDescription}
      >
        {selectedGroupData && (
          <PhotoCarousel 
            photos={selectedGroupData.photos}
            onClose={handleModalClose}
          />
        )}
      </Modal>
      
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Harta Fotografiilor din Roma. Toate drepturile rezervate.</p>
      </footer>
    </div>
  );
};

export default App;