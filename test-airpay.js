const airpay = require("./airpay_nodejs_v4"); // adjust path

const request = {
  mercid: "M352202",
  orderid: "TEST123",
  amount: "1.00",
  buyerEmail: "test@test.com",
  buyerPhone: "9999999999",
  buyerFirstName: "Test",
  buyerLastName: "User",
  returnUrl: "https://dekainmen.shop/payment/return",
  notifyUrl: "https://dekainmen.shop/api/payment/webhook/airpay"
};

airpay.createOrder(request)
  .then(res => console.log(res))
  .catch(err => console.error(err));