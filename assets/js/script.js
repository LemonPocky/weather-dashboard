// Forecast object prototype
// forecast {
//     date: Moment,
//     iconCode: String,
//     description: String,
//     tempMax: Number,
//     windSpeed: Number,
//     windDegrees: Number,
//     humidity: Number,
//     uvi: Number
// }
const dateFormatString = 'M/D/YYYY';
const iconUrl = "http://openweathermap.org/img/wn/";

function displayForecast(forecasts) {
    const fiveDayForecastElement = $('#five-day-forecast');
    fiveDayForecastElement.addClass('d-flex');
    for (let i = 0; i < forecasts.length; i++) {
        const newCard = createCard(forecasts[i]);
        fiveDayForecastElement.append(newCard);
    }
}

function createCard(forecast) {
    const iconSize = '2x';
    const newCard = $('<div>');
    newCard.addClass('card forecast-card bg-dark');
    const newCardBody = $('<div>');
    newCardBody.addClass('card-body');
    newCard.append(newCardBody);

    // Day of the week
    const dayOfTheWeekElement = $('<h3>');
    dayOfTheWeekElement.text(forecast.date.format('dddd'));
    newCardBody.append(dayOfTheWeekElement);

    // Date
    const dateElement = $('<h3>');
    dateElement.text(forecast.date.format(dateFormatString));
    newCardBody.append(dateElement);

    // Icon
    const iconElement = $('<img>');
    iconElement.attr('src', iconUrl + forecast.iconCode + '@' 
      + iconSize + '.png');
    iconElement.attr('alt', '');
    newCardBody.append(iconElement);

    // Forecast Details
    const forecastDetails = $('<ul>');
    forecastDetails.addClass('list-unstyled');
    forecastDetails.append($('<li>')
      .text(firstUpperCase(forecast.description)));
    forecastDetails.append($('<li>')
      .text('High: ' + forecast.tempMax + '°F'));
    forecastDetails.append($('<li>')
      .text('Wind: ' + forecast.windSpeed + ' MPH ' 
        + getWindDirection(forecast.windDegrees)));
    forecastDetails.append($('<li>')
      .text('Humidity: ' + forecast.humidity + '%'));

    // UV Index
    const UviElement = $('<li>');
    UviElement.text('UV Index: ');
    UviInnerElement = $('<span>');
    UviInnerElement.addClass('text-white px-3 rounded-lg');
    UviInnerElement.css('background-color', getUviColor(forecast.uvi));
    UviInnerElement.text(forecast.uvi);
    UviElement.append(UviInnerElement);
    forecastDetails.append(UviElement);    

    newCardBody.append(forecastDetails);
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

let forecasts = [
  {
    date: moment.unix(1624752375),
    iconCode: "02d",
    description: "few clouds",
    tempMax: 72.41,
    windSpeed: 6.1,
    windDegrees: 260,
    humidity: 13,
    uvi: 6.34,
  },
  {
    date: moment.unix(1624777569),
    iconCode: "02d",
    description: "few clouds",
    tempMax: 72.41,
    windSpeed: 6.1,
    windDegrees: 260,
    humidity: 13,
    uvi: 12.99,
  },
  {
    date: moment.unix(1624777569),
    iconCode: "02d",
    description: "few clouds",
    tempMax: 72.41,
    windSpeed: 6.1,
    windDegrees: 260,
    humidity: 13,
    uvi: 12.99,
  },
  {
    date: moment.unix(1624777569),
    iconCode: "02d",
    description: "few clouds",
    tempMax: 72.41,
    windSpeed: 6.1,
    windDegrees: 260,
    humidity: 13,
    uvi: 12.99,
  },
  {
    date: moment.unix(1624777569),
    iconCode: "02d",
    description: "few clouds",
    tempMax: 72.41,
    windSpeed: 6.1,
    windDegrees: 260,
    humidity: 13,
    uvi: 12.99,
  },
];

displayForecast(forecasts);