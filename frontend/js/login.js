document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const message = document.getElementById("loginMessage");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("isAuthenticated", "true");
                window.location.href = "admin.html";
            } else {
                message.textContent = data.message || "فشل تسجيل الدخول.";
                message.style.color = "red";
            }
        } catch (err) {
            message.textContent = "حدث خطأ في الاتصال بالخادم.";
            message.style.color = "red";
        }
    });
});