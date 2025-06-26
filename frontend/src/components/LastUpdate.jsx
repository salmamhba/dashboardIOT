// src/components/LastUpdate.jsx
import React from 'react';

const LastUpdate = ({ timestamp }) => {
  return (
    <div>
      <h3>📅 Dernière mise à jour : <code>{timestamp}</code></h3>
      <p>📍 <strong>Localisation :</strong> Settat, Maroc</p>
    </div>
  );
};

export default LastUpdate;