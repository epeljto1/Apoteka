document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".cards-container");
  container.innerHTML = ""; // očisti primjere

  try {
    const response = await fetch("/todays-deliveries");
    const deliveries = await response.json();

    deliveries.forEach(delivery => {
      const card = document.createElement("div");
      card.classList.add("delivery-card");

      card.innerHTML = `
        <p><strong>Broj isporuke:</strong> #${delivery.id}</p>
        <p><strong>Datum:</strong> ${new Date(delivery.deliveryDate).toLocaleDateString()}</p>
        <p><strong>Dobavljač:</strong> ${delivery.supplierName}</p>
        <p><strong>Lijekovi:</strong> ${delivery.products.join(", ") || "Nema stavki"}</p>
      `;

      container.appendChild(card);
    });

    if (deliveries.length === 0) {
      container.innerHTML = "<p>Nema današnjih isporuka.</p>";
    }
  } catch (err) {
    console.error("Greška:", err);
    container.innerHTML = "<p>Greška prilikom dohvaćanja podataka.</p>";
  }
});

const AjaxUsers = (() => {
    function impl_Logout() {
        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", "http://localhost:3000/logout", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    window.location.href = "/login"; 
                } else {
                    alert("Logout failed.");
                    console.error(JSON.parse(xhttp.responseText));
                }
            }
        };
        xhttp.send();
    }

    return {
        logoutManager: impl_Logout,
    };
})();


document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("logoutBtn").addEventListener("click", () => {
        AjaxUsers.logoutManager();
    });
});


 document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".action-btn");
        
    buttons.forEach((btn, index) => {
        setTimeout(() => {
        btn.classList.add("show");
    }, index * 200); // svako dugme se prikazuje sa malim zakašnjenjem
    });
});