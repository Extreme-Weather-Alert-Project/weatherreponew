const apiKey = "be7e6d0e031b4958b75230215251804";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const alertsContainer = document.querySelector(".alerts-section");

const cityName = document.querySelector("#cityName");

// const goodWeatherBg = "image/weather-image.avif";
// const badWeatherBg = "image/weather-12.jpeg";

function getHoursRemaining(expires) {
  const expiryTime = new Date(expires);
  const now = new Date();
  const diff = Math.max(0, expiryTime - now);
  return Math.ceil(diff / (1000 * 60 * 60));
}

function updateBackground(isBadWeather) {
  const bgUrl = isBadWeather ? badWeatherBg : goodWeatherBg;
  document.getElementById(
    "background-overlay"
  ).style.backgroundImage = `url('${bgUrl}')`;
}

searchBtn.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent form submission

  const city = cityInput.value.trim();
  if (!city) return;

  // 🎯 CURRENT WEATHER
  fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`)
    .then((res) => res.json())
    .then((data) => {
      const tempC = data.current.temp_c;

      console.log(data);

      const conditionText = data.current.condition.text.toLowerCase();

      const cityNameText = data.location.country;
      console.log(cityNameText);

      cityName.textContent = `${cityNameText}`;
      temperature.textContent = `${tempC}°C`;
      humidity.textContent = data.current.humidity + "%";
      wind.textContent = data.current.wind_kph + " kph";

      if (tempC > 10) {
        console.log("Good Weather");
      } else if (tempC < 10) {
        console.log("Bad Weather");
      } else {
        console.log("Bad Weather");
      }

      // console.log(cityInput.value);
      cityInput.value = ""; 
      
    })
    .catch((err) => {
      console.error("Weather fetch error:", err);
      alertsContainer.innerHTML = `<div class="alert danger">⚠️ Error fetching weather data.</div>`;
    });

  // 📢 WEATHER ALERTS
  fetch(`https://api.weatherapi.com/v1/alerts.json?key=${apiKey}&q=${city}`)
    .then((res) => res.json())
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
          const severity = alert.severity?.toLowerCase() || "info";
          const timeRemaining = alert.expires
            ? `${getHoursRemaining(alert.expires)}h remaining`
            : "";

          let className = "info";
          if (severity.includes("severe") || severity.includes("extreme")) {
            className = "danger";
          } else if (
            severity.includes("moderate") ||
            severity.includes("watch") ||
            severity.includes("advisory")
          ) {
            className = "warning";
          }

          alertBox.className = `alert ${className}`;
          alertBox.innerHTML = `
            <div>
              <h3>${alert.headline}</h3>
              <p>${alert.desc}</p>
              <p><small>Region: ${alert.areaDesc}</small></p>
            </div>
            <div class="time-remaining">${timeRemaining}</div>
          `;
          alertsContainer.appendChild(alertBox);
        });
      }
    })
    .catch((error) => {
      console.error("Alerts fetch error:", error);
      alertsContainer.innerHTML = `<div class="alert danger">⚠️ Unable to fetch alerts at the moment.</div>`;
    });
});
