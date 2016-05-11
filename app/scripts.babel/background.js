'use strict';

let cache = new LRUCache(50);
let options = {'important-only': false};

initSocket();

chrome.storage.local.get('setting', value=> {
  options['important-only'] = !!value.setting['important-only'];
});

chrome.notifications.onClicked.addListener(newsId=> {
  let info = cache.get(newsId);
  let url = info.columnType === 1 ?
    `http://news.fx678.com/C/${newsId.substr(0, 8)}/${newsId}.shtml` :
    'http://kx.fx678.com/';
  if (info.columnType === 1) {
    chrome.tabs.create({url});
  }
  chrome.notifications.clear(newsId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message, sender);
  if (message.type === 'setting') {
    Object.assign(options, message.options);
  }
});

chrome.runtime.onInstalled.addListener(details => {
});

chrome.tabs.onUpdated.addListener(tabId => {
});

function initSocket() {
  const socket = io.connect('http://101.71.36.214:8000/');

  socket.on('connect', () => {
    console.log('连接服务器成功');
  });
  socket.on('news', notifyMessage);
  socket.on('disconnect', () => {
    console.log('断开服务器成功');
  });
  socket.on('reconnect', ()=> {
  });
  socket.on('reconnecting', () => {
  });
  socket.on('reconnect_failed', ()=> {
    console.log('连接服务器失败');
  });
}

function notifyMessage(info) {
  console.log('收到消息', info);

  cache.put(info.newsId, info);

  let content = info.newsTitle;
  let regexp = /【.+】/gi;
  let title = content.match(regexp);
  title = title.length > 0 ? title[0] : '世界快讯';
  let message = regexp.test(content) ?
    content.substring(title.length + 1) : content;
  let iconUrl = 'images/icon-128.png';
  let type = 'basic';

  let level = options['important-only'] ? 1 : 0;

  if (info.importantLevel > level) {
    chrome.notifications.create(info.newsId, {
      title, message, iconUrl, type
    });
  }
}
