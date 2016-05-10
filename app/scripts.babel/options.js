'use strict';

let toggle = document.getElementById('important_only');
chrome.storage.local.get('setting', value=> {
  console.log(value);
  toggle.checked = !!value.setting['important-only'];
});

toggle.onclick = ()=> {
  console.log(123);
  let options = {
    'important-only': toggle.checked
  };
  console.log(options);
  chrome.storage.local.set({setting: options});
  chrome.runtime.sendMessage({
    type: 'setting', options
  }, response=> {
    console.log(response);
  });
};

