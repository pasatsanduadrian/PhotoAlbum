import express from 'express';
import cors from 'cors';
import path from 'path';
import {
  uploadMiddleware,
  uploadPhotos,
  getAllPhotos,
  closeExifTool,
} from './routes/upload';

// Crearea aplicației Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware-uri
app.use(cors()); // Permite CORS pentru comunicare frontend-backend
app.use(express.json()); // Parsing pentru request-uri JSON

// Servim fișierele statice din directorul uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutele API
app.post('/api/upload', uploadMiddleware, uploadPhotos);
app.get('/api/photos', getAllPhotos);

// Ruta pentru verificarea sănătății serverului
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server running' });
});

// Handler pentru rute inexistente
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'Ruta solicitată nu există.'
  });
});

// Middleware pentru gestionarea erorilor
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'A apărut o eroare neașteptată.'
  });
});

// Pornirea serverului
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Închidem ExifTool la ieșirea din proces
const shutdown = async () => {
  try {
    await closeExifTool();
  } catch (err) {
    console.error('Error closing ExifTool:', err);
  }
};

process.on('SIGINT', async () => {
  await shutdown();
  process.exit();
});

process.on('exit', () => {
  closeExifTool().catch(err => console.error('Error closing ExifTool:', err));
});
