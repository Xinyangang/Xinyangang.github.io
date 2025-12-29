# 如何上传表情图片

## 图片上传步骤

### 1. 准备图片文件

- **格式**: PNG（推荐，支持透明背景）
- **尺寸**: 建议 512x512 或 1024x1024 像素
- **背景**: 透明背景（PNG格式）
- **命名**: 可以使用任意名称，但建议使用有意义的名称

### 2. 上传图片

将图片文件直接复制或拖拽到以下目录：

```
public/images/emojis/
```

### 3. 在配置中添加图片

编辑 `lib/emoji-categories.ts` 文件，在对应的分类中添加图片路径：

```typescript
{
  name: 'Smileys',
  items: [
    { 
      id: 'smiley-1', 
      imagePath: '/images/emojis/your-image-name.png',  // 你的图片路径
      name: 'Your Emoji Name'  // 可选：表情名称
    },
    // ... 更多表情
  ],
},
```

**重要提示**：
- `imagePath` 必须以 `/images/emojis/` 开头（相对于 public 目录）
- `id` 必须是唯一的
- `name` 是可选的，用于鼠标悬停提示

### 4. 添加新分类

如果你想添加新的分类，在 `lib/emoji-categories.ts` 中的 `EMOJI_CATEGORIES` 数组中添加：

```typescript
export const EMOJI_CATEGORIES: EmojiCategory[] = [
  // ... 现有分类
  {
    name: 'YourCategoryName',  // 分类名称
    items: [
      // ... 表情列表
    ],
  },
];
```

### 5. 示例

假设你上传了一个名为 `happy-face.png` 的图片到 `public/images/emojis/` 目录：

1. 图片路径: `public/images/emojis/happy-face.png`
2. 在配置中使用: `imagePath: '/images/emojis/happy-face.png'`

```typescript
{
  id: 'happy-1',
  imagePath: '/images/emojis/happy-face.png',
  name: 'Happy Face',
}
```

### 6. 验证

保存文件后，刷新浏览器页面，你应该能看到：
- 新上传的图片显示在对应的分类中
- 点击图片可以添加到画布
- 鼠标悬停显示图片名称（如果设置了 name）

## 注意事项

- 图片路径区分大小写
- 确保图片文件确实存在于 `public/images/emojis/` 目录
- 如果图片加载失败，会在界面上显示 "?" 占位符
- 建议使用有意义的文件名，便于管理

## 批量上传

如果你想批量上传多个图片：

1. 将所有图片文件复制到 `public/images/emojis/` 目录
2. 在 `lib/emoji-categories.ts` 中批量添加配置项
3. 保存并刷新页面




