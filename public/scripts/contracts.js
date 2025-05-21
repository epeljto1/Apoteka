const AjaxContracts = (() => {
    function impl_getContracts(fnCallback) {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", "http://localhost:3000/api/contracts", true);
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

    function impl_renderContracts(filter = "") {
        impl_getContracts((err, data) => {
            const tbody = document.querySelector("#contractsTable tbody");
            if (!tbody) return;

            if (err) {
                tbody.innerHTML = `<tr><td colspan="7">Failed to load contracts</td></tr>`;
                console.error(err);
                return;
            }

            if (!data.length) {
                tbody.innerHTML = `<tr><td colspan="7">No contracts found</td></tr>`;
                return;
            }

            // Filtriraj po supplier name, subject, status
            const filteredData = data.filter(contract => {
                const searchText = filter.toLowerCase();
                return (
                    contract.Supplier?.name.toLowerCase().includes(searchText) ||
                    contract.subject.toLowerCase().includes(searchText) ||
                    contract.status.toLowerCase().includes(searchText)
                );
            });

            tbody.innerHTML = "";

            if (!filteredData.length) {
                tbody.innerHTML = `<tr><td colspan="7">No contracts match your search</td></tr>`;
                return;
            }

            filteredData.forEach(contract => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${contract.id}</td>
                    <td>${contract.subject}</td>
                    <td>${new Date(contract.conclusionDate).toLocaleDateString()}</td>
                    <td>${new Date(contract.expirationDate).toLocaleDateString()}</td>
                    <td>${contract.status}</td>
                    <td>${contract.Supplier?.name || 'N/A'}</td>
                    <td><button class="download-pdf-btn" data-id="${contract.id}">Send via e-mail</button> <br>
                    <button class="update-contract-btn" data-id="${contract.id}">Update contract</button></td>
                `;
                tbody.appendChild(row);
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        const searchInput = document.getElementById("searchInput");

        // Render contracts on page load
        impl_renderContracts();

        if (searchInput) {
            searchInput.addEventListener("input", () => {
                const value = searchInput.value;
                impl_renderContracts(value);
            });
        }

        // Event listener for the 'Download PDF' button
        document.querySelector("#contractsTable").addEventListener("click", (e) => {
            if (e.target && e.target.classList.contains("download-pdf-btn")) {
                const contractId = e.target.getAttribute("data-id");

                // Trigger PDF download
                window.location.href = `http://localhost:3000/api/contracts/${contractId}/pdf`;
            }
        });

        document.querySelector("#contractsTable").addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("update-contract-btn")) {
        const contractId = e.target.getAttribute("data-id");
        window.location.href = `/contracts/update/${contractId}`;
    }
});


        document.getElementById("createContractBtn").addEventListener("click", () => {
            window.location.href = "/contracts/create";
        });
        
    });

    return {
        renderContracts: impl_renderContracts,
    };
})();
