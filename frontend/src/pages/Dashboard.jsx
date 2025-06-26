import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { MDBContainer } from "mdb-react-ui-kit";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/latest_data");
        setLatest(res.data);
        setHistory((prev) => [...prev.slice(-9), res.data]); // garder historique
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des données :", err.message);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // toutes les 10 sec

    return () => clearInterval(interval);
  }, []);

  if (!latest) return <div>Chargement...</div>;

  return (
    <>
      <Navbar />
      <MDBContainer className="mt-4 text-center">
        <h2 className="mb-4">
          <i className="fas fa-home text-success me-2"></i>
          <strong>Tableau de bord SmartHome AI</strong>
        </h2>

        <h4 className="my-4">
          <i className="fas fa-vial text-success me-2"></i>
          Données instantanées
        </h4>

        <div className="d-flex justify-content-around flex-wrap text-center mb-4">
          <div><i className="fas fa-thermometer-half text-danger"></i> <strong>Température :</strong> {latest.temperature} °C</div>
          <div><i className="fas fa-tint text-primary"></i> <strong>Humidité de l'air :</strong> {latest.humidity} %</div>
          <div><i className="fas fa-seedling text-success"></i> <strong>Humidité du sol :</strong> {latest.soil_moisture} %</div>
          <div><i className="fas fa-cloud-showers-heavy text-info"></i> <strong>Pluie prévue ?</strong> {latest.will_rain_model ? "✅ Oui" : "❌ Non"} ({Math.round(latest.rain_probability * 100)} %)</div>
        </div>

        <h4 className="my-4">
          <i className="fas fa-chart-bar me-2"></i>
          Évolution des mesures
        </h4>

        <div className="row">
          <div className="col-md-6 mb-4">
            <Line
              data={{
                labels: history.map((d) => d.timestamp.split(" ")[1]),
                datasets: [
                  {
                    label: "Température (°C)",
                    data: history.map((d) => d.temperature),
                    borderColor: "red",
                    borderWidth: 3,
                  },
                  {
                    label: "Humidité air (%)",
                    data: history.map((d) => d.humidity),
                    borderColor: "blue",
                    borderWidth: 3,
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { labels: { boxWidth: 20 } } } }}
            />
          </div>
          <div className="col-md-6 mb-4">
            <Line
              data={{
                labels: history.map((d) => d.timestamp.split(" ")[1]),
                datasets: [
                  {
                    label: "Humidité sol (%)",
                    data: history.map((d) => d.soil_moisture),
                    borderColor: "green",
                    borderWidth: 3,
                  },
                  {
                    label: "Probabilité de pluie (%)",
                    data: history.map((d) => d.rain_probability * 100),
                    borderColor: "purple",
                    borderWidth: 3,
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { labels: { boxWidth: 20 } } } }}
            />
          </div>
        </div>

        <h4 className="mt-5">
          <i className="fas fa-calendar-alt me-2 text-info"></i>
          Dernière mise à jour :
        </h4>
        <p>
          <i className="fas fa-map-marker-alt text-danger"></i>
          <strong> Localisation :</strong> Settat, Maroc
        </p>
      </MDBContainer>
    </>
  );
};

export default Dashboard;
