const AjaxUsers = (() => {
    function impl_getUsers(fnCallback) {
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", "http://localhost:3000/admin/users", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                const data = JSON.parse(xhttp.responseText);
                fnCallback(null, data);
            } else if (xhttp.readyState == 4) {
                const error = JSON.parse(xhttp.responseText);
                fnCallback(error, null);
            }
        };
        xhttp.send();
    }

    function impl_postUser(firstName, lastName, username, password, roleId, fnCallback) {
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", "http://localhost:3000/admin/users", true);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
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

    function impl_putUser(userId, firstName, lastName, username, roleId, fnCallback) {
        let xhttp = new XMLHttpRequest();
        xhttp.open("PUT", `http://localhost:3000/admin/users/${userId}`, true);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                const data = JSON.parse(xhttp.responseText);
                fnCallback(null, data);
            } else if (xhttp.readyState == 4) {
                const error = JSON.parse(xhttp.responseText);
                fnCallback(error, null);
            }
        };
        xhttp.send(`firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&username=${encodeURIComponent(username)}&roleId=${encodeURIComponent(roleId)}`);
    }

    function impl_deleteUser(userId, fnCallback) {
        let xhttp = new XMLHttpRequest();
        xhttp.open("DELETE", `http://localhost:3000/admin/users/${userId}`, true);
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 204) {
                fnCallback(null);
            } else if (xhttp.readyState == 4) {
                const error = JSON.parse(xhttp.responseText);
                fnCallback(error);
            }
        };
        xhttp.send();
    }

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
        getUsers: impl_getUsers,
        postUser: impl_postUser,
        putUser: impl_putUser,
        deleteUser: impl_deleteUser,
        logoutAdmin: impl_Logout,
    };
})();

function renderUsers(users) {
    const tableBody = document.querySelector("#usersTable tbody");
    tableBody.innerHTML = "";

    users.forEach(user => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.id}</td>
            <td><input type="text" value="${user.firstName}" data-field="firstName" /></td>
            <td><input type="text" value="${user.lastName}" data-field="lastName" /></td>
            <td><input type="text" value="${user.username}" data-field="username" /></td>
            <td>
                <select data-field="roleId">
                    <option value="1" ${user.Role.userType === "Admin" ? "selected" : ""}>Admin</option>
                    <option value="2" ${user.Role.userType === "Manager" ? "selected" : ""}>Manager</option>
                    <option value="3" ${user.Role.userType === "Pharmacist" ? "selected" : ""}>Pharmacist</option>
                </select>
            </td>
            <td>
                <button class="updateBtn" data-id="${user.id}">Update</button>
                <button class="deleteBtn" data-id="${user.id}">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);

        row.querySelector(".updateBtn").addEventListener("click", function () {
            const userId = this.dataset.id;
            const row = this.closest("tr");
            const firstName = row.querySelector('[data-field="firstName"]').value;
            const lastName = row.querySelector('[data-field="lastName"]').value;
            const username = row.querySelector('[data-field="username"]').value;
            const roleId = row.querySelector('[data-field="roleId"]').value;

            AjaxUsers.putUser(userId, firstName, lastName, username, roleId, function (err, updatedUser) {
                if (err) {
                    alert("Failed to update user.");
                    console.error(err);
                } else {
                    alert("User updated!");
                    refreshUserTable();
                }
            });
        });

        row.querySelector(".deleteBtn").addEventListener("click", function () {
            const userId = this.dataset.id;
            if (confirm("Are you sure you want to delete this user?")) {
                AjaxUsers.deleteUser(userId, function (err) {
                    if (err) {
                        alert("Failed to delete user.");
                        console.error(err);
                    } else {
                        alert("User deleted!");
                        refreshUserTable();
                    }
                });
            }
        });
    });
}

function refreshUserTable() {
    AjaxUsers.getUsers(function (err, users) {
        if (err) {
            console.error("Error refreshing users:", err);
            alert("Failed to refresh users.");
        } else {
            renderUsers(users);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    refreshUserTable();

    document.getElementById("toggleAddUserForm").addEventListener("click", () => {
        const form = document.getElementById("addUserForm");
        form.style.display = form.style.display === "none" ? "block" : "none";
    });

    document.getElementById("addUserForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const roleId = document.getElementById("roleId").value;

        AjaxUsers.postUser(firstName, lastName, username, password, roleId, function (err, newUser) {
            if (err) {
                alert("Failed to add user.");
                console.error(err);
            } else {
                alert("User added!");
                refreshUserTable();
                document.getElementById("addUserForm").reset();
            }
        });
    });

    /*document.getElementById("logoutBtn").addEventListener("click", () => {
        AjaxUsers.logoutAdmin();
    });v*/
});
