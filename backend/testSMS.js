require("dotenv").config();
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_FROM_PHONE;
const toPhone = process.env.TEST_SMS_TO_PHONE;

if (!accountSid || !authToken || !fromPhone || !toPhone) {
  throw new Error("Missing Twilio environment variables");
}

const client = twilio(accountSid, authToken);

client.messages
  .create({
    body: "Test SMS Wheely Good",
    from: fromPhone,
    to: toPhone,
  })
  .then((msg) => console.log("SMS sent:", msg.sid))
  .catch((err) => console.error("ERROR:", err.message));
require("dotenv").config();
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_FROM_PHONE;
const toPhone = process.env.TEST_SMS_TO_PHONE;

if (!accountSid || !authToken || !fromPhone || !toPhone) {
  throw new Error("Missing Twilio environment variables");
}

const client = twilio(accountSid, authToken);

client.messages
  .create({
    body: "Test SMS Wheely Good",
    from: fromPhone,
    to: toPhone,
  })
  .then((msg) => console.log("SMS sent:", msg.sid))
  .catch((err) => console.error("ERROR:", err.message));
