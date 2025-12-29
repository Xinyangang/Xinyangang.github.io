// Emoji 工具函数
// 将emoji字符转换为图片路径

/**
 * 根据emoji字符获取图片文件名
 * 使用emoji的code point作为文件名
 */
export function getEmojiImageName(emoji: string): string {
  const codePoint = emoji.codePointAt(0);
  if (!codePoint) return 'default.png';
  return `emoji_${codePoint.toString(16).toUpperCase()}.png`;
}

/**
 * 获取emoji的图片路径
 */
export function getEmojiImagePath(emoji: string): string {
  const imageName = getEmojiImageName(emoji);
  return `/images/emojis/${imageName}`;
}

/**
 * 检查emoji是否有效（简化版本）
 */
export function isValidEmoji(emoji: string): boolean {
  return emoji.length > 0;
}

