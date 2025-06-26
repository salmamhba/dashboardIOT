// src/components/SensorMetrics.jsx
import React from 'react';

const SensorMetrics = ({ data }) => {
  const { temperature, humidity, soil_moisture, rain_probability, will_rain_model } = data;

  return (
    <div>
      <h4>🧪 Données instantanées</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div><strong>🌡️ Température :</strong> {temperature} °C</div>
        <div><strong>💧 Humidité de l'air :</strong> {humidity} %</div>
        <div><strong>🌱 Humidité du sol :</strong> {soil_moisture} %</div>
        <div><strong>🌧️ Pluie prévue ?</strong> {will_rain_model ? "✅ Oui" : "❌ Non"} ({Math.round(rain_probability * 100)} %)</div>
      </div>
    </div>
  );
};

export default SensorMetrics;
