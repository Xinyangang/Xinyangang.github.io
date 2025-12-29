# Emoji 图片下载说明

## 下载 Emoji 图片

运行以下命令下载所有需要的 emoji 图片：

```bash
node scripts/download-emojis.js
```

这个脚本会：
1. 从 CDN 下载所有需要的 emoji 图片
2. 将图片保存到 `public/images/emojis/` 目录
3. 使用 emoji 的 Unicode code point 作为文件名（例如：`emoji_1F600.png`）

## 注意事项

- 如果某些图片下载失败，脚本会显示错误信息
- 图片文件名格式：`emoji_{codePoint}.png`（code point 是十六进制大写）
- 如果图片已存在，脚本会跳过下载

## 手动下载

如果自动下载失败，你可以：

1. 访问 [EmojiPedia](https://emojipedia.org/) 或类似的网站
2. 搜索对应的 emoji
3. 下载 3D 版本的 PNG 图片
4. 重命名为对应的文件名（使用 `getEmojiImageName()` 函数生成的名称）
5. 放入 `public/images/emojis/` 目录

## 图片格式要求

- 格式：PNG（支持透明背景）
- 推荐尺寸：512x512 或 1024x1024 像素
- 风格：3D 渲染，具有球体质感和光泽效果





