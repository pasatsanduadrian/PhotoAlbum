import { ExifTool } from 'exiftool-vendored';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/photo';

// Inițializăm ExifTool pentru extragerea metadatelor
const exiftool = new ExifTool();

// Configurăm multer pentru upload-uri
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Creăm directorul de upload dacă nu există
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generăm un nume unic pentru fișier cu UUID
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Filtru pentru fișiere - doar imagini
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Acceptăm doar fișiere imagine
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Doar fișierele imagine sunt acceptate!'));
  }
};

// Configurare upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limită de 10MB per fișier
  }
});

// Middleware pentru procesarea upload-urilor multiple
export const uploadMiddleware = upload.array('photos', 20); // Maxim 20 fotografii simultan

/**
 * Extrage coordonatele GPS din metadatele EXIF
 * @param exifData Datele EXIF extrase
 * @returns {lat, lng} sau null dacă nu există date GPS
 */
const extractGPSCoordinates = (exifData: any) => {
  try {
    // Verificăm dacă avem latitudine și longitudine
    if (
      exifData.GPSLatitude !== undefined && 
      exifData.GPSLongitude !== undefined &&
      exifData.GPSLatitudeRef !== undefined &&
      exifData.GPSLongitudeRef !== undefined
    ) {
      // Extragem latitudinea și longitudinea
      let lat = exifData.GPSLatitude;
      let lng = exifData.GPSLongitude;
      
      // Ajustăm în funcție de referință (N/S, E/W)
      if (exifData.GPSLatitudeRef === 'S') lat = -lat;
      if (exifData.GPSLongitudeRef === 'W') lng = -lng;
      
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting GPS coordinates:', error);
    return null;
  }
};

/**
 * Controller pentru încărcarea fotografiilor
 */
export const uploadPhotos = async (req: Request, res: Response) => {
  try {
    // Verificăm dacă avem fișiere încărcate
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Nu au fost furnizate fișiere pentru încărcare.'
      });
    }
    
    const files = req.files as Express.Multer.File[];
    const uploadedPhotos = [];
    const errors = [];
    
    // Procesăm fiecare fișier
    for (const file of files) {
      try {
        // Calea completă către fișier
        const filePath = file.path;
        
        // Extragem metadatele EXIF
        const metadata = await exiftool.read(filePath);
        
        // Extragem coordonatele GPS
        const gpsCoords = extractGPSCoordinates(metadata);
        
        // Extragem timestamp-ul
        let timestamp = null;
        if (metadata.DateTimeOriginal) {
          timestamp = new Date(String(metadata.DateTimeOriginal)).toISOString();
        } else if (metadata.CreateDate) {
          timestamp = new Date(String(metadata.CreateDate)).toISOString();
        }
        
        // Generăm URL-ul pentru acces public la imagine
        const publicUrl = `/uploads/${file.filename}`;
        
        // Creăm titlul implicit (numele original al fișierului fără extensie)
        const title = path.basename(file.originalname, path.extname(file.originalname));
        
        // Salvăm în baza de date
        const photoData = {
          filename: file.filename,
          originalName: file.originalname,
          url: publicUrl,
          latitude: gpsCoords ? gpsCoords.lat : null,
          longitude: gpsCoords ? gpsCoords.lng : null,
          timestamp: timestamp,
          title: title,
          createdAt: new Date().toISOString()
        };
        
        const savedPhoto = await db.insertPhoto(photoData);
        uploadedPhotos.push(savedPhoto);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        errors.push(`Eroare la procesarea fișierului ${file.originalname}: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`);
      }
    }
    
    // Returnăm rezultatul
    return res.status(200).json({
      success: uploadedPhotos.length > 0,
      photos: uploadedPhotos,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error in uploadPhotos controller:', error);
    return res.status(500).json({
      success: false,
      error: 'A apărut o eroare la procesarea fișierelor: ' + (error instanceof Error ? error.message : 'Eroare necunoscută')
    });
  }
};

/**
 * Controller pentru obținerea tuturor fotografiilor
 */
export const getAllPhotos = async (req: Request, res: Response) => {
  try {
    const photos = await db.getAllPhotos();
    return res.status(200).json({
      success: true,
      photos
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return res.status(500).json({
      success: false,
      error: 'A apărut o eroare la obținerea fotografiilor: ' + (error instanceof Error ? error.message : 'Eroare necunoscută')
    });
  }
};