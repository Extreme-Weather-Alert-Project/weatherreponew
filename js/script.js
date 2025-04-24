const apiKey = "be7e6d0e031b4958b75230215251804";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const alertsContainer = document.querySelector(".alerts-section");

const cityName = document.querySelector("#cityName");

// Background switching (optional)
const goodWeatherBg = "image/weather-image.avif";
const badWeatherBg = "image/weather-12.jpeg";

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

document.querySelector(".hero-search").addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent form submission
  alertsContainer.innerHTML = ""; // Clear previous alerts

  const city = cityInput.value.trim();
  if (!city) return;

  // 🎯 CURRENT WEATHER
  fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`)
    .then((res) => {
      if (!res.ok) throw new Error("Weather API error");
      return res.json();
    })
    .then((data) => {
      const tempC = data.current.temp_c;
      const conditionText = data.current.condition.text.toLowerCase();

      const cityNameText = `${data.location.name}, ${data.location.country}`;
      cityName.textContent = cityNameText;
      temperature.textContent = `${tempC}°C`;
      humidity.textContent = data.current.humidity + "%";
      wind.textContent = data.current.wind_kph + " kph";

      updateBackground(tempC < 10); // true = bad weather

      cityInput.value = "";
    })
    .catch((err) => {
      console.error("Weather fetch error:", err);
      alertsContainer.innerHTML = `<div class="alert alert-critical">⚠️ Error fetching weather data.</div>`;
    });

  // 📢 WEATHER ALERTS
  fetch(`https://api.weatherapi.com/v1/alerts.json?key=${apiKey}&q=${city}`)
    .then((res) => {
      if (!res.ok) throw new Error("Alert API error");
      return res.json();
    })
    .then((data) => {
      const alerts = data.alerts?.alert || [];
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
        alerts.forEach((alert) => {
          const alertBox = document.createElement("div");
          const severity = alert.severity?.toLowerCase() || "unknown";
          const timeRemaining = alert.expires
            ? `${getHoursRemaining(alert.expires)}h remaining`
            : "";

          // 🟡 wuxu display dhahayaa weather severity based on color----look css
          //
          let className = "alert-low";
          if (severity.includes("extreme")) {
            className = "alert-critical";
          } else if (severity.includes("severe")) {
            className = "alert-high";
          } else if (
            severity.includes("moderate") ||
            severity.includes("watch") ||
            severity.includes("advisory")
          ) {
            className = "alert-moderate";
          }

          alertBox.className = `alert ${className}`;
          alertBox.innerHTML = `
            <div>
              <h3>${alert.headline}</h3>
              <p>${alert.desc}</p>
              <p><small>Region: ${alert.areaDesc}</small></p>
            </div>
            ${timeRemaining ? `<div class="time-remaining">${timeRemaining}</div>` : ""}
          `;

          alertsContainer.appendChild(alertBox);
        });
      }
    })
    .catch((error) => {
      console.error("Alerts fetch error:", error);
      alertsContainer.innerHTML = `<div class="alert alert-critical">⚠️ Unable to fetch alerts at the moment.</div>`;
    });
});
