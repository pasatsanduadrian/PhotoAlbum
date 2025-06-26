import React, { useEffect, useRef } from 'react';
import { IModalProps } from '../types';
import './Modal.css';

const Modal: React.FC<IModalProps> = ({ 
  isOpen,
  onClose,
  title,
  children,
  description
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Efect pentru gestionarea ESC key pentru închiderea modalului
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.addEventListener('mousedown', handleClickOutside);
      // Prevenim scroll-ul pe body când modalul este deschis
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
      // Restaurăm scroll-ul pe body când modalul este închis
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Închide"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
        
        {description && (
          <div className="modal-description">
            <p>{description}</p>
          </div>
        )}
        
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;