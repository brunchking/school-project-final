const express = require('express');
const router = express.Router();
const path = require('path');
const weatherInfo = require('../public/js/weatherInfo');
const fetch = require('node-fetch');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');
const city = require('../public/js/weather/current_weather/city');
require('dotenv').config();

let isLogin = false;
let first = false;

router.get('/', async (req, res, next) => {
    viewbag = {};
    let api_key = process.env.API_KEY;
    let api_url = `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${api_key}&format=JSON&elementName=MinT,MaxT`;
    const url1 = 'https://www.cwb.gov.tw/Data/js/Observe/Observe_Home.js?';
    const url2 = "https://www.cwb.gov.tw/Data/js/fcst/W50_Data.js?";
    const fetch_response = await fetch(api_url);
    const json = await fetch_response.json();
    let weatherData = [];
    
    if (req.isAuthenticated()) {
        isLogin = true;
    }

    if (req.user === undefined) {
        isLogin = false;
    }

    if (first === true) {
        // Downloading the observe data into local file
        const Observe_Home = fs.createWriteStream(__dirname + "./../public/js/weather/current_weather/Observe_Home.js");
        const request = https.get(url1, function (response) {
            response.pipe(Observe_Home);
        });


        // Downloading the W50 data into local file
        const W50_Data = fs.createWriteStream(__dirname + "./../public/js/weather/W50_Data.js");
        const request2 = https.get(url2, function (response) {
            response.pipe(W50_Data);
        });
        first = true;
    }


    // Render the page. const weatherData = await weatherInfo(json, city.twentyOne);
    Object.keys(city).forEach(async (data, index) => {
        weatherData[index] = weatherInfo(json, city[data]);
        if (index === 21) {
            res.render('weather', { layout: false, isLogin: isLogin, weatherData });
            // weatherData is an array
        }
    })
});

module.exports = router;
