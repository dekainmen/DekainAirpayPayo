/**
 * Create Order SDK
 */
console.log("PAYLOAD RECEIVED:", payload);
class CreateOrderAPI {

  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async createOrder(
    customerMobile,
    userToken,
    amount,
    orderId,
    redirectUrl,
    remark1 = "",
    remark2 = ""
  ) {

    /**
     * Debug logs
     */
    console.log(
      "TOKEN RECEIVED IN SDK:",
      userToken
    );

    const payload =
      new URLSearchParams();

    payload.append(
      "customer_mobile",
      customerMobile
    );

    payload.append(
      "user_token",
      userToken
    );

    payload.append(
      "amount",
      amount
    );

    payload.append(
      "order_id",
      orderId
    );

    payload.append(
      "redirect_url",
      redirectUrl
    );

    payload.append(
      "remark1",
      remark1
    );

    payload.append(
      "remark2",
      remark2
    );

    console.log(
      "SDK REQUEST BODY:",
      payload.toString()
    );

    const response = await fetch(
      this.apiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },
        body: payload
      }
    );

    const data =
      await response.json();

    console.log(
      "SDK GATEWAY RESPONSE:",
      data
    );

    if (
      response.ok &&
      data.status === true
    ) {
      return data;
    }

    throw new Error(
      data.message ||
      "Order creation failed"
    );
  }
}

/**
 * Export
 */
module.exports = CreateOrderAPI;
