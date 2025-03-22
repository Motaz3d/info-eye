const mongoose = require("mongoose");
require("dotenv").config();

const stopWords = [
  "في", "من", "على", "عن", "إلى", "التي", "الذي", "هذا", "هذه", "ذلك", "كانت", "كان",
  "مع", "أن", "إن", "ما", "لا", "لم", "لن", "هو", "هي", "هم", "ثم", "قد", "كل", "أي", "أو",
  "إذا", "حتى", "بين"
];

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => {
    console.error("❌ Connection error:", err.message);
    process.exit(1);
  });

// Models
const Article = mongoose.model("Article", new mongoose.Schema({
  title: String,
  category: String,
  content: String,
  author: String,
  createdAt: { type: Date, default: Date.now }
}));

const Suggestion = mongoose.model("Suggestion", new mongoose.Schema({
  keyword: String,
  suggestion: String,
  createdAt: { type: Date, default: Date.now }
}));

async function analyzeAndSave() {
  try {
    const articles = await Article.find({});
    const wordMap = {};

    articles.forEach(article => {
      const words = article.content
        .replace(/[.,!?؛،():\\-]/g, '')
        .split(/\s+/)
        .map(w => w.toLowerCase())
        .filter(w => !stopWords.includes(w) && w.length > 2);

      words.forEach(word => {
        wordMap[word] = (wordMap[word] || 0) + 1;
      });
    });

    const sorted = Object.entries(wordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    await Suggestion.deleteMany({}); // clear old suggestions

    const suggestions = sorted.map(([word]) => ({
      keyword: word,
      suggestion: `مستقبل ${word}`
    }));

    await Suggestion.insertMany(suggestions);
    console.log("✅ تم حفظ الاقتراحات في قاعدة البيانات.");

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ تحليل الكلمات أو الحفظ فشل:", err.message);
    mongoose.disconnect();
  }
}

analyzeAndSave();