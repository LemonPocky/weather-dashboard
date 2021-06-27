// Forecast object prototype
// forecast {
//     date: Moment,
//     iconCode: String,
//     tempMax: Number,
//     windSpeed: Number,
//     windDegrees: Number,
//     humidity: Number,
//     uvi: Number
// }

function displayForecast(forecasts) {
    const fiveDayForecastElement = $('#five-day-forecast');
    fiveDayForecastElement.addClass('d-flex');
    for (let i = 0; i < forecasts.length; i++) {
        const newCard = createCard(forecasts[i]);
        fiveDayForecastElement.append(newCard);
    }
}

function createCard(forecast) {

}

let forecasts = [
  {
    date: moment.unix(1624752375),
    iconCode: "02d",
    tempMax: 72.41,
    windSpeed: 6.1,
    windDegrees: 260,
    humidity: 13,
    uvi: 5.43,
  },
  {
    date: moment.unix(1624777569),
    iconCode: "02d",
    tempMax: 72.41,
    windSpeed: 6.1,
    windDegrees: 260,
    humidity: 13,
    uvi: 5.43,
  },
];