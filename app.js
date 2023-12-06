
require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });


app.post('/getWeather', async (req, res) => {
  try {
    const { cities } = req.body;

    // Ensure cities array is provided in the request body
    if (!cities || !Array.isArray(cities)) {
      return res.status(400).json({ error: 'Invalid input. Please provide an array of cities.' });
    }

    // Fetch real-time weather for each city
    const weatherResults = await Promise.all(cities.map(async (city) => {
      const weatherData = await getWeatherData(city);
      return { [city]: weatherData };
    }));

    const response = { weather: {} };

    // Format the response
    weatherResults.forEach((result) => {
      const cityName = Object.keys(result)[0];
      response.weather[cityName] = result[cityName];
    });

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


async function getWeatherData(city) {
  const apiKey = process.env.API_KEYS;
  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
  
  try {
    const response = await axios.get(apiUrl);
    const temperature = response.data.current.temp_c;
    return `${temperature}C`;
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error.message);
    return 'N/A'; 
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
