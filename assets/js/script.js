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
const iconUrl = "https://openweathermap.org/img/wn/";
// Normally this would be in a config file probably
const apiKey = '2d7684df0d8779cc4e1642a2a6157140';

// Runs on webpage load
function init() {
  $("#search-card").submit(handleCitySearch);
  $("#history-container").on("click", ".history-button", handleHistorySearch);
  $("#delete-history").click(handleDeleteHistory);
  loadFromLocalStorage();
}

// Handles submitting city lookup form when Submit is clicked
function handleCitySearch(event) {
  event.preventDefault();
  const searchElement = $('#search-form input');
  let search = searchElement.val();
  search = allTrim(search);

  if (!search) {
    return;
  }

  hideError();
  showLoader();
  searchElement.val('');
  fetchGeoCoordinates(search);
}

// Handles looking up a city from search history
function handleHistorySearch(event) {
  event.preventDefault();
  const searchElement = $("#search-form input");

  const geoLocation = {
    lat: parseFloat($(this).attr('data-lat')),
    lon: parseFloat($(this).attr('data-lon')),
    city: $(this).text().split(',')[0],
    country: $(this).attr('data-country'),
    state: $(this).attr('data-state')
  }
  
  // Because geoLocation was stored in the history button, we can
  // skip fetchGeoCoordinates API call
  hideError();
  showLoader();
  searchElement.val('');
  fetchWeather(geoLocation);
}

// Fetch geographic data about a city based on city string
function fetchGeoCoordinates(city) {
  const apiUrl = 'https://api.openweathermap.org/geo/1.0/direct';
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
  const dashboard = $("#dashboard");

  dashboard.append($("<h2>").text("Current Weather"));
  dashboard.append($("<h3>").text(buildLocation(geoLocation)));
  dashboard.append(buildCurrentWeather(currentWeather));

  dashboard.append($("<h2>").text("Five-Day Forecast"));
  dashboard.append(buildForecast(forecasts));

  // Search was successful, add to search history
  // if this city is not in the search history already
  if (!historyContainsGeoLocation(geoLocation)) {
    addToHistory(geoLocation);
    // Save entry into localStorage
    addToLocalStorage(geoLocation);
  }
  hideLoader();
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

// Add the search to the search history
// TODO: Limit to 10 buttons
function addToHistory(geoLocation) {

  const historyContainer = $('#history-container');
  // Create a new Bootstrap button
  const button = $('<button>');
  button.addClass('btn btn-secondary history-button');
  button.attr('type', 'button');
  button.attr('value', 'Input');

  // Save geoLocation data in buttons to save an API call
  button.attr('data-lat', geoLocation.lat);
  button.attr('data-lon', geoLocation.lon);
  button.attr('data-country', geoLocation.country);
  button.attr('data-state', geoLocation.state);
  // The button text is the city plus the state/country
  button.text(buildLocation(geoLocation));
  
  // Add the button to the top of the history
  historyContainer.prepend(button);
}

// Saves geoLocation into localStorage array
// TODO: Limit to 10
function addToLocalStorage(geoLocation) {
  let savedSearches = JSON.parse(localStorage.getItem("savedSearches"));
  if (!savedSearches) {
    savedSearches = [];
  }
  savedSearches.push(geoLocation);
  localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
}

function loadFromLocalStorage() {
  let savedSearches = JSON.parse(localStorage.getItem("savedSearches"));
  if (!savedSearches) {
    return;
  }
  for (let i = 0; i < savedSearches.length; i++) {
    const current = savedSearches[i];
    const geoLocation = {
      lat: current.lat,
      lon: current.lon,
      city: current.city,
      country: current.country,
      state: current.state,
    }
    addToHistory(geoLocation);
  }
}

// Removes all history on page and in localStorage
// Requires user confirmation
function handleDeleteHistory() {
  $('#delete-history-modal').on('click', '.btn-danger', function () {
    localStorage.removeItem('savedSearches');
    $('#history-container').empty();    
    $("#delete-history-modal").modal('hide');
  });
  $('#delete-history-modal').modal();
}

// Clears the dashboard and shows loading circle
function showLoader() {
  const dashboard = $('#dashboard');
  const loader = $('<div>');
  loader.addClass('loader');
  dashboard.empty();
  dashboard.append(loader);
}

// Hide loading circle
function hideLoader() {
  const loader = $(".loader");
  loader.remove();
}

// Returns true if localStorage history contains this geoLocation
// Otherwise, returns false
function historyContainsGeoLocation(geoLocation) {
  let savedSearches = JSON.parse(localStorage.getItem("savedSearches"));
  if (!savedSearches) {
    return false;
  }

  for (let i = 0; i < savedSearches.length; i++) {
    const current = savedSearches[i];
    // If there is a match in coordinates, return true
    if (current.lat === geoLocation.lat && current.lon === geoLocation.lon) {
      return true;
    }
  }
  return false;
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

// Helper function that trims trailing and leading whitespace and multiple
// adjacent whitespace in a string
// https://stackoverflow.com/a/7764370
function allTrim(s) {
  return s.replace(/\s+/g, " ").replace(/^\s+|\s+$/, "").trim();
}

// If there's an error with the fetch request, show it under the search bar
function displayError(string) {
  // ghetto error handler hides spinny loader element
  hideLoader();

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

init();