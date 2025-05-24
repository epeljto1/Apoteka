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