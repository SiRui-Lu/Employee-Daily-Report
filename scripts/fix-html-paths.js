import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log('Fixing HTML paths in:', indexPath);

try {
  let htmlContent = fs.readFileSync(indexPath, 'utf8');
  
  // 将绝对路径 /assets/ 替换为相对路径 ./assets/
  // 使用更精确的正则表达式，只匹配引号内的路径
  htmlContent = htmlContent.replace(/src="(\/assets\/[^"]+)"/g, 'src="./$1"');
  htmlContent = htmlContent.replace(/href="(\/assets\/[^"]+)"/g, 'href="./$1"');
  // 移除开头的 ./ 如果路径已经是 /assets/
  htmlContent = htmlContent.replace(/src="\.\/\/assets\//g, 'src="./assets/');
  htmlContent = htmlContent.replace(/href="\.\/\/assets\//g, 'href="./assets/');
  
  fs.writeFileSync(indexPath, htmlContent, 'utf8');
  console.log('✓ Fixed HTML paths successfully');
} catch (err) {
  console.error('✗ Failed to fix HTML paths:', err);
  process.exit(1);
}
