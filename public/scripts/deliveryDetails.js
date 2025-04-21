const AjaxDeliveryDetails = (() => {
    function fetchDetails(deliveryId, fnCallback) {
        let xhttp = new XMLHttpRequest();

        xhttp.open("GET", `http://localhost:3000/api/deliverydetails?id=${deliveryId}`, true);
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                const data = JSON.parse(xhttp.responseText);
                fnCallback(null, data);
            } else if (xhttp.readyState === 4) {
                const error = JSON.parse(xhttp.responseText);
                fnCallback(error, null);
            }
        };
        xhttp.send();
    }

    return { fetchDetails };
})();

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const deliveryId = urlParams.get('id');

    if (!deliveryId) {
        document.getElementById("delivery-info").innerText = "No delivery ID provided.";
        return;
    }

    AjaxDeliveryDetails.fetchDetails(deliveryId, function (err, data) {
        console.log(data);
        if (err) {
            document.getElementById("delivery-info").innerText = "Error fetching delivery details.";
            return;
        }

        const deliveryInfoDiv = document.getElementById("delivery-info");
        const invoice = data.Invoice;

        deliveryInfoDiv.innerHTML = `
            <p><strong>Delivery ID:</strong> ${data.id}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Delivery Date:</strong> ${new Date(data.deliveryDate).toLocaleDateString()}</p>
            <p><strong>Invoice ID:</strong> ${invoice.id}</p>
            <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ${invoice.totalAmount}</p>
            <p><strong>Payment Method:</strong> ${invoice.paymentMethod}</p>
        `;

        const tbody = document.querySelector("#invoice-items-table tbody");
        tbody.innerHTML = "";

        invoice.InvoiceItems.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.cost}</td>
            `;
            tbody.appendChild(row);
        });
    });
});
