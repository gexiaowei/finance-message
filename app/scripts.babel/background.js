'use strict';

let cache = new LRUCache(50);

chrome.runtime.onInstalled.addListener(details => {
});

chrome.tabs.onUpdated.addListener(tabId => {
});

initSocket();

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
  // let regexp = /【.+】/gi;
  let title = content.match(regexp) || '世界快讯';
  let message = regexp.test(content) ?
    content.substring(title.length) : content;
  let iconUrl = 'images/icon-128.png';
  let type = 'basic';

  if (info.importantLevel > 0) {
    chrome.notifications.create(info.newsId, {
      title, message, iconUrl, type
    });
  }
}

chrome.notifications.onClicked.addListener(notificationId=> {
  let info = cache.get(notificationId);
  if (info.columnType === 1) {
    chrome.tabs.create({url: `http://news.fx678.com/C/${notificationId.substr(0, 8)}/${notificationId}.shtml`});
  }

});
