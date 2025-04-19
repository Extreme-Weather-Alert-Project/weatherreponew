const API_KEY = "d5793b9db18848c58e331924251904";

const cityInput = document.getElementById("cityInput");
const detectBtn = document.getElementById("detectBtn");
const searchBtn = document.getElementById("searchBtn");
const unitToggle = document.getElementById("unitToggle");

const temperatureEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const alertList = document.getElementById("alert-list");

let currentUnit = "F"; // default to Fahrenheit

const safetyData = {
  "Severe Thunderstorm Warning": [
    "Stay indoors and avoid windows.",
    "Unplug electrical appliances to prevent power surges.",
    "Avoid using water and landline phones during the storm.",
    "Stay away from tall objects and isolated trees if outdoors."
  ],
  "Flash Flood Warning": [
    "Move to higher ground immediately.",
    "Avoid walking or driving through floodwaters.",
    "Turn around, don't drown—just 6 inches of water can knock you down.",
    "Listen to emergency broadcasts for updates."
  ],
  "Tornado Warning": [
    "Take shelter in a basement or interior room without windows.",
    "Avoid mobile homes; seek sturdy shelter.",
    "Protect yourself with a mattress or heavy blanket.",
    "Listen to weather alerts and local authorities."
  ],
  "Hurricane Warning": [
    "Evacuate if instructed by local officials.",
    "Stock up on food, water, and emergency supplies.",
    "Secure windows and outdoor objects.",
    "Stay indoors and avoid coastal areas."
  ],
  "Winter Storm Warning": [
    "Stay indoors and keep warm with extra layers or blankets.",
    "Avoid travel unless absolutely necessary.",
    "Keep a flashlight, food, and water in case of power outages.",
    "Be cautious of icy roads and sidewalks."
  ],
  "Excessive Heat Warning": [
    "Stay hydrated and drink plenty of water.",
    "Avoid outdoor activity during peak heat (10 AM - 4 PM).",
    "Wear light, loose-fitting clothing.",
    "Check on elderly and vulnerable neighbors."
  ],
  "High Wind Warning": [
    "Secure outdoor objects and furniture.",
    "Avoid windows and stay indoors.",
    "Be cautious of falling debris or tree branches.",
    "Avoid unnecessary driving, especially high-profile vehicles."
  ],
  "Blizzard Warning": [
    "Stay indoors and avoid travel.",
    "Prepare an emergency kit with food, water, and medicine.",
    "Keep extra blankets and warm clothing available.",
    "Avoid overexertion when shoveling snow."
  ],
  "Ice Storm Warning": [
    "Stay off roads unless absolutely necessary.",
    "Be prepared for power outages.",
    "Avoid trees and power lines which may fall due to ice.",
    "Use caution when walking—sidewalks may be slippery."
  ],
  "Air Quality Alert": [
    "Avoid prolonged outdoor exertion.",
    "Keep windows closed and use air purifiers indoors.",
    "Wear a mask if air quality is very poor.",
    "Check air quality index before planning outdoor activities."
  ]
};

async function fetchWeatherData(location) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=1&alerts=yes&aqi=no`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found or API error.");
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error.message);
    alert("Failed to fetch weather data. Please check the location.");
    return null;
  }
}

function displayCurrentConditions(data) {
  const current = data.current;
  const temp = currentUnit === "C" ? current.temp_c : current.temp_f;
  const wind = currentUnit === "C" ? `${current.wind_kph} kph` : `${current.wind_mph} mph`;

  temperatureEl.textContent = `${temp}°${currentUnit}`;
  humidityEl.textContent = `${current.humidity}%`;
  windEl.textContent = wind;
}

function displayAlerts(data) {
  const alerts = data.alerts?.alert || [];
  alertList.innerHTML = "";

  if (alerts.length === 0) {
    const allClearCard = document.createElement("div");
    allClearCard.className = "alert-card all-clear";
    allClearCard.innerHTML = `
      <div class="alert-top"><strong>All Clear</strong></div>
      <p>No weather alerts in your area at this time. Enjoy the day!</p>
    `;
    alertList.appendChild(allClearCard);
    return;
  }

  alerts.forEach(alert => {
    const alertCard = document.createElement("div");
    alertCard.className = "alert-card severe";
    alertCard.innerHTML = `
      <div class="alert-top">
        <strong>${alert.event}</strong>
        <span class="time">${getRemainingTime(alert.expires)}</span>
      </div>
      <p>${alert.headline}</p>
      <div class="alert-tags">
        <span class="tag">${alert.event.toUpperCase()}</span>
        <span class="tag">Level ${alert.severity || 1}</span>
      </div>
      <div class="location">${data.location.name}, ${data.location.region}</div>
    `;

    const match = Object.keys(safetyData).find(key =>
      alert.event.toLowerCase().includes(key.toLowerCase().replace(/ warning/g, ""))
    );

    if (match) {
      const tips = safetyData[match];
      const tipList = document.createElement("ul");
      tips.forEach(tip => {
        const li = document.createElement("li");
        li.textContent = tip;
        tipList.appendChild(li);
      });
      alertCard.appendChild(tipList);
    }

    alertList.appendChild(alertCard);
  });
}

function getRemainingTime(expiry) {
  const end = new Date(expiry);
  const now = new Date();
  const diff = Math.max(0, end - now);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}h remaining`;
}

// 🌍 Detect location via geolocation
detectBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  detectBtn.textContent = "Detecting...";
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const coords = `${latitude},${longitude}`;

    const data = await fetchWeatherData(coords);
    if (data) {
      displayCurrentConditions(data);
      displayAlerts(data);
    }

    detectBtn.textContent = "Detect";
  }, (error) => {
    console.error("Geolocation error:", error.message);
    alert("Unable to detect your location.");
    detectBtn.textContent = "Detect";
  });
});

// 🧑‍💻 Search by city input
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city.");
    return;
  }

  const data = await fetchWeatherData(city);
  if (data) {
    displayCurrentConditions(data);
    displayAlerts(data);
  }
});

// 🌡️ Toggle between °F and °C
unitToggle.addEventListener("click", async () => {
  currentUnit = currentUnit === "F" ? "C" : "F";
  unitToggle.textContent = `Switch to °${currentUnit === "F" ? "C" : "F"}`;

  const city = cityInput.value.trim();
  const location = city || null;

  if (location) {
    const data = await fetchWeatherData(location);
    if (data) {
      displayCurrentConditions(data);
      displayAlerts(data);
    }
  }
});
const darkToggle = document.getElementById("darkModeToggle");
const darkIcon = document.getElementById("darkModeIcon");

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const isDark = document.body.classList.contains("dark-mode");
  darkIcon.className = isDark ? "fas fa-moon" : "fas fa-sun";
});