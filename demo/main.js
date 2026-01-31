import Editor from '../dist/editor.esm.js';
import { initDB, saveFileToDB, getFileFromDB, clearFilesFromDB, generateFileId } from './db.js';

const STORAGE_KEY = 'editor-demo-data';

const IMAGE_LIMIT = 7;
const VIDEO_LIMIT = 1;

const IMAGE_MAX_SIZE_MEGABYTES = 10;
const VIDEO_MAX_SIZE_MEGABYTES = 300;
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MEGABYTES * 1024 * 1024;
const VIDEO_MAX_SIZE_BYTES = VIDEO_MAX_SIZE_MEGABYTES * 1024 * 1024;

const tempFiles = new Map();

let editor;

async function initEditor(initialData = null) {
    const holderEl = document.getElementById('editor');
    holderEl.innerHTML = '';

    editor = new Editor({
        holder: 'editor',
        toolbar: true,
        placeholder: '내용을 입력하세요.',
        onChange: (blocks) => {
            updateOutput(blocks);
        },
        tools: {
            list: {
                toolbar: true,
            },
            image: {
                toolbar: true,
                maxCount: IMAGE_LIMIT,
                onMaxCountReached: (_, max) => alert(`이미지는 최대 ${max}장까지 업로드할 수 있어요.`),
                onCountChange: (currentCount, _) => document.getElementById('count-image').textContent = currentCount,
                config: {
                    showDeleteButton: true,
                    uploader: {
                        fileSelectButton: 'selectImageButton',
                        openFilePicker: () => {
                            const input = document.getElementById('image-input');
                            input.onchange = (e) => handleImageSelectOnWeb(e);
                            input.click();
                        },
                        uploadByFile: async (file) => {
                            if (file.size > IMAGE_MAX_SIZE_BYTES) {
                                alert(`이미지 파일의 크기는 최대 ${IMAGE_MAX_SIZE_MEGABYTES}MB를 넘을 수 없어요.`);
                                return null;
                            }

                            const fileId = generateFileId();
                            tempFiles.set(fileId, file);
                            const blobUrl = URL.createObjectURL(file);
                            return { success: 1, file: { url: blobUrl, fileId } };
                        }
                    }
                }
            },
            video: {
                toolbar: true,
                maxCount: VIDEO_LIMIT,
                onMaxCountReached: (_, max) => Toast.show(`영상은 최대 ${max}개까지 업로드할 수 있어요.`),
                onCountChange: (currentCount, _) => document.getElementById('count-video').textContent = currentCount,
                config: {
                    showDeleteButton: true,
                    uploader: {
                        fileSelectButton: 'selectVideoButton',
                        openFilePicker: () => {
                            const input = document.getElementById('video-input');
                            input.onchange = (e) => handleVideoSelectOnWeb(e);
                            input.click();
                        },
                        uploadByFile: async (file) => {
                            if (file.size > VIDEO_MAX_SIZE_BYTES) {
                                alert(`영상 파일의 크기는 최대 ${VIDEO_MAX_SIZE_MEGABYTES}MB를 넘을 수 없어요.`);
                                return null;
                            }

                            const fileId = generateFileId();
                            tempFiles.set(fileId, file);
                            const blobUrl = URL.createObjectURL(file);
                            return { success: 1, file: { url: blobUrl, fileId } };
                        }
                    },
                }
            }
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

async function handleSave() {
    const data = editor.save();
    if (data) {
        const blocks = data.blocks;

        for (const block of blocks) {
            if ((block.type === 'image' || block.type === 'video') && block.data?.file?.fileId) {
                const fileId = block.data.file.fileId;
                const file = tempFiles.get(fileId);
                if (file) {
                    await saveFileToDB(fileId, file);
                    tempFiles.delete(fileId);
                }
            }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
        alert('저장되었습니다.');
    }
}

async function handleLoad() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const blocks = JSON.parse(saved);

        for (const block of blocks) {
            if ((block.type === 'image' || block.type === 'video') && block.data?.file?.fileId) {
                const fileId = block.data.file.fileId;
                const record = await getFileFromDB(fileId);
                if (record) {
                    const blobUrl = URL.createObjectURL(record.file);
                    block.data.file.url = blobUrl;
                }
            }
        }

        initEditor(blocks);
        alert('불러왔습니다.');
    } else {
        alert('저장된 데이터가 없습니다.');
    }
}

async function handleClear() {
    if (confirm('에디터 내용을 모두 지우시겠습니까?')) {
        await clearFilesFromDB();
        localStorage.removeItem(STORAGE_KEY);
        tempFiles.clear();
        initEditor();
    }
}




/** 웹에서 이미지 파일 선택했을 때 */
function handleImageSelectOnWeb(e) {
    const files = Array.from(e.target.files);
    const uploader = editor.getImageUploader();

    files.forEach(async file => {
        if (uploader && editor) {
            const res = await uploader.uploadByFile(file);
            if (res && res.success) {
                const block = editor.createDefaultImageBlock(res.file.url);
                editor.insertBlock(block);
            }
        }
    });
    document.getElementById('image-input').value = '';
}

/** 웹에서 비디오 파일 선택했을 때 */
function handleVideoSelectOnWeb(e) {
    const files = Array.from(e.target.files);
    const uploader = editor.getVideoUploader();

    files.forEach(async file => {
        if (uploader && editor) {
            const res = await uploader.uploadByFile(file);
            if (res && res.success) {
                const block = editor.createDefaultVideoBlock(res.file.url);
                editor.insertBlock(block);
            }
        }
    });
    document.getElementById('video-input').value = '';
}

document.getElementById('btn-save').addEventListener('click', handleSave);
document.getElementById('btn-load').addEventListener('click', handleLoad);
document.getElementById('btn-clear').addEventListener('click', handleClear);

initDB().then(() => initEditor());
