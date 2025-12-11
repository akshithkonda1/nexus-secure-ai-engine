import React from 'react';
import { createRoot } from 'react-dom/client';
import TestDashboard from './pages/TestDashboard.jsx';
import './styles.css';

const root = createRoot(document.getElementById('root'));
root.render(<TestDashboard />);
