import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { IUploadFormProps } from '../types';
import './UploadForm.css';

const UploadForm: React.FC<IUploadFormProps> = ({ 
  onUploadComplete, 
  onUploadError 
}) => {
  // State pentru tracked al statusului
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Referință către input-ul de fișiere
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handler-ul de click pentru butonul de încărcare
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handler pentru selectarea fișierelor
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      handleFiles(Array.from(selectedFiles));
    }
  };
  
  // Handler pentru drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  // Funcție pentru validarea și adăugarea fișierelor
  const handleFiles = (newFiles: File[]) => {
    // Validăm că sunt doar imagini
    const imageFiles = newFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) {
      setErrorMsg('Vă rugăm să selectați doar fișiere imagine.');
      return;
    }
    
    if (imageFiles.length !== newFiles.length) {
      setErrorMsg(`${newFiles.length - imageFiles.length} fișier(e) ignorate deoarece nu sunt imagini.`);
    } else {
      setErrorMsg(null);
    }
    
    setFiles(prevFiles => [...prevFiles, ...imageFiles]);
  };
  
  // Funcție pentru eliminarea unui fișier
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // Funcție pentru încărcarea fișierelor
  const handleUpload = async () => {
    if (files.length === 0) {
      setErrorMsg('Vă rugăm să selectați cel puțin o imagine pentru încărcare.');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setErrorMsg(null);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });
    
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      });
      
      if (response.data.success) {
        onUploadComplete(response.data.photos);
        setFiles([]);
        setProgress(0);
      } else {
        throw new Error(response.data.error || 'Eroare la încărcarea fișierelor.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Eroare la încărcarea fișierelor.');
      onUploadError(error instanceof Error ? error.message : 'Eroare la încărcarea fișierelor.');
    } finally {
      setUploading(false);
    }
  };
  
  // Funcție pentru anularea încărcării
  const cancelUpload = () => {
    setFiles([]);
    setProgress(0);
    setUploading(false);
  };
  
  return (
    <div className="upload-form-container">
      <h2>Încărcare Fotografii</h2>
      
      {/* Zona de drag & drop */}
      <div 
        className={`drop-zone ${isDragging ? 'active' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          multiple 
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        
        <div className="drop-zone-content">
          <div className="drop-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="drop-text">
            Trageți și lăsați fotografii aici sau 
            <button 
              type="button" 
              className="browse-button"
              onClick={handleBrowseClick}
            >
              Răsfoiți
            </button>
          </p>
          <p className="drop-hint">
            Doar fișiere imagine (JPG, PNG, etc.)
          </p>
        </div>
      </div>
      
      {/* Lista fișierelor selectate */}
      {files.length > 0 && (
        <div className="selected-files">
          <h3>Fișiere selectate ({files.length})</h3>
          <ul className="file-list">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="file-item">
                <div className="file-preview">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={`Preview ${file.name}`}
                    className="file-thumbnail"
                  />
                </div>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button 
                  type="button"
                  className="remove-file-btn"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Bară de progres */}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-info">
            <span>{progress}% încărcat</span>
            <button 
              type="button"
              className="cancel-button"
              onClick={cancelUpload}
            >
              Anulează
            </button>
          </div>
        </div>
      )}
      
      {/* Mesaj de eroare */}
      {errorMsg && (
        <div className="error-message">
          {errorMsg}
        </div>
      )}
      
      {/* Butoane de acțiune */}
      <div className="form-actions">
        <button 
          type="button"
          className="clear-button"
          onClick={() => setFiles([])}
          disabled={files.length === 0 || uploading}
        >
          Șterge toate
        </button>
        <button 
          type="button"
          className="upload-button"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? 'Se încarcă...' : 'Încarcă fotografii'}
        </button>
      </div>
    </div>
  );
};

export default UploadForm;