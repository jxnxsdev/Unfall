import Koa from 'koa';
import path from 'path';
import serve from 'koa-static';

const app = new Koa();
const port = 3000; // Wählen Sie den gewünschten Port aus

// Statische Dateien im "public" Verzeichnis bereitstellen (zum Beispiel CSS, Bilder usw.)
app.use(serve(path.join(__dirname, '..', 'html')));

// Pfad "/" behandeln und die HTML-Datei senden
app.use(async (ctx) => {
  ctx.type = 'html';
  ctx.body = await (require('fs')).createReadStream(path.join(__dirname, '..', 'html', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
