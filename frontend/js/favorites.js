// favorites.js

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("favoritesContainer");
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");

  if (favs.length === 0) {
    container.innerHTML = "<p>❌ لا توجد مقالات مفضلة.</p>";
    return;
  }

  fetch("http://localhost:3000/articles")
    .then(res => res.json())
    .then(data => {
      const favArticles = data.filter(article => favs.includes(article._id));

      if (favArticles.length === 0) {
        container.innerHTML = "<p>❌ لم يتم العثور على مقالات مطابقة في قاعدة البيانات.</p>";
        return;
      }

      favArticles.forEach(article => {
        const articleElement = document.createElement("div");
        articleElement.classList.add("article");

        articleElement.innerHTML = `
          <h3><a href="article.html?id=${article._id}">${article.title}</a></h3>
          <p><strong>التصنيف:</strong> ${article.category}</p>
          <p>${article.content.substring(0, 100)}...</p>
          <button class="remove-fav" data-id="${article._id}">🗑️ إزالة من المفضلة</button>
        `;

        articleElement.querySelector(".remove-fav").addEventListener("click", function () {
          removeFromFavorites(article._id);
        });

        container.appendChild(articleElement);
      });
    })
    .catch(() => {
      container.innerHTML = "<p>❌ فشل في تحميل المقالات.</p>";
    });

  function removeFromFavorites(id) {
    let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    favs = favs.filter(favId => favId !== id);
    localStorage.setItem("favorites", JSON.stringify(favs));
    location.reload(); // إعادة تحميل الصفحة لتحديث القائمة
  }
});