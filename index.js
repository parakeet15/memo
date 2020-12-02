'use strict';

const databaseName = 'memo';
const storeName = 'memoes';

let database = null;

window.onload = () => {
  if (!window.indexedDB) {
    window.alert('ご利用のブラウザでは IndexedDB がサポートされていません');
    console.warn('IndexedDB はサポートされていません');
  }

  const openRequest = indexedDB.open(databaseName, 1);

  openRequest.onupgradeneeded = event => {
    database = event.target.result;
    database.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    // const objectStore = database.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    // objectStore.createIndex('title', 'title', { unique: false });
    // objectStore.createIndex('body', 'body', { unique: false });
    // objectStore.createIndex('writeDate', 'writeDate', { unique: false });
  }

  openRequest.onsuccess = event => {
    database = event.target.result;
    const transaction = database.transaction(storeName, 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const getAllKeysRequest = objectStore.getAllKeys();
    getAllKeysRequest.onsuccess = e => {
      const keys = e.target.result;
      keys.forEach(id => output(id));
    }

    // 汎用エラーハンドラ
    database.onerror = event => {
      console.error(`Database Error: ${event.target.errorCode}`);
    }
  }
}

function save() {
  const title = document.getElementById('title').value;
  const body = document.getElementById('body').value;
  const writeDate = new Date().toLocaleString();

  const memo = { title, body, writeDate };

  const transaction = database.transaction(storeName, 'readwrite');
  const objectStore = transaction.objectStore(storeName);
  const putRequest = objectStore.put(memo);

  putRequest.onsuccess = event => {
    const id = event.target.result;
    output(id);
  }

  transaction.oncomplete = () => {
    console.info('トランザクションが正常に完了しました');
  }
}

function output(id) {
  const transaction = database.transaction(storeName, 'readonly');
  const objectStore = transaction.objectStore(storeName);
  const getRequest = objectStore.get(id);

  getRequest.onsuccess = event => {
    const memo = event.target.result;
    const div = document.createElement('div');
    const h3 = document.createElement('h3');
    const p = document.createElement('p');
    div.dataset.id = id;
    h3.innerText = memo.title;
    p.innerText = memo.body;
    div.appendChild(h3);
    div.appendChild(p);
    document.getElementById('memoes').appendChild(div);
    div.onclick = e => read(e.target.dataset.id);

    console.info('データを正常に取得しました');
  }

  transaction.oncomplete = () => {
    console.info('トランザクションが完了しました');
  }
}