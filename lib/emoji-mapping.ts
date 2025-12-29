// Emoji 到图片文件名的映射
// 这些文件名对应 /public/images/emojis/ 目录下的图片文件
// 或者可以使用 CDN 链接

export interface EmojiImageMap {
  emoji: string;
  imageName: string; // 图片文件名（不含路径）
  cdnUrl?: string; // 可选的 CDN 链接
}

// Emoji 到图片的映射表
// 如果使用本地图片，请确保图片文件存在于 /public/images/emojis/ 目录
// 文件名格式：{imageName}.png
export const EMOJI_IMAGE_MAP: Record<string, EmojiImageMap> = {
  '😀': {
    emoji: '😀',
    imageName: 'grinning_face',
    // 可选：使用 CDN（需要替换为实际的 CDN 链接）
    // cdnUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Grinning%20face/3D/grinning_face_3d.png'
  },
  '😂': {
    emoji: '😂',
    imageName: 'face_with_tears_of_joy',
  },
  '🤣': {
    emoji: '🤣',
    imageName: 'rolling_on_the_floor_laughing',
  },
  '😊': {
    emoji: '😊',
    imageName: 'smiling_face_with_smiling_eyes',
  },
  '😍': {
    emoji: '😍',
    imageName: 'smiling_face_with_heart_eyes',
  },
  '🥰': {
    emoji: '🥰',
    imageName: 'smiling_face_with_hearts',
  },
  '😎': {
    emoji: '😎',
    imageName: 'smiling_face_with_sunglasses',
  },
  '🤔': {
    emoji: '🤔',
    imageName: 'thinking_face',
  },
  '😮': {
    emoji: '😮',
    imageName: 'face_with_open_mouth',
  },
  '😱': {
    emoji: '😱',
    imageName: 'face_screaming_in_fear',
  },
  '😴': {
    emoji: '😴',
    imageName: 'sleeping_face',
  },
  '🤤': {
    emoji: '🤤',
    imageName: 'drooling_face',
  },
  '😋': {
    emoji: '😋',
    imageName: 'face_savoring_food',
  },
  '😝': {
    emoji: '😝',
    imageName: 'squinting_face_with_tongue',
  },
  '😜': {
    emoji: '😜',
    imageName: 'winking_face_with_tongue',
  },
};

// 获取 emoji 的图片路径
export function getEmojiImagePath(emoji: string, useLocal: boolean = true): string {
  const mapping = EMOJI_IMAGE_MAP[emoji];
  if (!mapping) {
    // 如果没有映射，返回默认路径
    return '/images/emojis/default.png';
  }

  if (useLocal) {
    return `/images/emojis/${mapping.imageName}.png`;
  }

  // 如果使用 CDN 且提供了 URL
  if (mapping.cdnUrl) {
    return mapping.cdnUrl;
  }

  // 回退到本地路径
  return `/images/emojis/${mapping.imageName}.png`;
}

// 检查是否为有效的 emoji 映射
export function hasEmojiMapping(emoji: string): boolean {
  return emoji in EMOJI_IMAGE_MAP;
}






