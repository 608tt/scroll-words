# 实现形式研究

研究日期：2026-10-28。结论是技术实现建议，不是平台授权或商店审核保证。

| 形式 | 能实现什么 | 主要代价 | 决定 |
| --- | --- | --- | --- |
| 桌面浏览器扩展 | 在网页 DOM 加单词弹窗、观察视频与笔记切换、暂停视频 | 网站 DOM 会变；桌面用户多一道安装步骤 | 先交付可运行版本 |
| 单独练词网页 | 免费打开即可体验，无安装 | 不能强制盖住另一个 App / 标签页 | 用作互动演示 |
| Android 独立 App | 通过授权悬浮窗按时提醒；进一步识别前台 App 需要额外能力 | 系统权限、厂商省电策略、上架政策、误触与隐私设计 | 适合后续实机开发 |
| iPhone 原生 App | 自己的学习界面、通知或有限系统扩展 | App 间沙箱与扩展点限制，不能任意把卡片插进其他 App | 不把系统限制包装成已实现功能 |
| 平台官方合作 | 在 App 内真正按视频数插入学习卡片 | 需要平台接口与商业合作，不能由开源作者单方面决定 | 长期选项 |

Chrome 的 content scripts 能在用户访问的匹配页面内操作 DOM，这是当前网页扩展的基础。[Chrome 官方文档](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)

Android 的辅助功能服务需要显式声明、用户授权以及事件范围设计；不宜为了数视频默认读取所有应用内容。[Android 官方文档](https://developer.android.com/guide/topics/ui/accessibility/views/service)

Google Play 对非辅助用途使用 Accessibility API 有额外披露、同意和使用范围要求，不能把“技术上可以监听”直接当作“可以直接上架”。[Google Play 政策](https://support.google.com/googleplay/android-developer/answer/18258653)

Apple 的应用扩展依赖宿主或系统提供的扩展点，不能推断任意 App 都允许插入第三方界面。[Apple 扩展说明](https://developer.apple.com/documentation/extensionfoundation/adding-support-for-app-extensions-to-your-app)

## 当前识别策略

抖音：选出可见面积过半的视频，优先正在播放者，按视频 ID / 地址 / 元素标识去重。

小红书：详情页用笔记 ID；瀑布流选出视口中央、可见面积过半的笔记封面。真实公开网页观察到 `/explore/` 笔记链接；抖音未登录推荐入口出现登录界面，未进一步登录或绕过。

候选内容持续 1.5 秒才计数。混合模式让前台停留时间作为兜底。计数只存在标签页内存，不保存观看链接。

## 下一步真正值得投入的工作

1. 邀请少量桌面用户带着自己的词库试用，记录“提醒是否合适”和站点计数误差。
2. 建立用户主动提供的匿名 DOM 夹具，维护站点兼容性；不要收集完整浏览历史。
3. 若主要使用 Android，再做按时悬浮词卡原型并测试省电和前后台切换。先证明体验，再考虑更敏感的内容计数。
4. 词库导入、间隔和紧急退出优先；学习效果需要用户研究，不能靠曝光次数下结论。
