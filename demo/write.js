import Editor, { ImageBlock, VideoBlock } from '../dist/editor.esm.js';
import { initDB, saveFileToDB, getFileFromDB, generateFileId } from './db.js';

const STORAGE_KEY = 'editor-demo-data';

const IMAGE_LIMIT = 7;
const VIDEO_LIMIT = 1;

const IMAGE_MAX_SIZE_MEGABYTES = 10;
const VIDEO_MAX_SIZE_MEGABYTES = 300;
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MEGABYTES * 1024 * 1024;
const VIDEO_MAX_SIZE_BYTES = VIDEO_MAX_SIZE_MEGABYTES * 1024 * 1024;

const tempFiles = new Map(); // blobUrl -> { fileId, file }

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
                            const blobUrl = URL.createObjectURL(file);
                            tempFiles.set(blobUrl, { fileId, file });
                            return { success: 1, file: { url: blobUrl } };
                        }
                    }
                }
            },
            video: {
                toolbar: true,
                maxCount: VIDEO_LIMIT,
                onMaxCountReached: (_, max) => alert(`영상은 최대 ${max}개까지 업로드할 수 있어요.`),
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
                            const blobUrl = URL.createObjectURL(file);
                            tempFiles.set(blobUrl, { fileId, file });
                            return { success: 1, file: { url: blobUrl } };
                        }
                    },
                }
            }
        }
    });

    if (initialData) {
        editor.load(initialData);
    }

    updateOutput(editor.serialize());
}

function updateOutput(blocks) {
    const outputEl = document.getElementById('output');
    outputEl.textContent = JSON.stringify(blocks, null, 2);
}

async function handleSave() {
    const blocks = editor.serialize();

    for (const block of blocks) {
        if ((block.type === 'image' || block.type === 'video') && block.src) {
            const temp = tempFiles.get(block.src);
            if (temp) {
                await saveFileToDB(temp.fileId, temp.file);
                block.fileId = temp.fileId;
                block.src = '';
                tempFiles.delete(block.src);
            }
        }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    alert('저장되었습니다.');
    window.location.href = 'view.html';
}

function handleClear() {
    if (confirm('에디터 내용을 모두 지우시겠습니까?')) {
        tempFiles.clear();
        initEditor();
    }
}

function handleImageSelectOnWeb(e) {
    const files = Array.from(e.target.files);
    const uploader = editor.getImageUploader();

    files.forEach(async file => {
        if (uploader && editor) {
            const res = await uploader.uploadByFile(file);
            if (res && res.success) {
                const toolConfig = editor.getToolConfig("image");
                const block = ImageBlock.createDefault(res.file.url, {
                    config: toolConfig?.config ?? {},
                    api: {
                        editor: editor,
                        removeBlock: (block) => editor.removeBlock(block)
                    }
                });
                editor.insertBlock(block);
            }
        }
    });
    document.getElementById('image-input').value = '';
}

function handleVideoSelectOnWeb(e) {
    const files = Array.from(e.target.files);
    const uploader = editor.getVideoUploader();

    files.forEach(async file => {
        if (uploader && editor) {
            const res = await uploader.uploadByFile(file);
            if (res && res.success) {
                const toolConfig = editor.getToolConfig("video");
                const block = VideoBlock.createDefault(res.file.url, {
                    config: toolConfig?.config ?? {},
                    api: {
                        editor: editor,
                        removeBlock: (block) => editor.removeBlock(block)
                    }
                });
                editor.insertBlock(block);
            }
        }
    });
    document.getElementById('video-input').value = '';
}

document.getElementById('btn-save').addEventListener('click', handleSave);
document.getElementById('btn-clear').addEventListener('click', handleClear);

initDB().then(() => initEditor());
