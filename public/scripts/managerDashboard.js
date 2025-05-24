document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".cards-container");
  container.innerHTML = ""; // očisti primjere

  try {
    const response = await fetch("/todays-deliveries");
    console.log(response);
    const deliveries = await response.json();
    
    deliveries.forEach(delivery => {
      const card = document.createElement("div");
      card.classList.add("delivery-card");

      card.innerHTML = `
        <p><strong>Delivery number:</strong> #${delivery.id}</p>
        <p><strong>Date:</strong> ${new Date(delivery.deliveryDate).toLocaleDateString()}</p>
        <p><strong>Supplier:</strong> ${delivery.supplierName}</p>
        <p><strong>Products:</strong> ${delivery.products.join(", ") || "No items"}</p>
      `;

      container.appendChild(card);
    });

    if (deliveries.length === 0) {
      container.innerHTML = "<p>No deliveries for today.</p>";
    }
  } catch (err) {
    console.error("Greška:", err);
    container.innerHTML = "<p>Error fetching data.</p>";
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

/*

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("logoutBtn").addEventListener("click", () => {
        AjaxUsers.logoutManager();
    });
});
*/


 document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".action-btn");
        
    buttons.forEach((btn, index) => {
        setTimeout(() => {
        btn.classList.add("show");
    }, index * 200); // svako dugme se prikazuje sa malim zakašnjenjem
    });
});


