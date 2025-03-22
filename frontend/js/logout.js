document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logoutButton");

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("isAuthenticated"); // إزالة بيانات تسجيل الدخول
        window.location.href = "login.html"; // إعادة التوجيه إلى صفحة تسجيل الدخول
    });
});