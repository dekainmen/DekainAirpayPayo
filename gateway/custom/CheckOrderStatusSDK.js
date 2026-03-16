// checkOrderStatusSDK.js

function checkOrderStatus(userToken, orderId, callback) {
    const apiUrl = 'https://silver-hawk-998279.hostingersite.com/api/check-order-status';

    const formData = new FormData();
    formData.append('user_token', userToken);
    formData.append('order_id', orderId);

    fetch(apiUrl, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'COMPLETED') {
            callback(null, data.result);
        } else {
            callback(data.message, null);
        }
    })
    .catch(error => {
        callback(error.message, null);
    });
}

// Usage example:
// checkOrderStatus('2048f66bef68633fa3262d7a398ab577', '8052313697', (error, result) => {
//     if (error) {
//         console.error('Error:', error);
//     } else {
//         console.log('Result:', result);
//     }
// });

// Export the function for use in other scripts if needed
export { checkOrderStatus };
