# 光影藏册 · 二次元闪卡相簿

- 网站：https://lantern-holo-card.xiaokl413.chatgpt.site
- GitHub Pages：https://foralready.github.io/lantern-holo-card/
- Sites 项目：appgprj_6ac3bbf6f7bc81919585f6ddcb4f99b3
- 入口：dist/index.html；以 dist 为根目录启动任意静态服务器。
- 相簿：163 张，保留原有 6 张、134 张 Drive 分层卡片，并加入两批共 23 张上传图片闪卡。Drive 的 80 张来源及上传的 13 张图片因安全限制未导入。

本次通过 GitHub 连接直接同步完整页面代码、开发脚本、卡片数据与全部处理后的素材。Sites 清单 github-sync-manifest.json 提供每个文件的 SHA-256，用于核对两端内容。未启用定时写入仓库的工作流；此能力被自动审批拒绝。GitHub Pages 沿用仓库既有发布流程。

原始 Drive 图片、图像编辑的临时文件和候选素材不包含在公开同步中。浏览网站无需连接 Drive。验收范围与设备验证限制见 RELEASE-QA.md。

2026-10-11 修复：详情画布按实际 CSS 尺寸 × 屏幕像素密度绘制，窗口或沉浸模式变化时重新分配已有渲染缓冲；保留原画比例与分层效果。插画保持位图原貌，不以矢量描摹替代。

同步范围包含完整 dist 发布目录及对应开发文件；清单同时覆盖 source-code 镜像文件。手动运行 `node scripts/sync-sites.mjs` 会将公开 Sites 的文件拉到当前本地目录并核对 SHA-256（含 README 和同步清单），本脚本不会提交或推送 GitHub。当前任务中的仓库更新通过 GitHub 连接直接提交，并核验 Pages 发布；未启用后台定时同步。

上传导入：23 张均保留原始尺寸，人物层沿用原图像素；纯色背景图片补充配套场景。制作使用内置图像编辑，提示词与分层记录见 work/imports/prompts.json 和 work/layers/record-*.json。

流光画卷改版：按原图比例形成连续拼排，避免横竖图固定画框留白；玻璃导航与筛选栏、统一 Lucide 收藏图标、详情转场和可暂停的自动漫游。鼠标倾斜与触摸拖动预览、收藏、搜索、原链接、背面和高清详情均保留。1,000 张模拟记录的窗口最多挂载 34 张；布局与 DOM 契约检查通过，真实手机浏览器的视觉、GPU 与帧率仍需验证。
