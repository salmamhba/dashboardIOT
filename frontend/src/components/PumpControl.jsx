// src/components/PumpControl.jsx
import React from 'react';

const PumpControl = ({ pumpStatus, onActivate }) => {
  return (
    <div>
      <h4>🚰 Contrôle de la pompe</h4>
      {pumpStatus ? (
        <div style={{ backgroundColor: '#d4edda', padding: '1rem', borderRadius: '8px' }}>
          ✅ Pompe actuellement <strong>active</strong>.
        </div>
      ) : (
        <div style={{ backgroundColor: '#cce5ff', padding: '1rem', borderRadius: '8px' }}>
          💤 Pompe actuellement <strong>désactivée</strong>.
        </div>
      )}

      <button onClick={onActivate} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        💧 Activer la pompe maintenant
      </button>
    </div>
  );
};

export default PumpControl;
