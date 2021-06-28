// Weather object prototype
// weather {
//     date: Moment,
//     iconCode: String,
//     description: String,
//     tempMax: Number,
//     windSpeed: Number,
//     windDegrees: Number,
//     humidity: Number,
//     uvi: Number
// }
// Geographic location prototype
// geoLocation {
//   lat: Number
//   lon: Number
//   city: String
//   country: String
//   state: String
// }

// Constants
const dateFormatString = 'M/D/YYYY';
const iconUrl = "http://openweathermap.org/img/wn/";
// Normally this would be in a config file probably
const apiKey = '2d7684df0d8779cc4e1642a2a6157140';

// Fetch geographic data about a city based on city string
function fetchGeoCoordinates(city) {
  const apiUrl = 'http://api.openweathermap.org/geo/1.0/direct';
  // max number of results to get (assume only first for now)
  const limit = 1;

  fetch(apiUrl 
    + '?q=' + city 
    + '&limit=' + limit 
    + '&appid=' + apiKey)
    .then(function (response) {
      // check for errors
      if (!response.ok) {
        displayError(response.status + ": " + response.statusText);
        return;
      }
      return response.json();
    })
    .then(function (data) {
      // Returns null if city is not found
      if (!data) {
        return null;
      } else if (!data.length) {
        displayError('City not found in the database.');
        return null;
      }

      let result = data[0];
      // Return a geoCoordinates object with lat/lon/country/state (if applicable)
      let geoLocation = {
        lat: result.lat,
        lon: result.lon,
        city: city,
        country: result.country,
        state: result.state,
      };
      
      // Now we can query for weather after finding our location
      fetchWeather(geoLocation);
    });
}

// Fetch weather data based on a geographic location
function fetchWeather(geoLocation) {
  const apiUrl = 'https://api.openweathermap.org/data/2.5/onecall';
  const excludes = 'minutely,hourly,alerts';

  fetch(apiUrl
    + '?lat=' + geoLocation.lat
    + '&lon=' + geoLocation.lon
    + '&units=' + 'imperial'
    + '&exclude=' + excludes
    + '&appid=' + apiKey)
    .then(function (response) {
      // check for errors
      if (!response.ok) {
        displayError(response.status + ": " + response.statusText);
        return;
      }
      return response.json();
    })
    .then(function (data) {
      // Returns null if there is an error with the request
      if (!data) {
        return null;
      }
      const currentWeather = extractCurrentWeather(data);
      const forecasts = extractForecasts(data);
      // Show weather data on page
      renderWeather(geoLocation, currentWeather, forecasts);
    });
}

// Returns a weather object describing the current weather conditions
// from api fetch call
function extractCurrentWeather(data) {
  const current = data.current;
  const currentWeather = {
    date: moment(),
    iconCode: current.weather[0].icon,
    description: current.weather[0].description,
    tempMax: Math.round(current.temp),
    windSpeed: Math.round(current.wind_speed),
    windDegrees: current.wind_deg,
    humidity: current.humidity,
    uvi: current.uvi
  };
  return currentWeather;
}

// Returns an array of weather objects describing the forecast for the next 
// five days from api fetch call
function extractForecasts(data) {
  const dailies = data.daily.slice(0,5);
  let forecasts = [];

  for (let i = 0; i < dailies.length; i++) {
    const current = dailies[i];
    const forecast = {
      date: moment().add(i, 'd'),
      iconCode: current.weather[0].icon,
      description: current.weather[0].description,
      tempMax: Math.round(current.temp.day),
      windSpeed: Math.round(current.wind_speed),
      windDegrees: current.wind_deg,
      humidity: current.humidity,
      uvi: current.uvi,
    };
    forecasts.push(forecast);
  }
  return forecasts;
}

// Show weather in the dashboard (right panel)
function renderWeather(geoLocation, currentWeather, forecasts) {
  const dashboard = $('#dashboard');

  dashboard.append($("<h2>").text("Current Weather"));
  dashboard.append($("<h3>").text(buildLocation(geoLocation)));
  dashboard.append(buildCurrentWeather(currentWeather));

  dashboard.append($('<h2>').text('Five-Day Forecast'));
  dashboard.append(buildForecast(forecasts));
}

// Display the current city and state/country
function buildLocation(geoLocation) {
  let locationString = geoLocation.city + ", ";
  if (!geoLocation.state) {
    locationString += geoLocation.country;
  } else {
    locationString += geoLocation.state;
  }
  return locationString;
}

// Create the card that displays the current weather
function buildCurrentWeather(currentWeather) {
  const currentWeatherCard = createCard(currentWeather);
  currentWeatherCard.attr('id', 'current-weather');
  return currentWeatherCard;
}

// Create the container + cards that shows the five-day forecast
function buildForecast(forecasts) {
  const fiveDayForecastElement = $("<div>");
  fiveDayForecastElement.attr('id', 'five-day-forecast');
  fiveDayForecastElement.addClass('d-flex');
  // Create a new card for each day in the forecast
  for (let i = 0; i < forecasts.length; i++) {
      const newCard = createCard(forecasts[i]);
      newCard.addClass('forecast-card bg-dark');
      fiveDayForecastElement.append(newCard);
  }
  return fiveDayForecastElement;
}

// Generates a card displaying the weather and details
function createCard(weather) {
    const iconSize = '2x';
    const newCard = $('<div>');
    newCard.addClass('card');
    const newCardBody = $('<div>');
    newCardBody.addClass('card-body');
    newCard.append(newCardBody);

    // Day of the week
    const dayOfTheWeekElement = $('<h3>');
    dayOfTheWeekElement.text(weather.date.format('dddd'));
    newCardBody.append(dayOfTheWeekElement);

    // Date
    const dateElement = $('<h3>');
    dateElement.text(weather.date.format(dateFormatString));
    newCardBody.append(dateElement);

    // Icon
    const iconElement = $('<img>');
    iconElement.attr('src', iconUrl + weather.iconCode + '@' 
      + iconSize + '.png');
    iconElement.attr('alt', '');
    newCardBody.append(iconElement);

    // Weather Details
    const weatherDetails = $('<ul>');
    weatherDetails.addClass('list-unstyled');

    weatherDetails.append($('<li>')
      .text(firstUpperCase(weather.description)));

    // Add .temperature class to temp to be selected later
    const tempDetails = $('<li>');
    tempDetails.addClass('temperature');
    tempDetails.text("Temp: " + weather.tempMax + "°F");
    weatherDetails.append(tempDetails);

    weatherDetails.append($('<li>')
      .text('Wind: ' + weather.windSpeed + ' MPH ' 
        + getWindDirection(weather.windDegrees)));

    weatherDetails.append($('<li>')
      .text('Humidity: ' + weather.humidity + '%'));

    // UV Index
    const UviElement = $('<li>');
    UviElement.text('UV Index: ');
    UviInnerElement = $('<span>');
    UviInnerElement.addClass('text-white px-3 rounded-lg');
    UviInnerElement.css('background-color', getUviColor(weather.uvi));
    UviInnerElement.text(weather.uvi);
    UviElement.append(UviInnerElement);
    weatherDetails.append(UviElement);    

    newCardBody.append(weatherDetails);
    return newCard;
}

// Helper function that calculates wind direction based on degrees
function getWindDirection(degrees) {
  // There's 16 different wind direction strings (N, NNE, NE, ENE ...)
  // Wind direction type changes every 22.5 degrees (nightmare)
  // So we divide the degrees up into ranges via division
  const degreePartition = Math.round(degrees / 22.5);
  switch(degreePartition) {
    case 0:
      return 'N';
    case 1:
      return 'NNE';
    case 2:
      return 'NE';
    case 3:
      return 'ENE';
    case 4:
      return 'E';
    case 5:
      return 'ESE';
    case 6:
      return 'SE';
    case 7:
      return 'SSE';
    case 8:
      return 'S';
    case 9:
      return 'SSW';
    case 10:
      return 'SW';
    case 11:
      return 'WSW';
    case 12:
      return 'W';
    case 13:
      return 'WNW';
    case 14:
      return 'NW';
    case 15:
      return 'NNW';
    case 16:
      return 'N';
    default:
      return '';
  }
}

// Helper function that returns a sliding color scale based on UV Index
// TODO: Make this a dynamic gradient
function getUviColor(uvi) {
  // Green = 0
  // Yellow = 3
  // Orange = 6
  // Red = 8
  // Purple = 11
  if (uvi < 3) {
    return '#30ba53';
  } else if (uvi < 6) {
    return '#b3b319';
  } else if (uvi < 8) {
    return '#cf7a02';
  } else if (uvi < 11) {
    return '#a30000';
  } else {
    return '#8d00a3';
  }
}

// Helper function that returns a string with the first letter capitalized
function firstUpperCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// If there's an error with the fetch request, show it under the search bar
function displayError(string) {
  const searchCardElement = $('#search-card');
  const titleElement = searchCardElement.find('.card-title');
  const errorElement = $('<p>');
  errorElement.text(string);
  errorElement.css('color', 'red');
  errorElement.attr('id', 'search-error-message');
  titleElement.after(errorElement);
}

// Hides error under search bar, if any
function hideError() {
  $('#search-error-message').remove();
}

hideError();
fetchGeoCoordinates('San Diego');
// renderWeather(currentWeather, forecasts);