import Editor from '../dist/editor.esm.js';
import { initDB, getFileFromDB } from './db.js';

const STORAGE_KEY = 'editor-demo-data';

let editor;

async function initViewer() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        document.getElementById('editor').innerHTML = '<p class="empty-message">저장된 글이 없습니다.</p>';
        return;
    }

    const blocks = JSON.parse(saved);

    // IndexedDB에서 파일 복원
    for (const block of blocks) {
        if ((block.type === 'image' || block.type === 'video') && block.fileId) {
            const record = await getFileFromDB(block.fileId);
            if (record) {
                const blobUrl = URL.createObjectURL(record.file);
                block.src = blobUrl;
            }
        }
    }

    editor = new Editor({
        holder: 'editor',
        readOnly: true,
        tools: {
            list: {},
            image: {
                config: {
                    showDeleteButton: false
                }
            },
            video: {
                config: {
                    showDeleteButton: false
                }
            },
            table: {}
        }
    });

    editor.load(blocks);
}

initDB().then(() => initViewer());
