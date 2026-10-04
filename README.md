# AME — Tokyo

A quiet, cinematic Tokyo rain-night experience.

**Atmosphere > Features · Tokyo > Rain · Subtle > Flashy**

[进入 Tokyo](https://g88nr25ct5-sys.github.io/ame-tokyo/)

![Tokyo through a rain-covered window](assets/tokyo-window.png)

## 体验

- 城市全景作为入口，进入后切换到窗边视角；底部「视角」按钮可来回切换。
- 动态雨丝从零星细雨到密集夜雨，独立于图片中固定的雨滴。
- 窗边按住鼠标或手指拖动擦雾，可以写字、画图。松手后保留约 4 秒，再用约 12 秒逐渐重新起雾。
- 环境声独立开关与调节；音乐默认 OFF，可选择 AMBIENT I、AMBIENT II、RAINY JAZZ，切换时淡入淡出。
- 桌面与手机横屏；手机竖屏显示旋转提示。支持全屏、缩放与重置。

声音在用户点击 **Enter Tokyo** 后启动。浏览器或系统静音时，需自行开启声音。图片内原有的模糊、玻璃雨滴不会被擦雾效果消除；擦除的是独立叠加的轻微水汽层。

## 本地运行

无需安装依赖。在项目文件夹运行：

```sh
python3 -m http.server 8765
```

打开 `http://localhost:8765/`。请通过 HTTP 服务预览，不要直接双击 HTML；音频需要通过 `fetch` 加载。

## 操作

| 操作 | 效果 |
| --- | --- |
| 轻点场景 | 打开 / 关闭氛围设置 |
| 窗边单指或鼠标按住拖动 | 擦除玻璃雾气 |
| 城市全景拖动 | 平移画面 |
| 滚轮 / 双指捏合 | 缩放 |
| 场景获得焦点后 `+` / `-` / `0` | 放大 / 缩小 / 重置 |
| 场景获得焦点后方向键 | 平移画面 |
| Escape | 关闭设置 |

## 项目结构

```text
index.html           页面和极简控件
style.css            画面、响应式与界面样式
app.js               场景、雨丝、交互与音频系统
fog.js               独立玻璃水汽及擦除轨迹
assets/              场景图片和音频
```

原生 HTML / CSS / JavaScript，无框架、无构建步骤。更换图片时修改 `index.html` 中的图片路径；音频文件映射在 `app.js` 的 `AUDIO_FILES` 中。

## GitHub Pages

发布来源使用 **main 分支 / 根目录**，`.nojekyll` 保证按静态文件直接发布。推送到 main 后 GitHub Pages 自动更新。全部资源使用相对路径，可部署到项目子目录。

## 音频来源与使用范围

以下音频只作为本作品的配乐和环境层使用，遵循各自来源及 [Pixabay Content License](https://pixabay.com/service/license-summary/)，不因本仓库的发布而取得额外授权。请勿将音频提取后作为独立素材重新分发。

| 场景层 | 曲目 / 作者 | 本地文件 |
| --- | --- | --- |
| Environment | [The rain and the city traffic — sachintempini](https://pixabay.com/es/sound-effects/naturaleza-the-rain-and-the-city-traffic-190469/) | `assets/audio/rain-city-sachintempini.mp3` |
| Ambient I | [Melancholic Ambient Background — Universfield](https://pixabay.com/music/ambient-melancholic-ambient-background-351787/) | `assets/audio/ambient-i-universfield.mp3` |
| Ambient II | [Melancholic Ambient Background 02 — Universfield](https://pixabay.com/music/ambient-melancholic-ambient-background-02-351771/) | `assets/audio/ambient-ii-universfield.mp3` |
| Rainy Jazz | [Blues Jazz Rainy Night — alex-morgan](https://pixabay.com/music/blues-blues-jazz-rainy-night-552797/) | `assets/audio/rainy-jazz-alex-morgan.mp3` |

配图由项目作者提供，增强图通过 AI 修复生成。仓库未另行授予代码或图片的开源许可；第三方音频仍适用其原许可。
