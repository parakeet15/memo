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
      const allKeys = e.target.result;
      allKeys.forEach(id => output(id));
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

const saveButton = document.getElementById('save-button');
saveButton.addEventListener('click', save);

function output(id) {
  const transaction = database.transaction(storeName, 'readonly');
  const objectStore = transaction.objectStore(storeName);
  const getRequest = objectStore.get(id);

  getRequest.onsuccess = event => {
    const memo = event.target.result;

    const container = document.createElement('div');
    const title = document.createElement('h3');
    const body = document.createElement('p');
    const writeDate = document.createElement('p');

    container.className = 'container';
    container.dataset.id = id;

    title.innerText = memo.title;
    body.innerText = memo.body;
    writeDate.innerText = memo.writeDate;

    container.appendChild(title);
    container.appendChild(body);
    container.appendChild(writeDate);
    document.getElementById('memoes').appendChild(container);

    // container.onclick = e => read(e.target.dataset.id);
  }

  transaction.oncomplete = () => {
    console.info('トランザクションが完了しました');
  }
}