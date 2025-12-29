# 3D Emoji 图片说明

## 如何添加 3D Emoji 图片

### 1. 获取图片资源

推荐使用 Microsoft Fluent Emoji 的 3D 版本，您可以从以下渠道获取：

- **官方 GitHub 仓库**: https://github.com/microsoft/fluentui-emoji
- **Iconduck**: https://iconduck.com/sets/microsoft-fluentui-emoji-set/styles/3d
- **Iconscout**: https://iconscout.com/3d-icons/microsoft-fluent-emoji

### 2. 图片命名规则

请将下载的图片按照以下命名规则保存到本目录：

- `grinning_face.png` - 对应 😀
- `face_with_tears_of_joy.png` - 对应 😂
- `rolling_on_the_floor_laughing.png` - 对应 🤣
- `smiling_face_with_smiling_eyes.png` - 对应 😊
- `smiling_face_with_heart_eyes.png` - 对应 😍
- `smiling_face_with_hearts.png` - 对应 🥰
- `smiling_face_with_sunglasses.png` - 对应 😎
- `thinking_face.png` - 对应 🤔
- `face_with_open_mouth.png` - 对应 😮
- `face_screaming_in_fear.png` - 对应 😱
- `sleeping_face.png` - 对应 😴
- `drooling_face.png` - 对应 🤤
- `face_savoring_food.png` - 对应 😋
- `squinting_face_with_tongue.png` - 对应 😝
- `winking_face_with_tongue.png` - 对应 😜

### 3. 图片要求

- **格式**: PNG（推荐，支持透明背景）
- **尺寸**: 建议 512x512 或 1024x1024 像素
- **风格**: 3D 渲染，具有球体质感和光泽效果
- **背景**: 透明背景（PNG 格式）

### 4. 注意事项

- 如果图片文件不存在，页面会自动回退到显示系统 emoji 字符
- 图片加载失败时会自动使用 emoji 字符作为后备方案
- 所有图片会自动应用 3D 球体质感样式（光泽、阴影等）

### 5. 添加新表情

如果您想添加新的表情，需要：

1. 在 `lib/emoji-mapping.ts` 中添加新的映射关系
2. 将对应的图片文件放到本目录
3. 按照命名规则命名文件





