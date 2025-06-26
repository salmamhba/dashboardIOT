import axios from "axios";

const API_BASE = "http://127.0.0.1:5000"; // 🟢 PAS :5000 !

export const fetchLatestData = async () => {
  const response = await axios.get(`${API_BASE}/latest_data`);
  return response.data;
};

