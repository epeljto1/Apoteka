document.addEventListener("DOMContentLoaded", () => {
    const supplierSelect = document.getElementById("supplierSelect");
    const itemsContainer = document.getElementById("itemsContainer");
    const addItemBtn = document.getElementById("addItemBtn");
    const contractForm = document.getElementById("contractForm");

    // 1. Učitaj dobavljače sa servera
    function loadSuppliers() {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", "http://localhost:3000/api/suppliers", true);
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    const data = JSON.parse(xhttp.responseText);
                    data.suppliers.forEach(supplier => {
                        const option = document.createElement("option");
                        option.value = supplier.id;
                        option.textContent = supplier.name;
                        supplierSelect.appendChild(option);
                    });
                } else {
                    console.error("Greška pri učitavanju dobavljača.");
                }
            }
        };
        xhttp.send();
    }

    // 2. Dodaj novu stavku fakture
    addItemBtn.addEventListener("click", () => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "item";

        itemDiv.innerHTML = `
            <label>Product Name:
                <input type="text" name="productName" required>
            </label>

            <label>Quantity:
                <input type="number" name="quantity" min="1" required>
            </label>

            <label>Cost:
                <input type="number" name="cost" min="0" step="0.01" required>
            </label>

            <button type="button" class="removeItemBtn">Remove</button>
            <br><br>
        `;

        itemsContainer.appendChild(itemDiv);

        // 3. Ukloni stavku
        itemDiv.querySelector(".removeItemBtn").addEventListener("click", () => {
            itemsContainer.removeChild(itemDiv);
        });
    });

    // 4. Slanje forme
    contractForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(contractForm);
        const items = [];

        document.querySelectorAll(".item").forEach(item => {
            items.push({
                productName: item.querySelector('[name="productName"]').value,
                quantity: parseInt(item.querySelector('[name="quantity"]').value),
                cost: parseFloat(item.querySelector('[name="cost"]').value)
            });
        });

        const data = {
            subject: formData.get("subject"),
            conclusionDate: formData.get("conclusionDate"),
            expirationDate: formData.get("expirationDate"),
            conditions: formData.get("conditions"),
            status: formData.get("status"),
            supplierId: formData.get("supplierId"),
            deliveryDate: formData.get("deliveryDate"),
            deliveryStatus: formData.get("deliveryStatus"),
            items
        };

        // 5. Pošalji podatke serveru
        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", "http://localhost:3000/api/contracts", true);
        xhttp.setRequestHeader("Content-Type", "application/json");

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 201) {
                    alert("Contract created successfully!");
                    window.location.href = "/contracts";
                } else {
                    console.error(xhttp.responseText);
                    alert("Error creating contract.");
                }
            }
        };

        xhttp.send(JSON.stringify(data));
    });

    // Inicijalno učitaj dobavljače
    loadSuppliers();
});
