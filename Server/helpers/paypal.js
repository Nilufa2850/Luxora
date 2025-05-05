const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id: "AbPlEhWFFXE73q0Av6AzPhiKXRF2wIyb20IGV0RKkvuCMjbVGVxMwhWjXtcRr3tpnsrcYVxjcSH-oO-2",
  client_secret: "EJngaxUJjZ-KxrgCZRuo11U340ysdWTwmRJdHHo259zUwaDPa3mm1R8IzFJUi0CEb2zOZa7a9F2NHYK-",
});

module.exports = paypal;