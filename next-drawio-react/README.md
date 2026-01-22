# Next Draw.io 风格画布

基于 Next.js + TypeScript 的交互式图形编辑器，支持矩形、圆形、三角形、文本、折线/连线的创建、连接、缩放、拖拽与多选操作。核心绘图逻辑已抽出到 `packages/drawio-core` 并通过 `@drawio/core` 复用。

## 运行步骤

1. 安装依赖
   ```bash
   pnpm install
   ```
2. 启动开发服务
   ```bash
   pnpm dev
   ```
3. 打开浏览器访问 `http://localhost:3000`
4. Storybook 预览（可选，用于组件独立调试）
   ```bash
   pnpm storybook
   ```

## 使用说明

- 在画布空白处点击对应工具按钮（或调用 `CanvasComponentRef` 提供的方法）创建图元。
- 将鼠标移到图元边缘或连接线端点附近可显示 port，拖拽 port/端点即可与其他图元连接。
- 拖动图元或缩放手柄可实时更新连接线端点位置。
- 框选：在画布空白拖出选框，松开后框内图元会进入选中状态。
- 多选拖动：选中多个图元后，按住其中任意一个拖动即可整体移动。
- 双击文本进入编辑，修改后自动保存。
- Delete/Backspace 删除选中，Cmd/Ctrl+Z 撤销，Cmd/Ctrl+Y 或 Cmd/Ctrl+Shift+Z 重做。

## 功能列表

- 图元：矩形、圆形、三角形、文本、直线、折线/连接线
- 连接：端点/port 高亮、最近端口吸附、连线端点拖拽重连
- 选中：单选、多选、框选；选中态描边及缩放手柄（文本仅虚线框）
- 变换：拖动、缩放、旋转、填充色/描边/透明度调整
- 文本：双击编辑、选中虚线框显示
- 历史：撤销/重做，复制、清空画布
- 导出：支持 PNG/JPG/SVG

## 开发提示

- 主要交互逻辑集中在 `src/components/InteractiveCanvasComponent.tsx`
- 组件级预览可通过 Storybook 运行 `pnpm storybook`
- 绘图核心与常量位于 `packages/drawio-core/src/*`
