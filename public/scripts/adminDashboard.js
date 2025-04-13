const AjaxFetchUsers = (() => {
    function impl_getUsers(fnCallback) {
        let xhttp = new XMLHttpRequest();
    
        xhttp.open("GET", "http://localhost:3000/admin/users", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.onreadystatechange = function() {
            if(xhttp.readyState == 4 && xhttp.status == 200) {
                const data = JSON.parse(xhttp.responseText);
                fnCallback(null, data);
            } else if(xhttp.readyState == 4) {
                const error = JSON.parse(xhttp.responseText);
                fnCallback(error, null);
            }
        }
        xhttp.send();
    }

    return {
        getUsers: impl_getUsers,
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    AjaxFetchUsers.getUsers(function(err, users) {
        if (err) {
            console.error("Error fetching users:", err);
            alert("Failed to load users.");
        } else {
            const tableBody = document.querySelector("#usersTable tbody");
            tableBody.innerHTML = ""; 

            users.forEach(user => {
                const row = document.createElement("tr");
                
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    <td>${user.username}</td>
                    <td>${user.Role.userType}</td>
                `;

                tableBody.appendChild(row);
            });
        }
    });
});

