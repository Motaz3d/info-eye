document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    const titleElement = document.getElementById("category-title");
    const articlesContainer = document.getElementById("category-articles");
    const searchInput = document.getElementById("searchInput");
  
    let allArticles = [];
  
    if (!category) {
      titleElement.textContent = "❌ لم يتم تحديد تصنيف.";
      return;
    }
  
    titleElement.textContent = `🗂️ التصنيف: ${category}`;
  
    function renderArticles(query = "") {
      const filtered = allArticles.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase())
      );
  
      articlesContainer.innerHTML = "";
  
      if (filtered.length === 0) {
        articlesContainer.innerHTML = "<p>لا توجد مقالات مطابقة للبحث.</p>";
        return;
      }
  
      filtered.forEach(article => {
        const articleElement = document.createElement("div");
        articleElement.classList.add("article");
  
        const isFav = JSON.parse(localStorage.getItem("favorites") || "[]").includes(article._id);
        articleElement.innerHTML = `
          <h3><a href="article.html?id=${article._id}">${article.title}</a></h3>
          <p>${article.content.substring(0, 100)}...</p>
          <button class="favorite-btn" data-id="${article._id}">
            ${isFav ? "💔 إزالة من المفضلة" : "❤️ أضف إلى المفضلة"}
          </button>
        `;
  
        // زر المفضلة
        articleElement.querySelector(".favorite-btn").addEventListener("click", function () {
          toggleFavorite(article._id);
          renderArticles(searchInput?.value || "");
        });
  
        articlesContainer.appendChild(articleElement);
      });
    }
  
    function toggleFavorite(id) {
      let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      if (favs.includes(id)) {
        favs = favs.filter(favId => favId !== id);
      } else {
        favs.push(id);
      }
      localStorage.setItem("favorites", JSON.stringify(favs));
    }
  
    fetch("http://localhost:3000/articles")
      .then(res => res.json())
      .then(data => {
        allArticles = data.filter(article => article.category === category);
        renderArticles();
      })
      .catch(() => {
        articlesContainer.innerHTML = "<p>❌ فشل في تحميل المقالات.</p>";
      });
  
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        renderArticles(searchInput.value);
      });
    }
  });