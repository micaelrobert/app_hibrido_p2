const fs = require('fs');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

async function gerarPDF() {
  try {
    console.log('📄 Lendo arquivo Markdown...');
    const markdownContent = fs.readFileSync('GUIA_CONFIGURACAO_MONGODB.md', 'utf-8');
    
    console.log('🔄 Convertendo Markdown para HTML...');
    const htmlBody = marked.parse(markdownContent);
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Guia de Configuração MongoDB</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      font-size: 11pt;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      margin-top: 20px;
      page-break-after: avoid;
    }
    h2 {
      color: #34495e;
      margin-top: 25px;
      border-bottom: 2px solid #95a5a6;
      padding-bottom: 5px;
      page-break-after: avoid;
    }
    h3 {
      color: #7f8c8d;
      margin-top: 15px;
      page-break-after: avoid;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: 0.9em;
      color: #c7254e;
    }
    pre {
      background-color: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      page-break-inside: avoid;
      margin: 10px 0;
    }
    pre code {
      background-color: transparent;
      color: #f8f8f2;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #3498db;
      padding-left: 15px;
      color: #7f8c8d;
      font-style: italic;
      margin: 15px 0;
    }
    ul, ol {
      padding-left: 30px;
      margin: 10px 0;
    }
    li {
      margin-bottom: 5px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #3498db;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    a {
      color: #3498db;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    hr {
      border: none;
      border-top: 2px solid #ecf0f1;
      margin: 25px 0;
    }
    p {
      margin: 10px 0;
      text-align: justify;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
${htmlBody}
</body>
</html>
`;
    
    console.log('🌐 Iniciando navegador...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('📝 Gerando PDF...');
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: 'GUIA_CONFIGURACAO_MONGODB.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    console.log('✅ PDF gerado com sucesso!');
    console.log('📁 Arquivo: GUIA_CONFIGURACAO_MONGODB.pdf');
    console.log('📍 Localização:', process.cwd());
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

gerarPDF();
