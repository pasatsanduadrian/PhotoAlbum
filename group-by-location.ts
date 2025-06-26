import { IPhoto, IPhotoGroup } from '../types';

/**
 * Grupează fotografiile după locație (proximitate GPS)
 * Fotografiile sunt considerate în același loc dacă sunt în limitele toleranței
 * @param photos Lista fotografiilor de grupat
 * @param tolerance Toleranța în grade (implicit 0.0001 grade, aprox. 11 metri)
 * @returns Lista grupurilor de fotografii
 */
export const groupPhotosByLocation = (
  photos: IPhoto[],
  tolerance: number = 0.0001
): IPhotoGroup[] => {
  // Filtrăm fotografiile care au coordonate GPS
  const photosWithCoords = photos.filter(
    (photo) => photo.latitude !== null && photo.longitude !== null
  );

  if (photosWithCoords.length === 0) {
    return [];
  }

  // Sortăm fotografiile după timestamp (mai noi primele) pentru a avea miniatura cea mai recentă
  const sortedPhotos = [...photosWithCoords].sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Inițializăm lista de grupuri
  const groups: IPhotoGroup[] = [];
  
  // Pentru fiecare fotografie, verificăm dacă există deja un grup în apropiere
  sortedPhotos.forEach((photo) => {
    if (photo.latitude === null || photo.longitude === null) return;
    
    // Verificăm dacă există un grup apropiat
    const existingGroupIndex = groups.findIndex((group) => 
      Math.abs(group.latitude - photo.latitude) <= tolerance && 
      Math.abs(group.longitude - photo.longitude) <= tolerance
    );

    if (existingGroupIndex !== -1) {
      // Adăugăm fotografia la grupul existent
      groups[existingGroupIndex].photos.push(photo);
      groups[existingGroupIndex].count += 1;
      
      // Actualizăm coordonatele medii ale grupului
      const updatedLat = groups[existingGroupIndex].photos.reduce(
        (sum, p) => sum + (p.latitude || 0), 
        0
      ) / groups[existingGroupIndex].photos.length;
      
      const updatedLng = groups[existingGroupIndex].photos.reduce(
        (sum, p) => sum + (p.longitude || 0), 
        0
      ) / groups[existingGroupIndex].photos.length;

      groups[existingGroupIndex].latitude = updatedLat;
      groups[existingGroupIndex].longitude = updatedLng;
      
      // Verificăm dacă această fotografie este mai recentă decât cea mai recentă din grup
      if (photo.timestamp && (!groups[existingGroupIndex].mostRecentPhoto.timestamp || 
          new Date(photo.timestamp) > new Date(groups[existingGroupIndex].mostRecentPhoto.timestamp))) {
        groups[existingGroupIndex].mostRecentPhoto = photo;
        groups[existingGroupIndex].thumbnailUrl = photo.url;
      }
    } else {
      // Creăm un nou grup pentru această fotografie
      groups.push({
        id: `group-${groups.length + 1}-${Date.now()}`,
        photos: [photo],
        latitude: photo.latitude,
        longitude: photo.longitude,
        thumbnailUrl: photo.url,
        count: 1,
        mostRecentPhoto: photo
      });
    }
  });

  return groups;
};

/**
 * Găsește atracția turistică cea mai apropiată de coordonatele date
 * @param lat Latitudinea
 * @param lng Longitudinea
 * @param attractions Obiectul cu atracțiile turistice și coordonatele lor
 * @param maxDistance Distanța maximă de căutare în grade (implicit 0.001 grade, aprox. 111 metri)
 * @returns Numele atracției sau null dacă nu este găsită nicio atracție în raza dată
 */
export const findNearestAttraction = (
  lat: number,
  lng: number,
  attractions: Record<string, { coords: [number, number] }>,
  maxDistance: number = 0.001
): string | null => {
  let nearestName: string | null = null;
  let minDistance = maxDistance;

  Object.entries(attractions).forEach(([name, attraction]) => {
    const [attrLat, attrLng] = attraction.coords;
    // Calculăm distanța simplă (aprox. pentru distanțe mici)
    const distance = Math.sqrt(
      Math.pow(attrLat - lat, 2) + Math.pow(attrLng - lng, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestName = name;
    }
  });

  return nearestName;
};

/**
 * Calculează distanța între două puncte pe Pământ folosind formula Haversine
 * @param lat1 Latitudinea primului punct
 * @param lng1 Longitudinea primului punct
 * @param lat2 Latitudinea celui de-al doilea punct
 * @param lng2 Longitudinea celui de-al doilea punct
 * @returns Distanța în metri
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371000; // Raza Pământului în metri
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};