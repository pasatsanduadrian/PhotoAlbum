import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Timeline from './components/Timeline';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/timeline" element={<Timeline />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
