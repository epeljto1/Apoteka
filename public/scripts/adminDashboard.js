const AjaxUsers = (() => {
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

    function impl_postUser(firstName, lastName, username, password, roleId, fnCallback) {
        let xhttp = new XMLHttpRequest();
        
        xhttp.open("POST", "http://localhost:3000/admin/users", true);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 201) {
                const data = JSON.parse(xhttp.responseText);
                fnCallback(null, data);
            } else if (xhttp.readyState == 4) {
                const error = JSON.parse(xhttp.responseText);
                fnCallback(error, null);
            }
        };
        xhttp.send(`firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&roleId=${encodeURIComponent(roleId)}`);
    }

    return {
        getUsers: impl_getUsers,
        postUser: impl_postUser,
    };
})();


document.addEventListener("DOMContentLoaded", () => {
    AjaxUsers.getUsers(function(err, users) {
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

    document.getElementById("toggleAddUserForm").addEventListener("click", () => {
        const form = document.getElementById("addUserForm");
        form.style.display = form.style.display === "none" ? "block" : "none";
    });
    
    document.getElementById("addUserForm").addEventListener("submit", function(e) {
        e.preventDefault();
    
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const roleId = document.getElementById("roleId").value;
    
        AjaxUsers.postUser(firstName, lastName, username, password, roleId, function(err, newUser) {
            if (err) {
                alert("Failed to add user.");
                console.error(err);
            } else {
                alert("User added!");
                location.reload(); 
            }
        });
    });
    
});

