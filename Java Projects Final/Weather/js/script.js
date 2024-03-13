



////////////////Weather/////////////////

function formatTime(date) {
    let hours = date.getHours();
    if (hours < 10) {
        hours = `0${hours}`;
    }

    let minutes = date.getMinutes();
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    return `${hours}:${minutes}`;
}

function formatDay(date) {
    const dayArray = date.getDay();
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    const day = days[dayArray];
    return day;
}

const currentTime = document.querySelector("#current-time");
let newCurrentTime = new Date();
currentTime.innerHTML = formatTime(newCurrentTime);

const currentDay = document.querySelector("#current-day");
let newCurrentDay = new Date();
currentDay.innerHTML = formatDay(newCurrentDay);



function displayWeatherInfo(response) {
    document.querySelector("#searched-city").innerHTML = response.data.name;
    const temperature = Math.round(response.data.main.temp);
    document.querySelector("#current-temperature").innerHTML = `${temperature}°`;
    const humidity = response.data.main.humidity;
    document.querySelector("#humidity").innerHTML = `${humidity}%`;
    const windSpeed = Math.round(response.data.wind.speed);
    document.querySelector("#wind").innerHTML = `${windSpeed}km/h`;
    const weatherTypeCode = response.data.weather[0].icon;
    const weatherIconContainer = document.querySelector("#weather-icon");
    weatherIconContainer.innerHTML = "";

    const weatherIcons = {
        "01d": "https://openweathermap.org/img/wn/01d@2x.png",
        "02d": "https://openweathermap.org/img/wn/02d@2x.png",
        "03d": "https://openweathermap.org/img/wn/03d@2x.png",
        "04d": "https://openweathermap.org/img/wn/04d@2x.png",
        "09d": "https://openweathermap.org/img/wn/09d@2x.png",
        "10d": "https://openweathermap.org/img/wn/10d@2x.png",
        "11d": "https://openweathermap.org/img/wn/11d@2x.png",
        "13d": "https://openweathermap.org/img/wn/13d@2x.png",
        "50d": "https://openweathermap.org/img/wn/50d@2x.png",
        "01n": "https://openweathermap.org/img/wn/01n@2x.png",
        "02n": "https://openweathermap.org/img/wn/02n@2x.png",
        "03n": "https://openweathermap.org/img/wn/03n@2x.png",
        "04n": "https://openweathermap.org/img/wn/04n@2x.png",
        "09n": "https://openweathermap.org/img/wn/09n@2x.png",
        "10n": "https://openweathermap.org/img/wn/10n@2x.png",
        "11n": "https://openweathermap.org/img/wn/11n@2x.png",
        "13n": "https://openweathermap.org/img/wn/13n@2x.png",
        "50n": "https://openweathermap.org/img/wn/50n@2x.png"
    };

    if (weatherIcons.hasOwnProperty(weatherTypeCode)) {
        const iconSrc = weatherIcons[weatherTypeCode];
        const iconElement = document.createElement("img");
        iconElement.src = iconSrc;
        iconElement.alt = response.data.weather[0].description;
        weatherIconContainer.appendChild(iconElement);
    }
}


function searchCity(city) {
    const apiKey = "49cd3dd4ca4abd678c9cfdcac913c24e";
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric`;
    axios.get(`${apiUrl}&appid=${apiKey}`).then(displayWeatherInfo);
}

function fetchWeeklyForecast(city) {
    const apiKey = "49cd3dd4ca4abd678c9cfdcac913c24e";
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    return axios.get(apiUrl);
}

function handleSubmit(event) {
    event.preventDefault();
    let city = document.querySelector("#search-input").value;
    searchCity(city);
    fetchWeeklyForecast(city)
        .then(response => {
            const forecastData = response.data.list;
            displayWeeklyForecast(forecastData);
        })
        .catch(error => {
            console.error("Error fetching weekly forecast:", error);
        });
}


const searchBar = document.querySelector("#search-form");
searchBar.addEventListener("submit", handleSubmit);


function displayWeeklyForecast(forecastData) {
    const dailyForecasts = {};


    forecastData.forEach(dataPoint => {
        const date = new Date(dataPoint.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = dataPoint;
        }
    });


    const weeklyForecastContainer = document.querySelector("#weekly-forecast");
    weeklyForecastContainer.innerHTML = "";

    Object.values(dailyForecasts).forEach(dataPoint => {
        const date = new Date(dataPoint.dt * 1000);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        const temperature = Math.round(dataPoint.main.temp);
        const weatherType = dataPoint.weather[0].description;
        const iconCode = dataPoint.weather[0].icon;

        const forecastItem = document.createElement("div");
        forecastItem.classList.add("forecast-item");

        const dayElement = document.createElement("div");
        dayElement.textContent = dayOfWeek;
        forecastItem.appendChild(dayElement);

        const iconElement = document.createElement("img");
        iconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        iconElement.alt = weatherType;
        forecastItem.appendChild(iconElement);

        const tempElement = document.createElement("div");
        tempElement.textContent = `${temperature}°`;
        forecastItem.appendChild(tempElement);

        weeklyForecastContainer.appendChild(forecastItem);
    });
}












