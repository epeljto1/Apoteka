const AjaxLogin = (() => {
    function impl_postLogin(username, password,fnCallback) {
        let xhttp = new XMLHttpRequest();
    
        xhttp.open("POST","http://localhost:3000/login",true);
        xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function()
        {
            if(xhttp.readyState==4 && xhttp.status==200)
            {
                const data = JSON.parse(xhttp.responseText);
                fnCallback(null,data);
            }
            else if(xhttp.readyState==4){
                const error = JSON.parse(xhttp.responseText);
                fnCallback(error,null);
            }
        }
        xhttp.send("username="+encodeURIComponent(username)+"&password="+encodeURIComponent(password));
    }
    return {postLogin : impl_postLogin,};
})();

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const errorDiv = document.getElementById("error-message");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        AjaxLogin.postLogin(username, password, function (err, data) {
            if (err) {
                errorDiv.textContent = err.message || "Login failed.";
            } else {
                errorDiv.textContent = "";
                console.log(data);
                if(data.user.roleId == 1)
                window.location.href = "/dashboard"; 
                else if(data.user.roleId == 2)
                    window.location.href = "/managerdash";
                else if(data.user.roleId == 3)
                window.location.href = "/products"; 
            }
        });
    });
});