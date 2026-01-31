import Editor from '../dist/editor.esm.js';

const STORAGE_KEY = 'editor-demo-data';

let editor;

async function initEditor(initialData = null) {
    const holderEl = document.getElementById('editor');
    holderEl.innerHTML = '';

    editor = new Editor({
        holder: 'editor',
        toolbar: true,
        placeholder: '여기에 내용을 입력하세요...',
        onChange: (blocks) => {
            updateOutput(blocks);
        }
    });

    await editor.isReady;

    if (initialData) {
        await editor.render({ blocks: initialData });
    }

    updateOutput(editor.save()?.blocks || []);
}

function updateOutput(blocks) {
    const outputEl = document.getElementById('output');
    outputEl.textContent = JSON.stringify(blocks, null, 2);
}

function handleSave() {
    const data = editor.save();
    if (data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.blocks));
        alert('저장되었습니다.');
    }
}

function handleLoad() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const blocks = JSON.parse(saved);
        initEditor(blocks);
        alert('불러왔습니다.');
    } else {
        alert('저장된 데이터가 없습니다.');
    }
}

function handleClear() {
    if (confirm('에디터 내용을 모두 지우시겠습니까?')) {
        initEditor();
    }
}

document.getElementById('btn-save').addEventListener('click', handleSave);
document.getElementById('btn-load').addEventListener('click', handleLoad);
document.getElementById('btn-clear').addEventListener('click', handleClear);

initEditor();
