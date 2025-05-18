document.addEventListener("DOMContentLoaded", () => {
    const pathParts = window.location.pathname.split("/");
    const contractId = pathParts[pathParts.length - 1];

    if (!contractId || isNaN(contractId)) {
        alert("Contract ID is missing or invalid in the URL.");
        window.location.href = "/contracts";
    }

    const supplierSelect = document.getElementById("supplierSelect");
    const itemsContainer = document.getElementById("itemsContainer");
    const addItemBtn = document.getElementById("addItemBtn");
    const contractForm = document.getElementById("contractForm");
    const invoiceItemsContainer = document.getElementById("invoiceItemsContainer");

    function loadSuppliers(selectedId) {
        fetch("http://localhost:3000/api/suppliers")
            .then(res => res.json())
            .then(data => {
                data.suppliers.forEach(supplier => {
                    const option = document.createElement("option");
                    option.value = supplier.id;
                    option.textContent = supplier.name;
                    if (supplier.id === selectedId) option.selected = true;
                    supplierSelect.appendChild(option);
                });
            })
            .catch(err => {
                alert("Failed to load suppliers.");
                console.error(err);
            });
    }

    function addItem(item = {}) {
        const itemDiv = document.createElement("div");
        itemDiv.className = "item";
        itemDiv.innerHTML = `
            <label>Product Name:
            </label>
                <input type="text" name="productName" value="${item.productName || ''}" required>
            <label>Quantity:
            </label>
                <input type="number" name="quantity" value="${item.quantity || 1}" min="1" required>
            <label>Cost:
            </label>
                <input type="number" name="cost" value="${item.cost || 0}" min="0" step="0.01" required>
            <button type="button" class="removeItemBtn">Remove</button><br><br>
        `;
        itemDiv.querySelector(".removeItemBtn").addEventListener("click", () => {
            itemsContainer.removeChild(itemDiv);
        });
        itemsContainer.appendChild(itemDiv);
    }

    function displayInvoiceItems(invoices = []) {
        invoiceItemsContainer.innerHTML = "";

        invoices.forEach(invoice => {
            const div = document.createElement("div");
            div.className = "invoice-item";
            div.innerHTML = `
                <strong>Invoice #${invoice.id}</strong><br>
                <strong>Total:</strong> ${invoice.totalAmount}<br>
                <strong>Date:</strong> ${invoice.date?.split("T")[0]}<br>
                <strong>Items:</strong><br>
                <ul>
                    ${invoice.items.map(item => `
                        <li>${item.productName} – ${item.quantity} × ${item.cost.toFixed(2)}</li>
                    `).join("")}
                </ul>
            `;
            invoiceItemsContainer.appendChild(div);
        });
    }

    function loadContract() {
        fetch(`http://localhost:3000/api/contracts/${contractId}`)
            .then(res => res.json())
            .then(data => {
                const c = data.contract;

                contractForm.subject.value = c.subject;
                contractForm.conclusionDate.value = c.conclusionDate.split("T")[0];
                contractForm.expirationDate.value = c.expirationDate.split("T")[0];
                contractForm.conditions.value = c.conditions;
                contractForm.status.value = c.status;
                contractForm.purpose.value = c.purpose || "";

                loadSuppliers(c.supplierId);
                (c.items || []).forEach(item => addItem(item));

                if (c.Deliveries && c.Deliveries.length > 0) {
                    const delivery = c.Deliveries[0];

                    if (delivery.deliveryDate) {
                        contractForm.deliveryDate.value = delivery.deliveryDate.split("T")[0];
                    }

                    if (delivery.status) {
                        contractForm.deliveryStatus.value = delivery.status;
                    }

                    if (delivery.Invoice && delivery.Invoice.InvoiceItems) {
                        displayInvoiceItems([{
                            id: delivery.Invoice.id,
                            totalAmount: delivery.Invoice.totalAmount,
                            date: delivery.Invoice.issueDate,
                            items: delivery.Invoice.InvoiceItems
                        }]);
                    }
                }
            })
            .catch(err => {
                alert("Error loading contract.");
                console.error(err);
            });
    }

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
            purpose: formData.get("purpose"),
            conclusionDate: formData.get("conclusionDate"),
            expirationDate: formData.get("expirationDate"),
            conditions: formData.get("conditions"),
            status: formData.get("status"),
            supplierId: formData.get("supplierId"),
            deliveryDate: formData.get("deliveryDate"),
            deliveryStatus: formData.get("deliveryStatus"),
            items
        };

        fetch(`http://localhost:3000/api/contracts/${contractId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        .then(res => {
            if (res.ok) {
                alert("Contract updated successfully!");
                window.location.href = "/contracts";
            } else {
                return res.text().then(text => { throw new Error(text); });
            }
        })
        .catch(err => {
            alert("Error updating contract.");
            console.error(err);
        });
    });

    addItemBtn.addEventListener("click", () => addItem());

    loadContract();
});
