const API_BASE = "https://info-eye.onrender.com";

const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get("id");
const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const commentAuthor = document.getElementById("commentAuthor");
const commentText = document.getElementById("commentText");

function renderComments(comments) {
  commentsList.innerHTML = "";

  if (comments.length === 0) {
    commentsList.innerHTML = "<p>لا توجد تعليقات بعد.</p>";
    return;
  }

  comments.forEach(comment => {
    const commentElement = document.createElement("div");
    commentElement.classList.add("comment");
    commentElement.style.borderBottom = "1px solid #ccc";
    commentElement.style.marginBottom = "10px";
    commentElement.style.paddingBottom = "10px";

    commentElement.innerHTML = `
      <p><strong>${comment.author}</strong></p>
      <p>${comment.text}</p>
    `;

    commentsList.appendChild(commentElement);
  });
}

function fetchComments() {
  fetch(`${API_BASE}/articles/${articleId}/comments`)
    .then(res => res.json())
    .then(data => renderComments(data))
    .catch(() => {
      commentsList.innerHTML = "<p>❌ فشل في تحميل التعليقات.</p>";
    });
}

commentForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const newComment = {
    author: commentAuthor.value,
    text: commentText.value,
  };

  fetch(`${API_BASE}/articles/${articleId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newComment),
  })
    .then(res => res.json())
    .then(() => {
      commentAuthor.value = "";
      commentText.value = "";
      fetchComments();
    })
    .catch(() => {
      alert("❌ حدث خطأ أثناء إرسال التعليق.");
    });
});

// تحميل التعليقات عند بدء الصفحة
fetchComments();