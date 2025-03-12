import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://api.retinarisk.com/api";
const credentials = {
  email: "tohofa4719@oziere.com",
  password: "tohofa4719@oziere.com",
};

function RetinopathyRiskDetector() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    diabetesDuration: 10,
    diabetesType: "Type1",
    gender: "male",
    hasRetinopathy: 1,
    bloodGlucoseValue: 11,
    bloodGlucoseType: "%",
    systolicBP: 160,
    diastolicBP: 100,
  });

  // Authenticate and get token
  const authenticate = async () => {
    try {
      const response = await axios.post(`${API_BASE}/auth/sign-in`, credentials);
      setToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
    } catch {
      setError("Failed to authenticate. Please try again.");
    }
  };

  // Refresh token if expired
  const refreshAuthToken = async () => {
    try {
      const response = await axios.post(`${API_BASE}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      setToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
    } catch {
      setError("Session expired. Please refresh the page.");
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "hasRetinopathy" ? Number(value) : value;
    setFormData({ ...formData, [name]: newValue });
  };

  // Calculate risk
  const calculateRisk = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRiskData(null);

    if (!token) {
      await authenticate();
    }

    try {
      const response = await axios.post(
        `${API_BASE}/calculator/calculaterisk`,
        {
          data: {
            diabetesDuration: formData.diabetesDuration,
            diabetesType: formData.diabetesType,
            gender: formData.gender,
            hasRetinopathy: formData.hasRetinopathy,
            bloodGlucose: {
              type: formData.bloodGlucoseType,
              value: formData.bloodGlucoseValue,
            },
            bloodPressures: {
              diastolic: formData.diastolicBP,
              systolic: formData.systolicBP,
            },
          },
          options: { format: "json", language: "en" },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRiskData(response.data.results);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        await refreshAuthToken();
        calculateRisk(e);
      } else {
        setError("Failed to calculate risk. Please check inputs.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">Retinopathy Risk Detector</h2>

      {/* Form */}
      <form onSubmit={calculateRisk} className="bg-white p-6 rounded-lg shadow-md w-3/4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Diabetes Duration (years)</label>
            <input
              type="number"
              name="diabetesDuration"
              value={formData.diabetesDuration}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block font-semibold">Diabetes Type</label>
            <select
              name="diabetesType"
              value={formData.diabetesType}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="Type1">Type 1</option>
              <option value="Type2">Type 2</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold">Has Retinopathy</label>
            <select
              name="hasRetinopathy"
              value={formData.hasRetinopathy}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold">Blood Glucose (%)</label>
            <input
              type="number"
              name="bloodGlucoseValue"
              value={formData.bloodGlucoseValue}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block font-semibold">Systolic Blood Pressure</label>
            <input
              type="number"
              name="systolicBP"
              value={formData.systolicBP}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block font-semibold">Diastolic Blood Pressure</label>
            <input
              type="number"
              name="diastolicBP"
              value={formData.diastolicBP}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Check Risk"}
        </button>
      </form>

      {/* Error */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Display Risk Data */}
      {riskData && (
        <div className="mt-6 p-6 bg-white shadow-md rounded-lg w-3/4 text-left">
          <h3 className="text-xl font-bold text-red-600">{riskData.Analysis.riskValue.title}</h3>
          <p className="text-gray-700">{riskData.Analysis.riskValue.text}</p>

          <div className="mt-4 p-4 border-l-4 border-red-500 bg-red-50">
            <h4 className="text-lg font-semibold text-red-700">{riskData.Analysis.bloodPressure.title}</h4>
            <p className="text-gray-700">{riskData.Analysis.bloodPressure.text}</p>
          </div>

          <p className="mt-4 font-semibold text-blue-700">
            Risk Value: <span className="font-bold">{riskData.RiskValue}%</span>
          </p>
          <p className="font-semibold text-blue-700">
            Screening Interval: <span className="font-bold">{riskData.ScreeningInterval} months</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default RetinopathyRiskDetector;
