import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Interfață pentru o fotografie în baza de date
interface IPhotoData {
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

// Calea către baza de date SQLite
const dbPath = path.join(__dirname, '../../database.sqlite');

// Inițializarea bazei de date
let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

/**
 * Inițializează conexiunea la baza de date și creează tabelele necesare
 */
const initDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    
    // Creăm tabelul photos dacă nu există
    await db.exec(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        originalName TEXT NOT NULL,
        url TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        timestamp TEXT,
        title TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Inițializăm baza de date la importul modulului
initDatabase();

/**
 * Model pentru gestionarea fotografiilor în baza de date
 */
const PhotoModel = {
  /**
   * Inserează o fotografie în baza de date
   * @param photoData Datele fotografiei de inserat
   * @returns Fotografia inserată cu id generat
   */
  insertPhoto: async (photoData: IPhotoData): Promise<IPhotoData> => {
    if (!db) {
      await initDatabase();
    }
    
    if (!db) {
      throw new Error('Database connection not initialized');
    }
    
    try {
      const result = await db.run(
        `INSERT INTO photos (
          filename, originalName, url, latitude, longitude, timestamp, title, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          photoData.filename,
          photoData.originalName,
          photoData.url,
          photoData.latitude,
          photoData.longitude,
          photoData.timestamp,
          photoData.title,
          photoData.createdAt
        ]
      );
      
      // Returnăm obiectul complet cu id-ul generat
      return {
        ...photoData,
        id: result.lastID
      };
    } catch (error) {
      console.error('Error inserting photo:', error);
      throw error;
    }
  },
  
  /**
   * Obține toate fotografiile din baza de date
   * @returns Lista de fotografii
   */
  getAllPhotos: async (): Promise<IPhotoData[]> => {
    if (!db) {
      await initDatabase();
    }
    
    if (!db) {
      throw new Error('Database connection not initialized');
    }
    
    try {
      const photos = await db.all<IPhotoData[]>('SELECT * FROM photos ORDER BY createdAt DESC');
      return photos;
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  },
  
  /**
   * Obține o fotografie după ID
   * @param id ID-ul fotografiei
   * @returns Fotografia sau null dacă nu a fost găsită
   */
  getPhotoById: async (id: number): Promise<IPhotoData | null> => {
    if (!db) {
      await initDatabase();
    }
    
    if (!db) {
      throw new Error('Database connection not initialized');
    }
    
    try {
      const photo = await db.get<IPhotoData>('SELECT * FROM photos WHERE id = ?', id);
      return photo || null;
    } catch (error) {
      console.error(`Error fetching photo with id ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Obține fotografiile din zona specificată
   * @param minLat Latitudinea minimă
   * @param maxLat Latitudinea maximă
   * @param minLng Longitudinea minimă
   * @param maxLng Longitudinea maximă
   * @returns Lista de fotografii din zona specificată
   */
  getPhotosByArea: async (
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ): Promise<IPhotoData[]> => {
    if (!db) {
      await initDatabase();
    }
    
    if (!db) {
      throw new Error('Database connection not initialized');
    }
    
    try {
      const photos = await db.all<IPhotoData[]>(
        `SELECT * FROM photos 
         WHERE latitude >= ? AND latitude <= ? 
         AND longitude >= ? AND longitude <= ?
         ORDER BY createdAt DESC`,
        [minLat, maxLat, minLng, maxLng]
      );
      return photos;
    } catch (error) {
      console.error('Error fetching photos by area:', error);
      throw error;
    }
  }
};

export default PhotoModel;
