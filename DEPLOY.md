# GitHub Pages 部署指南

## 前置条件

1. ✅ 代码已推送到 GitHub 远程仓库
2. ✅ 仓库是公开的（GitHub Pages 免费版需要公开仓库）
3. ✅ 仓库已启用 GitHub Pages

## 部署步骤

### 方法一：使用 GitHub Actions（推荐，自动部署）

#### 1. 启用 GitHub Pages

1. 进入你的 GitHub 仓库页面
2. 点击 **Settings**（设置）
3. 在左侧菜单找到 **Pages**（页面）
4. 在 **Source**（源）部分：
   - 选择 **GitHub Actions** 作为部署源
5. 保存设置

#### 2. 推送代码触发部署

```bash
# 确保所有更改已提交
git add .
git commit -m "配置 GitHub Pages 部署"
git push origin main  # 或 master，取决于你的主分支名
```

#### 3. 查看部署状态

1. 在 GitHub 仓库页面，点击 **Actions** 标签
2. 查看部署工作流的状态
3. 部署完成后，访问：`https://你的用户名.github.io` 或 `https://你的用户名.github.io/仓库名`

### 方法二：手动部署（备选方案）

如果 GitHub Actions 不可用，可以使用以下方法：

#### 1. 安装 gh-pages

```bash
npm install --save-dev gh-pages
```

#### 2. 添加部署脚本到 package.json

```json
{
  "scripts": {
    "deploy": "npm run export && gh-pages -d out"
  }
}
```

#### 3. 执行部署

```bash
npm run deploy
```

## 重要配置说明

### basePath 配置

如果你的仓库名是 `username.github.io`（个人主页），`basePath` 应该为空字符串 `''`。

如果你的仓库名是其他名称（如 `meme-generator`），需要修改 `next.config.js`：

```javascript
basePath: '/meme-generator',
assetPrefix: '/meme-generator',
```

### 自定义域名（可选）

如果你想使用自定义域名：

1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容为你的域名，例如：`meme.example.com`
3. 在域名 DNS 设置中添加 CNAME 记录指向 `你的用户名.github.io`

## 常见问题

### 1. 页面显示 404

- 检查 `basePath` 配置是否正确
- 确保 `trailingSlash: true` 在 next.config.js 中
- 检查 GitHub Pages 设置中的源是否正确

### 2. 图片无法加载

- 确保 `images.unoptimized: true` 在 next.config.js 中
- 检查图片路径是否使用绝对路径（以 `/` 开头）

### 3. 样式丢失

- 确保 `assetPrefix` 与 `basePath` 一致
- 检查构建输出目录 `out` 是否包含所有静态资源

### 4. 路由不工作

- Next.js 静态导出不支持动态路由
- 确保所有路由都是静态的

## 验证部署

部署成功后，访问你的 GitHub Pages URL：
- 个人主页：`https://你的用户名.github.io`
- 项目页面：`https://你的用户名.github.io/仓库名`

## 更新部署

每次推送代码到主分支后，GitHub Actions 会自动重新部署。你也可以在 Actions 页面手动触发部署。

