import axios from 'axios';
import { IPhoto, IUploadResponse } from '../types';

// URL-ul de bază pentru API
const API_URL = 'http://localhost:3001/api';

/**
 * Serviciu pentru încărcare fotografii
 */
const uploadService = {
  /**
   * Încarcă una sau mai multe fotografii și extrage metadate EXIF
   * @param files Fișierele de încărcat
   * @param onProgress Callback pentru progres upload (opțional)
   * @returns Promise cu răspunsul de la server
   */
  uploadPhotos: async (
    files: File[], 
    onProgress?: (percent: number) => void
  ): Promise<IUploadResponse> => {
    try {
      const formData = new FormData();
      
      // Adăugăm fiecare fișier la FormData
      files.forEach(file => {
        formData.append('photos', file);
      });
      
      // Facem request-ul către backend
      const response = await axios.post<IUploadResponse>(
        `${API_URL}/upload`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error uploading photos:', error);
      
      // Construim un răspuns de eroare standardizat
      const errorResponse: IUploadResponse = {
        success: false,
        photos: [],
        errors: [
          error instanceof Error 
            ? error.message 
            : 'A apărut o eroare necunoscută la încărcarea fotografiilor.'
        ]
      };
      
      return errorResponse;
    }
  },
  
  /**
   * Obține toate fotografiile din baza de date
   * @returns Promise cu lista de fotografii
   */
  getAllPhotos: async (): Promise<IPhoto[]> => {
    try {
      const response = await axios.get<{ photos: IPhoto[] }>(`${API_URL}/photos`);
      return response.data.photos;
    } catch (error) {
      console.error('Error fetching photos:', error);
      return [];
    }
  }
};

export default uploadService;