function isAuthenticated() {
    return localStorage.getItem("token") !== null;
}

// Get user role from localStorage
function getUserRole() {
    return localStorage.getItem("role");
}

function protectPage(requiredRole) {
    if (!isAuthenticated()) {
        window.location.href = "unauthorized.html";
        return;
    }

    const userRole = getUserRole();
    if (userRole !== requiredRole) {
        window.location.href = "unauthorized.html"; 
    }
}
