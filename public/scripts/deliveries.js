const AjaxDeliveries = (() => {
    function impl_getDeliveries(fnCallback) {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", "http://localhost:3000/alldeliveries", true);
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                const data = JSON.parse(xhttp.responseText);
                fnCallback(null, data);
            } else if (xhttp.readyState === 4) {
                let error;
                try {
                    error = JSON.parse(xhttp.responseText);
                } catch (e) {
                    error = { message: "Unknown error occurred" };
                }
                fnCallback(error, null);
            }
        };
        xhttp.send();
    }

    function impl_renderDeliveries() {
        impl_getDeliveries((err, data) => {
            const tbody = document.querySelector("#deliveryTable tbody");

            if (!tbody) return;

            if (err) {
                tbody.innerHTML = `<tr><td colspan="3">Failed to load deliveries</td></tr>`;
                console.error(err);
                return;
            }

            if (!data.length) {
                tbody.innerHTML = `<tr><td colspan="3">No deliveries found</td></tr>`;
                return;
            }

            data.forEach(delivery => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${delivery.id}</td>
                    <td>${new Date(delivery.deliveryDate).toLocaleDateString()}</td>
                    <td><button class="details-btn" data-id="${delivery.id}">Details</button></td>
                `;
                tbody.appendChild(row);
            });

            const detailButtons = document.querySelectorAll(".details-btn");
            detailButtons.forEach(button => {
                button.addEventListener("click", function () {
                    const id = this.getAttribute("data-id");
                    window.location.href = `/deliverydetails?id=${id}`;
                });
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        impl_renderDeliveries();
    });

    return {
        renderDeliveries: impl_renderDeliveries,
    };
})();
