var holiday_dates = require("date-holidays");

var mail = new Date();
var disc1 = new Date();
var disc2 = new Date();

var mailing_days = 0;
var mail_offset = 0;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

// Initialize holiday dates
var holidays = new holiday_dates();
holidays.init("CA", "ON");

// date_change: Increments day and month
// date: Date object
// num: number of days to increment
function date_change(date, num) {
  date.setDate(date.getDate() + num);
}

// Checks if date is a business day
function is_bus(date) {
  var d = date.getDay();
  if (d == 0 || d == 6 || holidays.isHoliday(date)) {
    return false;
  } else {
    return true;
  }
}

let holiday;
// Set end date of mailing timeline
while (mailing_days < 3) {
  date_change(mail, 1);

  if (is_bus(mail)) {
    //increment mailing day
    mailing_days++;
  } else {
    holiday = holidays.isHoliday(mail);
  }
  mail_offset++;
}

// Set dates of disconnect timeline (11 day range)
date_change(disc1, mail_offset + 11);
date_change(disc2, mail_offset + 21);

// Assemble dates into readable format
var month1 = months[disc1.getMonth()];
var month2 = months[disc2.getMonth()];

var day1 = month1 + " " + disc1.getDate() + "/" + (disc1.getFullYear() % 100);
var day2 = month2 + " " + disc2.getDate() + "/" + (disc2.getFullYear() % 100);

//Email Templating Information
if (holiday) {
  var message = `    Good morning,

    I'd like to confirm the disconnect dates as ${day1} to ${day2}.
    These dates are adjusted for the ${holiday.name} holiday.

    Thank You,

    -Ryan Karumanchery`;
} else {
  var message = `    Good morning,
  
    I'd like to confirm the disconnect dates as ${day1} to ${day2}.

    Thank You,

    - Ryan Karumanchery`;
}

console.log("\n\n" + message + "\n\n");
