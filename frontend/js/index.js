document.addEventListener("DOMContentLoaded", function () {
    const articlesContainer = document.getElementById("articlesContainer");
    const searchInput = document.getElementById("searchInput");
  
    const loadMoreTrigger = document.createElement("div");
    loadMoreTrigger.id = "loadMoreTrigger";
    articlesContainer.after(loadMoreTrigger);
  
    let allArticles = [];
    let articlesPerPage = 5;
    let currentPage = 1;
  
    // ✅ جلب المقالات من السيرفر
    function fetchArticlesFromServer() {
      fetch("https://info-eye.onrender.com/articles")
        .then(res => res.json())
        .then(data => {
          allArticles = data;
          renderArticles(); // عرض أول مجموعة
        })
        .catch(() => {
          articlesContainer.innerHTML = "<p>❌ فشل في تحميل المقالات من الخادم.</p>";
        });
    }
  
    // ✅ عرض المقالات مع فلترة البحث
    function renderArticles(query = "") {
      articlesContainer.innerHTML = "";
  
      const filtered = allArticles.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase())
      );
  
      const start = 0;
      const end = currentPage * articlesPerPage;
      const toDisplay = filtered.slice(start, end);
  
      if (toDisplay.length === 0) {
        articlesContainer.innerHTML = "<p>❌ لا توجد مقالات مطابقة.</p>";
        return;
      }
  
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  
      toDisplay.forEach(article => {
        const articleElement = document.createElement("div");
        articleElement.classList.add("article");
  
        const isFav = favs.includes(article._id);
        articleElement.innerHTML = `
          <h3><a href="article.html?id=${article._id}">${article.title}</a></h3>
          <p><strong>التصنيف:</strong> ${article.category}</p>
          <p>${article.content.substring(0, 100)}...</p>
          <p>⭐ ${article.rating?.toFixed(1) || "0"} من 5 (${article.ratingCount || 0} تقييم)</p>
          <button class="favorite-btn" data-id="${article._id}">
            ${isFav ? "💔 إزالة من المفضلة" : "❤️ أضف إلى المفضلة"}
          </button>
        `;
  
        articleElement.querySelector(".favorite-btn").addEventListener("click", function () {
          toggleFavorite(article._id);
          renderArticles(searchInput.value); // لإعادة عرض الزر بشكل مناسب
        });
  
        articlesContainer.appendChild(articleElement);
      });
    }
  
    // ✅ تبديل المفضلة
    function toggleFavorite(id) {
      let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      if (favs.includes(id)) {
        favs = favs.filter(favId => favId !== id);
      } else {
        favs.push(id);
      }
      localStorage.setItem("favorites", JSON.stringify(favs));
    }
  
    // ✅ البحث
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      renderArticles(searchInput.value);
    });
  
    // ✅ التحميل التلقائي عند الوصول لنهاية الصفحة
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        currentPage++;
        renderArticles(searchInput.value);
      }
    }, { threshold: 1.0 });
  
    observer.observe(loadMoreTrigger);
  
    // 🟢 البداية
    fetchArticlesFromServer();
  });

  const API_BASE = "https://info-eye.onrender.com"; // استبدل هذا بالرابط الفعلي لمشروعك

fetch(`${API_BASE}/articles`)