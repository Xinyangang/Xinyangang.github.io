const https = require('https');
const fs = require('fs');
const path = require('path');

// 需要下载的emoji列表
const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵',
  '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️'
];

// 使用 jsDelivr CDN（支持中国大陆镜像，代理 twemoji）
// twemoji 是 Twitter 开源的 emoji 图片库，质量高且稳定
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72';

// 根据emoji字符生成文件名（使用code point）
function getImageName(emoji) {
  // 获取emoji的code point
  const codePoint = emoji.codePointAt(0);
  return `emoji_${codePoint.toString(16).toUpperCase()}.png`;
}

// 生成CDN URL（twemoji使用小写hex格式）
function getCdnUrl(emoji) {
  const codePoint = emoji.codePointAt(0);
  // twemoji 使用小写hex格式，例如 1f600.png
  return `${CDN_BASE}/${codePoint.toString(16).toLowerCase()}.png`;
}

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'emojis');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 下载文件的函数
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    const protocol = url.startsWith('https') ? https : http;
    
    // 忽略SSL证书验证（仅用于开发环境）
    const options = url.startsWith('https') ? { rejectUnauthorized: false } : {};
    
    protocol.get(url, options, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 处理重定向
        return downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      reject(err);
    });
  });
}

// 主函数
async function main() {
  console.log('开始下载emoji图片...\n');
  console.log(`目标目录: ${OUTPUT_DIR}\n`);
  
  let successCount = 0;
  let failCount = 0;
  const failed = [];
  
  for (const emoji of EMOJI_LIST) {
    const imageName = getImageName(emoji);
    const outputPath = path.join(OUTPUT_DIR, imageName);
    
    // 如果文件已存在，跳过
    if (fs.existsSync(outputPath)) {
      console.log(`跳过（已存在）: ${emoji} -> ${imageName}`);
      successCount++;
      continue;
    }
    
    const url = getCdnUrl(emoji);
    
    try {
      console.log(`下载中: ${emoji} -> ${imageName}`);
      await downloadFile(url, outputPath);
      successCount++;
      console.log(`✓ 成功\n`);
      
      // 添加延迟，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      failCount++;
      failed.push({ emoji, imageName, error: error.message });
      console.error(`✗ 失败: ${error.message}\n`);
    }
  }
  
  console.log(`\n下载完成! 成功: ${successCount}, 失败: ${failCount}`);
  
  if (failed.length > 0) {
    console.log('\n失败的emoji:');
    failed.forEach(({ emoji, imageName, error }) => {
      console.log(`  ${emoji} (${imageName}): ${error}`);
    });
    console.log('\n提示: 某些emoji可能需要手动下载');
  }
  
  console.log(`\n图片保存在: ${OUTPUT_DIR}`);
}

main().catch(console.error);
