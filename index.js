var fs = require('fs');

var removeTabs = text => text.replace(/[\t]+/g, ' ');

var isIrrelevantLine = line => [
  'Foto autor|',
  'Foto popis|',
  'MLADÁ FRONTA DNES',
  'O autorovi|',
  'Regionalni mutace|',
  'Tento komentář vyjadřuje stanovisko listu',
  'Tento komentář vyjadřujestanovisko listu',
  'Tyto komentáře vyjadřují stanovisko listu',
].some(item => line.indexOf(item) === 0);

var isArticleCreatedAt = line =>
  /^\d+\.\d+\.\d+/.test(line);

var allArticlesAsText = fs.readdirSync('export')
  .map(fileName => fs.readFileSync('export/' + fileName, 'utf8'))
  .map(removeTabs)
  .join('')
  .split('\n')
  .filter(line => !isIrrelevantLine(line.trim()))
  .join('\n');
// fs.writeFile('temp.txt', allArticlesAsText);

var articles = [];

var lines = allArticlesAsText.split('\n');
// console.log(lines[2602] === 'Přehled zpráv')
lines.forEach((line, index) => {
  if (!isArticleCreatedAt(line)) return;
  var title = lines[index - 1];
  var createdAt = line.split(' ')[0].trim();
  var articleLines = [];
  var articleIndex = index + 1;
  while (articleIndex < lines.length - 1) {
    articleIndex++;
    var articleLine = lines[articleIndex];
    if (isArticleCreatedAt(articleLine)) {
      articleLines.pop();
      break;
    }
    if (articleLine === 'Přehled zpráv') {
      break;
    }
    articleLines.push(articleLine)
  }
  articles.push({
    createdAt,
    title,
    text: articleLines.join('\n').replace(/\n+/g, '\n')
  });
});

fs.writeFile('articles.json', JSON.stringify(articles, null, 2));
