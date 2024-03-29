var holiday_dates = require("date-holidays");
const nodemailer = require("nodemailer");
const secure = require("./credentials.js");

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

async function main() {
  let holiday;
  // Set end date of mailing timeline
  while (mailing_days < 3) {
    date_change(mail, 1);
    if (is_bus(mail)) {
      //increment mailing day
      mailing_days++;
    } else {
      holiday = holidays.isHoliday(mail);
      if (holiday) {
        console.log("\nDates adjusted for " + holiday.name);
      }
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
    var message = `Good morning,

  I'd like to confirm the disconnect dates as ${day1} to ${day2}.
  These dates are adjusted for the ${holiday.name} holiday.

  Thank You,

  - Ryan Karumanchery`;

    var html_message = `
  <div>
  <p>Good morning,</p>
  <p>I'd like to confirm the disconnect dates as ${day1} to ${day2}.</p>
  <p>These dates are adjusted for the ${holiday.name} holiday.</p>
  <p>Thank You,</p>
  <p>- Ryan Karumanchery</p>
  <img src="cid:ryansemailsignature"/>
  </div>
  `;
  } else {
    var message = `Good morning,
  
I'd like to confirm the disconnect dates as ${day1} to ${day2}.

Thank You,

- Ryan Karumanchery`;

    var html_message = `
    <div>
    <p>Good morning,</p>
    <p>I'd like to confirm the disconnect dates as ${day1} to ${day2}.</p>
    <p>Thank You,</p>
    <p>- Ryan Karumanchery</p>
    <img src="cid:ryansemailsignature"/>
    </div>
    `;
  }

  var template = {
    from: secure.email_from,
    to: secure.email_to,
    cc: secure.email_cc,
    attachments: [
      {
        // file on disk as an attachment
        filename: "email_signature.PNG",
        path: "./Images/email_signature.PNG",
        cid: "ryansemailsignature"
      }
    ],
    subject: "Disconnect Timeline Confirmation",
    text: message,
    html: `
    <div>
      ${html_message}
    </div>`.trim()
  };

  // Set up nodemailer
  let transporter = nodemailer.createTransport({
    host: secure.host,
    port: 587,
    secure: false,
    auth: {
      user: secure.auth_user,
      pass: secure.auth_pass
    },
    tls: { rejectUnauthorized: false }
  });

  let info = await transporter.sendMail(template);

  // Print to console for verification
  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
