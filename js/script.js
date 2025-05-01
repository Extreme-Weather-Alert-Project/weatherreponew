const apiKey = "be7e6d0e031b4958b75230215251804";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const alertsContainer = document.querySelector(".alerts-section");
const cityName = document.querySelector("#cityName");

const goodWeatherBg = "image/weather-image.avif";
const badWeatherBg = "image/cold-image.jpg";

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

let currentTempC = null;
let currentWindKph = null;

function getHoursRemaining(expires) {
  const expiryTime = new Date(expires);
  const now = new Date();
  const diff = Math.max(0, expiryTime - now);
  return Math.ceil(diff / (1000 * 60 * 60));
}

function updateBackground(isBadWeather) {
  const bgUrl = isBadWeather ? badWeatherBg : goodWeatherBg;
  document.getElementById("background-overlay").style.backgroundImage = `url('${bgUrl}')`;
}

document.querySelector(".hero-search").addEventListener("submit", async (e) => {
  e.preventDefault();

  const city = cityInput.value.trim();
  if (!city) return;

  // Show loading while fetching
  alertsContainer.innerHTML = `
    <div class="loading">
      <i class="fa fa-spinner fa-spin"></i> Loading...
    </div>
  `;

  try {
    // Fetch current weather
    const weatherRes = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
    if (!weatherRes.ok) throw new Error("Weather API error");
    const weatherData = await weatherRes.json();

    currentTempC = weatherData.current.temp_c;
    currentWindKph = weatherData.current.wind_kph;

    const tempF = (currentTempC * 9/5) + 32;
    const windMph = currentWindKph / 1.609;

    cityName.textContent = `${weatherData.location.name}, ${weatherData.location.country}`;
    temperature.textContent = `${tempF.toFixed(1)}°F`;
    humidity.textContent = weatherData.current.humidity + "%";
    wind.textContent = `${windMph.toFixed(1)} mph`;

    updateBackground(currentTempC < 10);
    cityInput.value = "";

  } catch (err) {
    console.error("Weather fetch error:", err);
    alertsContainer.innerHTML = `<div class="alert alert-critical">⚠️ Error fetching weather data.</div>`;
    return;
  }

  try {
    // Fetch weather alerts
    const alertRes = await fetch(`https://api.weatherapi.com/v1/alerts.json?key=${apiKey}&q=${city}`);
    if (!alertRes.ok) throw new Error("Alert API error");
    const alertData = await alertRes.json();

    const alerts = alertData.alerts?.alert || [];

    // Clear loading once data is ready
    alertsContainer.innerHTML = "";

    if (alerts.length === 0) {
      alertsContainer.innerHTML = `
        <div class="box">
          <div class="clear">
            <i class="fa fa-check" aria-hidden="true"></i>
          </div>
          <p>All Clear</p>
        </div>
      `;
    } else {
      const seenHeadlines = new Set();

      alerts.forEach((alert) => {
        if (seenHeadlines.has(alert.headline)) {
          return;
        }
        seenHeadlines.add(alert.headline);

        const alertBox = document.createElement("div");
        const timeRemaining = alert.expires
          ? `${getHoursRemaining(alert.expires)}h remaining`
          : "";

        alertBox.className = "alert alert-critical";
        alertBox.innerHTML = `
          <div>
            <h3>${alert.headline}</h3>
            <p>${alert.desc}</p>
            <p><small>Region: ${alert.areaDesc}</small></p>
          </div>
          ${timeRemaining ? `<div class="time-remaining">${timeRemaining}</div>` : ""}
        `;

        const match = Object.keys(safetyData).find(key =>
          alert.event.toLowerCase().includes(
            key.toLowerCase().replace(/ warning/g, "").replace(/ alert/g, "")
          )
        );

        if (match) {
          const tipsList = document.createElement("ul");
          safetyData[match].forEach((tip) => {
            const li = document.createElement("li");
            li.textContent = tip;
            tipsList.appendChild(li);
          });
          alertBox.appendChild(tipsList);
        }

        alertsContainer.appendChild(alertBox);
      });
    }
  } catch (error) {
    console.error("Alerts fetch error:", error);
    const errorMsg = document.createElement("div");
    errorMsg.className = "alert alert-warning";
    errorMsg.innerHTML = `⚠️ Unable to fetch alerts at the moment.`;
    alertsContainer.appendChild(errorMsg);
  }
});

// Hover to temporarily switch to Celsius
temperature.addEventListener("mouseover", () => {
  if (currentTempC === null || currentWindKph === null) return;

  temperature.textContent = `${currentTempC}°C`;
  wind.textContent = `${currentWindKph} kph`;
});

// Mouse out to switch back to Fahrenheit
temperature.addEventListener("mouseout", () => {
  if (currentTempC === null || currentWindKph === null) return;

  const tempF = (currentTempC * 9/5) + 32;
  const windMph = currentWindKph / 1.609;

  temperature.textContent = `${tempF.toFixed(1)}°F`;
  wind.textContent = `${windMph.toFixed(1)} mph`;
});
