# next-drawio-vue

基于 Vue 3 + Vite 的在线绘图工具，参考 next-drawio 的交互与布局实现。支持画布绘制、连接线、选区、拖拽添加图元、导入导出等能力。核心绘图逻辑已抽出到 `packages/drawio-core` 并通过 `@drawio/core` 复用。

## 功能概览
- 画布图元创建：矩形、圆角矩形、圆形、三角形、线段、折线、文本等
- 自定义图元库：菱形、梯形、六边形、五边形、对话框、波形、云、圆柱体等
- 连接线：端口吸附、连接端点拖拽
- 选择/多选、组合/取消组合、删除、复制/粘贴、图层前后排序
- 样式编辑：填充、描边、描边粗细、透明度、旋转、缩放
- 导入/导出：JSON、SVG/PNG/JPG
- 画布辅助：网格、分页视图、缩放/平移

## 运行与构建
```bash
pnpm install
pnpm dev
```

构建与预览：
```bash
pnpm build
pnpm preview
```

类型检查：
```bash
pnpm run type-check
```

## 目录结构
```
src/
  components/
    canvas/CanvasComponent/   # 画布核心逻辑（Vue composables + view）
    editor/                   # 编辑器 UI（菜单、侧栏、属性面板等）
  types/                      # 共享类型
packages/
  drawio-core/                # 绘图核心与常量
```

## 使用说明
- 左侧栏点击图元即可在画布中创建
- 图元支持拖拽到画布创建
- 选中图元后可在右侧属性面板调整样式
- 支持快捷键：复制/粘贴/撤销/重做/删除/全选等

## 环境
- Node.js 18+（建议）
- pnpm

## 备注
本项目为 Vue 3 原生实现，不包含 React 组件。
