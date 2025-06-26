// Tipuri pentru proiectul Harta Fotografiilor din Roma

// Fotografie cu metadate
export interface IPhoto {
  id?: number;
  filename: string;
  originalName: string;
  url: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string | null;
  title: string;
  createdAt: string;
}

// Grup de fotografii pe baza locației
export interface IPhotoGroup {
  id: string; // id unic pentru grup
  photos: IPhoto[]; // fotografiile din grup
  latitude: number; // coordonata medie a grupului
  longitude: number; // coordonata medie a grupului
  thumbnailUrl: string; // url către miniatura reprezentativă
  count: number; // numărul de fotografii din grup
  mostRecentPhoto: IPhoto; // cea mai recentă fotografie (pentru miniatură)
}

// Informații despre atracții turistice
export interface IAttraction {
  name: string;
  description: string;
  coords: [number, number]; // [latitudine, longitudine]
}

// Configurația hărții
export interface IMapConfig {
  center: [number, number]; // [latitudine, longitudine]
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

// Răspuns de la API pentru upload de fotografii
export interface IUploadResponse {
  success: boolean;
  photos: IPhoto[];
  errors?: string[];
}

// Proprietăți pentru componenta Map
export interface IMapProps {
  photoGroups: IPhotoGroup[];
  attractions: Record<string, IAttraction>;
  onMarkerClick: (groupId: string) => void;
  config: IMapConfig;
}

// Proprietăți pentru componenta UploadForm
export interface IUploadFormProps {
  onUploadComplete: (photos: IPhoto[]) => void;
  onUploadError: (error: string) => void;
}

// Proprietăți pentru componenta PhotoCarousel
export interface IPhotoCarouselProps {
  photos: IPhoto[];
  onClose?: () => void;
  onChangeIndex?: (index: number) => void;
  currentIndex?: number;
}

// Proprietăți pentru componenta Modal
export interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: string;
}

// Configurare pentru custom marker
export interface ICustomMarkerProps {
  photoGroup: IPhotoGroup;
  onClick: (groupId: string) => void;
}

// Parametri pentru grupare fotografii
export interface IGroupingParams {
  tolerance: number; // toleranța în grade (de ex. 0.0001)
}

// Configurare pentru exif
export interface IExifConfig {
  allowMissingGPS: boolean; // permite fotografii fără date GPS
  defaultLocation?: [number, number]; // locație implicită pentru fotografii fără GPS
}