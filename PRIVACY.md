# Privacy

The extension requests `storage` and content-script access only to `www.douyin.com` and `www.xiaohongshu.com`. It has no cookies, history, identity, tabs, network interception or all-sites permission. It makes no network requests.

Word lists, preferences, a rotation cursor and up to 31 daily exposure-count entries are kept in Chrome's local extension storage. A counter is incremented when the background script allocates a word batch; closing a tab before display may still count that batch. Counts are not learning scores. Content IDs/URLs used for deduplication remain in per-tab memory and are not saved or sent anywhere.

The hosted demo uses this site's localStorage only. GitHub Pages receives ordinary web request metadata when you visit; its handling is governed by GitHub's policies. External GitHub links and downloads are user-initiated.

Export your word list before uninstalling. Removing the extension deletes its extension storage; clearing this site's browser data removes demo data. The demo and extension do not sync with each other or with a cloud service.
