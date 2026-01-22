# 迁移指南

从原项目结构迁移到 Monorepo 结构的详细步骤。

## 迁移概述

✅ **已完成步骤：**
1. 创建独立的 `next-drawio-core` 项目
2. 配置根目录 Monorepo 工作空间
3. 迁移核心源代码到新项目
4. 更新依赖配置使用 workspace
5. 创建构建和开发配置

## 后续步骤

### 1. 安装依赖并构建

```bash
# 在根目录执行
cd /Users/yanfei/Downloads/next-drawio

# 安装所有依赖
pnpm install

# 构建核心库
pnpm build:core

# 验证构建结果
ls -la next-drawio-core/dist/
```

### 2. 清理旧文件（可选）

```bash
# 确认新结构工作正常后，删除旧的 packages 目录
rm -rf next-drawio-react/packages

# 更新 React 项目的 pnpm-workspace.yaml（如果需要）
# 这个文件现在可能不再需要，因为根目录已经统一管理
```

### 3. 更新 CI/CD 配置

如果项目有 CI/CD 配置，需要更新：
- GitHub Actions
- GitLab CI
- 其他自动化构建配置

### 4. 更新开发文档

- 更新 README.md 中的项目结构说明
- 更新开发指南和贡献指南
- 更新 API 文档链接

### 5. 验证功能

```bash
# 测试 React 项目
cd next-drawio-react
pnpm dev
# 访问 http://localhost:3000 验证功能

# 测试 Vue 项目  
cd next-drawio-vue
pnpm dev
# 访问 http://localhost:5173 验证功能
```

## 验证清单

- [ ] 核心库构建成功
- [ ] React 项目可以正常启动
- [ ] Vue 项目可以正常启动
- [ ] 所有 `@drawio/core` 导入正常工作
- [ ] 类型检查通过
- [ ] 测试用例通过
- [ ] 构建产物包含所有必要的文件

## 回滚计划

如果迁移出现问题，可以回滚：

```bash
# 1. 恢复 React 项目的依赖配置
cd next-drawio-react
# 将 package.json 中的 "@drawio/core": "workspace:*" 改回原来的配置

# 2. 重新安装依赖
pnpm install

# 3. 删除新创建的 next-drawio-core 目录
cd ..
rm -rf next-drawio-core
```

## 注意事项

1. **不要立即删除旧代码** - 在确认新结构完全工作正常之前，保留原有的 `packages/drawio-core` 目录
2. **逐步迁移** - 可以先在一个分支上进行迁移测试
3. **依赖关系** - 确保 Fabric.js 版本一致
4. **类型安全** - 运行 `pnpm type-check` 确保没有类型错误
5. **团队沟通** - 通知团队成员关于项目结构的变更

## 故障排除

### 问题：无法解析 @drawio/core

**解决方案：**
```bash
# 确保在根目录安装了依赖
pnpm install

# 检查 workspace 配置
cat pnpm-workspace.yaml

# 重新构建核心库
pnpm build:core
```

### 问题：类型定义丢失

**解决方案：**
```bash
# 确保 TypeScript 配置正确
cd next-drawio-core
pnpm run type-check

# 检查生成的类型文件
ls -la dist/*.d.ts
```

### 问题：构建失败

**解决方案：**
```bash
# 清理所有构建产物
pnpm clean

# 重新安装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 重新构建
pnpm build
```