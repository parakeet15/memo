'use strict';

const title = document.getElementById('title');
const body = document.getElementById('body');
const list = document.getElementById('list');
const saveButton = document.getElementById('save');
saveButton.addEventListener('click', save);

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
      const Keys = e.target.result;
      Keys.forEach(id => output(id));
    }

    database.onerror = event => {
      console.error(`Database Error: ${event.target.errorCode}`);
    }

    console.info('データベースへの接続に成功しました');
  }
}

function save() {
  if (title.value.length === 0 || body.value.length === 0) {
    window.alert('タイトルまたはテキストが入力されていません');
    return;
  }

  const memo = {
    title: title.value,
    body: body.value,
    writeDate: new Date().toLocaleString()
  };

  title.value = null;
  body.value = null;

  const transaction = database.transaction(storeName, 'readwrite');
  const objectStore = transaction.objectStore(storeName);
  const addRequest = objectStore.add(memo);

  addRequest.onsuccess = event => {
    const id = event.target.result;
    output(id);

    console.info(`保存しました: ${id}`);
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
    list.innerHTML += `<div class="card my-3" data-id="${id}"><div class="card-header">ID: ${id}</div><div class="card-body"><h5 class="card-title">${memo.title}</h5><p class="card-text">${memo.body}</p></div><div class="card-footer text-muted">${memo.writeDate}<button class="btn btn-danger float-right" onclick="del(${id})">削除</button></div></div>`;
  }

  transaction.oncomplete = () => {
    console.info('トランザクションが完了しました');
  }
}

function del(id) {
  const transaction = database.transaction(storeName, 'readwrite');
  const objectStore = transaction.objectStore(storeName);
  const deleteRequest = objectStore.delete(id);

  deleteRequest.onsuccess = event => {
    console.info('削除が完了しました');
    document.querySelector(`div[data-id="${id}"]`).remove();
  }

  transaction.oncomplete = () => {
    console.info('トランザクションが正常に完了しました');
  }
}
