const API_BASE = "https://info-eye.onrender.com";
document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("darkModeToggle");
    const body = document.body;

    // التحقق من الإعداد المخزن مسبقًا
    if (localStorage.getItem("dark-mode") === "enabled") {
        body.classList.add("dark-mode");
    }

    // عند الضغط على زر التبديل
    toggleButton.addEventListener("click", function () {
        body.classList.toggle("dark-mode");

        // تخزين الإعداد الجديد
        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("dark-mode", "enabled");
        } else {
            localStorage.setItem("dark-mode", "disabled");
        }
    });
});