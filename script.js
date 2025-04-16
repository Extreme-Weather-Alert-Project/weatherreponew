//let us call the API

//http://api.openweathermap.org/data/2.5/forecast?id=524901&appid={7693c6ef08039f4bdaaed1825d622697}

// Create a function to call the API

function fetchWeather() {
    return axios.get("https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js")
    .then((response) => {
        console.log(response)
    })

    .catch((error) => {
        console.log(error)
    })
}

fetchWeather()
