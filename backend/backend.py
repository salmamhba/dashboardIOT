from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
import requests
import pandas as pd
import numpy as np
from joblib import load
from datetime import datetime
from pydantic import BaseModel
import uvicorn

# ✅ Modèle LSTM
class RainLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=1):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.dropout(out[:, -1, :])
        return self.fc(out).squeeze()

# ✅ Chargement modèle et scaler
model = RainLSTM(input_size=7)
model.load_state_dict(torch.load("lstm_rain_model.pt", map_location=torch.device("cpu")))
model.eval()
scaler = load("scaler.pkl")

# ✅ FastAPI App
app = FastAPI()
latest_data = {}
pump_state = {"on": False}  # ➕ État de la pompe

# ✅ Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Schéma de validation des données capteurs
class SensorData(BaseModel):
    temperature: float
    humidity: float
    soil_moisture: float

# ✅ API météo

def get_api_weather(lat: float, lon: float) -> dict:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ",".join([
            "temperature_2m", "relative_humidity_2m", "dew_point_2m",
            "cloud_cover", "surface_pressure", "wind_speed_10m"
        ]),
        "timezone": "auto"
    }
    response = requests.get(url, params=params)
    current = response.json()["current"]
    return {
        "temperature_2m": current["temperature_2m"],
        "relative_humidity_2m": current["relative_humidity_2m"],
        "dew_point_2m": current["dew_point_2m"],
        "cloud_cover": current["cloud_cover"],
        "surface_pressure": current["surface_pressure"],
        "wind_speed_10m": current["wind_speed_10m"],
        "previous_rain": 0.0
    }

def check_precipitation_forecast(lat: float, lon: float) -> bool:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "precipitation",
        "timezone": "auto"
    }
    response = requests.get(url, params=params)
    data = response.json()["hourly"]["precipitation"]
    return any(p > 0.2 for p in data[:24])

# ✅ Prédiction pluie (GET)
@app.get("/predict")
def predict_rain(lat: float = 33.0017, lon: float = -7.6186):
    try:
        raw_data = get_api_weather(lat, lon)
        features = [
            "previous_rain", "relative_humidity_2m", "wind_speed_10m",
            "temperature_2m", "dew_point_2m", "cloud_cover", "surface_pressure"
        ]
        df = pd.DataFrame([raw_data])
        X_scaled = scaler.transform(df[features])
        X_tensor = torch.tensor(np.expand_dims(X_scaled, axis=0), dtype=torch.float32)

        with torch.no_grad():
            output = model(X_tensor)
            prob = torch.sigmoid(output).item()
            prediction_model = int(prob > 0.5)

        prediction_api = check_precipitation_forecast(lat, lon)

        return {
            "latitude": lat,
            "longitude": lon,
            "probability_model": round(prob, 4),
            "will_rain_model": bool(prediction_model),
            "will_rain_api": prediction_api
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ✅ Réception des données capteurs (POST)
""" @app.post("/sensor")
def receive_sensor_data(data: SensorData):
    global latest_data
    try:
        temperature = data.temperature
        humidity = data.humidity
        soil_moisture = data.soil_moisture
        dew_point = temperature - ((100 - humidity) / 5)

        lat, lon = 33.0017, -7.6186
        api_data = get_api_weather(lat, lon)
        api_data.update({
            "temperature_2m": temperature,
            "relative_humidity_2m": humidity,
            "dew_point_2m": dew_point
        })

        features = [
            "previous_rain", "relative_humidity_2m", "wind_speed_10m",
            "temperature_2m", "dew_point_2m", "cloud_cover", "surface_pressure"
        ]
        df = pd.DataFrame([api_data])
        X_scaled = scaler.transform(df[features])
        X_tensor = torch.tensor([X_scaled], dtype=torch.float32)

        with torch.no_grad():
            output = model(X_tensor)
            prob = torch.sigmoid(output).item()
            will_rain = int(prob > 0.5)

        latest_data = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "temperature": temperature,
            "humidity": humidity,
            "soil_moisture": soil_moisture,
            "cloud_cover": api_data["cloud_cover"],
            "wind_speed": api_data["wind_speed_10m"],
            "surface_pressure": api_data["surface_pressure"],
            "will_rain_model": bool(will_rain),
            "rain_probability": round(prob, 4)
        }

        return {"message": "✅ Données reçues et combinées", **latest_data}

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
 """
@app.post("/sensor")
def receive_sensor_data_test():
    global latest_data
    try:
        # ➕ Données simulées (fixes pour test)
        temperature = 27.5
        humidity = 55.0
        soil_moisture = 42.0
        dew_point = temperature - ((100 - humidity) / 5)

        lat, lon = 33.0017, -7.6186
        api_data = get_api_weather(lat, lon)

        api_data.update({
            "temperature_2m": temperature,
            "relative_humidity_2m": humidity,
            "dew_point_2m": dew_point,
            "previous_rain": 0.0  # valeur par défaut
        })

        features = [
            "previous_rain", "relative_humidity_2m", "wind_speed_10m",
            "temperature_2m", "dew_point_2m", "cloud_cover", "surface_pressure"
        ]
        df = pd.DataFrame([api_data])
        X_scaled = scaler.transform(df[features])
        X_tensor = torch.tensor([X_scaled], dtype=torch.float32)

        with torch.no_grad():
            output = model(X_tensor)
            prob = torch.sigmoid(output).item()
            will_rain = int(prob > 0.5)

        latest_data = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "temperature": temperature,
            "humidity": humidity,
            "soil_moisture": soil_moisture,
            "cloud_cover": api_data["cloud_cover"],
            "wind_speed": api_data["wind_speed_10m"],
            "surface_pressure": api_data["surface_pressure"],
            "will_rain_model": bool(will_rain),
            "rain_probability": round(prob, 4)
        }

        return {"message": "✅ Données test enregistrées", **latest_data}

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

# ✅ Accès aux dernières données (GET)
@app.get("/latest_data")
def get_latest_sensor_data():
    if latest_data:
        return latest_data
    else:
        return JSONResponse(status_code=404, content={"message": "❌ Aucune donnée reçue"})

# ✅ ➕ API pour la pompe : Récupération 
@app.get("/pump_status")
def get_pump_status():
    return {"status": "on" if pump_state["on"] else "off"}

# ✅ ➕ API pour la pompe : Mise à jour depuis dashboard
@app.post("/pump_status")
async def set_pump_status(request: Request):
    try:
        payload = await request.json()
        pump_state["on"] = payload.get("on", False)
        return {"message": f"Pompe {'activée' if pump_state['on'] else 'désactivée'} ✅"}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

# ✅ Lancement du serveur (optionnel)
if __name__ == "__main__":
    uvicorn.run("backend:app", host="0.0.0.0", port=5000, reload=True)
