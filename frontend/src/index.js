import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // ✅ importe ton provider

import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import './index.css';
import './App.css';
import "@fortawesome/fontawesome-free/css/all.min.css";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>               {/* ✅ entoure ton App ici */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
