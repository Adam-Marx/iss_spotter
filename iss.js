const request = require('request');

const fetchMyIP = function(cb) {
  request('https://api.ipify.org?format=json', (error, response, body) => {

    if (error) {
      cb(error, null);
      return;
    }

    // console.log('Status Code:', response.statusCode);
    if (response.statusCode !== 200) {
      const msg = `Status code ${response.statusCode} when fetching IP. Response: ${body}`;
      cb(Error(msg), null);
      return;
    }

    const ipAddress = JSON.parse(body);
    cb(null, ipAddress.ip);

  });
};


const fetchCoordsByIP = function(ip, cb) {
  request(`http://ipwho.is/${ip}`, (error, response, body) => {
    
    const data = JSON.parse(body);

    if (error) {
      cb(error, null);
      return;
    }

    // console.log('Status Code:', response.statusCode);
    if (response.statusCode !== 200) {
      const msg = `Status code ${response.statusCode} when fetching IP. Response: ${body}`;
      cb(Error(msg), null);
      return;
    }

    if (data.success !== true) {
      const msg = `IP fetch unsuccessful for ${ip}. Server says: "${data.message}". Check spelling.`;
      cb(Error(msg), null);
      return;
    }

    const { latitude, longitude } = data;
    
    cb(null, { latitude, longitude });
    
    


  });
};

const fetchISSFlyOverTimes = function(coordinates, cb) {
  request(`https://iss-flyover.herokuapp.com/json/?lat=${coordinates.latitude}&lon=${coordinates.longitude}`, (error, response, body) => {

    if (error) {
      cb(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      const msg = `Status code ${response.statusCode} when fetching fly over times. Response: ${body}`;
      cb(Error(msg), null);
      return;
    }

    const flyOverData = JSON.parse(body);

    cb(null, flyOverData.response);

  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };

