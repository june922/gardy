// utils/timehelper.js

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Convert local time to UTC
const toUTC = (datetime) => {
  return dayjs(datetime).utc().format(); // ISO string in UTC
};

// Convert UTC time to local (optional)
const toLocal = (datetime, tz = 'Africa/Nairobi') => {
  return dayjs(datetime).tz(tz).format();
};

module.exports = {
  toUTC,
  toLocal,
};

