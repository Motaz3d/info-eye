document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = "https://info-eye.onrender.com";
  const favoritesContainer = document.getElementById("favoritesContainer");

  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");

  if (favs.length === 0) {
    favoritesContainer.innerHTML = "<p>❌ لا توجد مقالات محفوظة في المفضلة.</p>";
    return;
  }

  fetch(`${API_BASE}/articles`)
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(article => favs.includes(article._id));

      if (filtered.length === 0) {
        favoritesContainer.innerHTML = "<p>❌ لم يتم العثور على مقالات محفوظة.</p>";
        return;
      }

      filtered.forEach(article => {
        const articleElement = document.createElement("div");
        articleElement.classList.add("article");
        articleElement.innerHTML = `
          <h3><a href="article.html?id=${article._id}">${article.title}</a></h3>
          <p><strong>التصنيف:</strong> ${article.category}</p>
          <p>${article.content.substring(0, 100)}...</p>
          <button class="remove-fav" data-id="${article._id}">🗑️ إزالة من المفضلة</button>
        `;

        articleElement.querySelector(".remove-fav").addEventListener("click", function () {
          let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
          favs = favs.filter(id => id !== article._id);
          localStorage.setItem("favorites", JSON.stringify(favs));
          location.reload();
        });

        favoritesContainer.appendChild(articleElement);
      });
    })
    .catch(() => {
      favoritesContainer.innerHTML = "<p>❌ فشل في تحميل المقالات.</p>";
    });
});