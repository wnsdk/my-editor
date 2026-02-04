import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
import ImageBlock from "../../blocks/media/ImageBlock";
import { registerBlock } from "../../blocks/BlockFactory";
import { getBlockElementOf } from "../../utils/dom";
import { ImageToolConfig, ToolConfig } from "../../types";
import type BaseBlock from "../../blocks/BaseBlock";

/**
 * 이미지 블록 + 이미지 컨텍스트 툴바를 제공하는 플러그인
 */
export default class ImageBlockPlugin extends Plugin {
    private toolbarEl: HTMLElement | null = null;
    private currentBlock: BaseBlock | null = null;
    private currentMediaEl: HTMLElement | null = null;
    private resizeModalEl: HTMLElement | null = null;
    private resizeOverlayEl: HTMLElement | null = null;
    private originalAspectRatio: number = 1;

    constructor(editor: Editor) {
        super(editor);
    }

    initialize() {
        // ImageBlock 등록
        registerBlock("image", ImageBlock);

        // 툴바 생성
        if (!this.toolbarEl) {
            this.toolbarEl = this.createToolbarElement();
            document.body.appendChild(this.toolbarEl);
            this.toolbarEl.addEventListener("click", this.onToolbarClick);
        }

        // 그 외 이벤트 바인딩
        this.editor.root.addEventListener("click", this.onRootClick);
        document.addEventListener("scroll", this.hideToolbar, { passive: true });
    }

    destroy() {
        this.editor.root.removeEventListener("click", this.onRootClick);
        document.removeEventListener("scroll", this.hideToolbar);
        this.toolbarEl?.remove();
        this.resizeModalEl?.remove();
        this.resizeOverlayEl?.remove();
    }

    /* ================================
     * Toolbar
     * ================================ */

    private createToolbarElement(): HTMLElement {
        const el = document.createElement("div");
        el.className = "editor-image-toolbar hidden";
        el.innerHTML = `
            <button data-action="left">왼쪽</button>
            <button data-action="center">가운데</button>
            <button data-action="right">오른쪽</button>
            <button data-action="fill">가득 채우기</button>
            <button data-action="resize">크기 조절</button>
            <button data-action="remove">삭제</button>
        `;
        return el;
    }

    private onRootClick = (event: MouseEvent) => {
        const mediaEl = (event.target as HTMLElement)
            .closest(".image-block img, .video-block video");

        if (!mediaEl) {
            if (this.toolbarEl && !this.toolbarEl.contains(event.target as Node)) {
                this.hideToolbar();
            }
            return;
        }

        const blockEl = getBlockElementOf(mediaEl);
        if (!blockEl) return;

        const blockId = blockEl.dataset["blockId"];
        const block = this.editor.blocks.find(b => b.id === blockId);
        if (!block) return;

        // toolSettings.toolbar === false면 표시 안 함
        const toolSettings = this.editor.getToolConfig(block.type);
        if (toolSettings?.toolbar === false) {
            this.hideToolbar();
            return;
        }

        this.showToolbar(mediaEl as HTMLElement, block);
    };

    private showToolbar(mediaEl: HTMLElement, block: BaseBlock) {
        const toolSettings = this.editor.getToolConfig(block.type);
        if (toolSettings?.toolbar === false) return;

        if (!this.toolbarEl) {
            this.toolbarEl = this.createToolbarElement();
            document.body.appendChild(this.toolbarEl);
            this.toolbarEl.addEventListener("click", this.onToolbarClick);
        }

        this.currentBlock = block;
        this.currentMediaEl = mediaEl;

        const mediaRect = mediaEl.getBoundingClientRect();
        const toolbarRect = this.toolbarEl.getBoundingClientRect();

        const top = mediaRect.top - toolbarRect.height - 10 + window.scrollY;
        const left =
            mediaRect.left +
            mediaRect.width / 2 -
            toolbarRect.width / 2 +
            window.scrollX;

        this.toolbarEl.style.top = `${top}px`;
        this.toolbarEl.style.left = `${left}px`;
        this.toolbarEl.classList.remove("hidden");
    }

    private hideToolbar = () => {
        if (!this.toolbarEl) return;
        this.toolbarEl.classList.add("hidden");
        this.currentBlock = null;
        this.currentMediaEl = null;
    };

    private onToolbarClick = (event: MouseEvent) => {
        event.preventDefault();

        const button = (event.target as HTMLElement).closest("[data-action]");
        if (!button || !this.currentBlock) return;

        const action = button.getAttribute("data-action");

        if (action === "remove") {
            this.editor.removeBlock(this.currentBlock);
            this.hideToolbar();
            return;
        }

        if (action === "resize") {
            this.showResizeModal();
            return;
        }

        if (!this.currentMediaEl) return;

        // 미디어 요소의 부모 컨테이너 찾기 (.image-block 또는 .video-block)
        const containerEl = this.currentMediaEl.parentElement;
        if (!containerEl) return;

        // 래퍼 찾기 (.image-block-wrapper 또는 .video-block-wrapper)
        const wrapperEl = containerEl.parentElement;
        if (!wrapperEl) return;

        // 가득 채우기 처리
        if (action === "fill") {
            containerEl.classList.add("fill-width");
            this.currentMediaEl.classList.add("fill-width");
            this.currentMediaEl.style.display = "block";
            this.currentMediaEl.style.margin = "0";
            this.currentMediaEl.style.marginLeft = "";
            this.currentMediaEl.style.marginRight = "";
            wrapperEl.style.textAlign = "";
            return;
        }

        // 정렬 처리: wrapper에 text-align 적용
        containerEl.classList.remove("fill-width");
        this.currentMediaEl.classList.remove("fill-width"); // 가득 채우기 클래스 제거
        this.currentMediaEl.style.width = ""; // 커스텀 크기 제거
        this.currentMediaEl.style.height = ""; // 커스텀 크기 제거
        containerEl.style.display = ""; // display 스타일 초기화
        containerEl.style.justifyContent = ""; // justifyContent 초기화

        if (action === "left") {
            wrapperEl.style.textAlign = "left";
        } else if (action === "center") {
            wrapperEl.style.textAlign = "center";
        } else if (action === "right") {
            wrapperEl.style.textAlign = "right";
        }

        this.editor.saveHistory();
    };

    /* ================================
     * Resize Modal
     * ================================ */

    private showResizeModal() {
        if (!this.currentMediaEl) return;

        // 현재 미디어의 실제 크기 가져오기
        const currentWidth = this.currentMediaEl.offsetWidth;
        const currentHeight = this.currentMediaEl.offsetHeight;
        this.originalAspectRatio = currentWidth / currentHeight;

        // 에디터 최대 너비 가져오기
        const editorWidth = this.editor.root.offsetWidth;

        // 오버레이 생성
        if (!this.resizeOverlayEl) {
            this.resizeOverlayEl = document.createElement("div");
            this.resizeOverlayEl.className = "media-resize-overlay";
            document.body.appendChild(this.resizeOverlayEl);
            this.resizeOverlayEl.addEventListener("click", () => this.hideResizeModal());
        }
        this.resizeOverlayEl.classList.remove("hidden");

        // 모달 생성
        if (!this.resizeModalEl) {
            this.resizeModalEl = document.createElement("div");
            this.resizeModalEl.className = "media-resize-modal";
            this.resizeModalEl.innerHTML = `
                <h3>크기 조절</h3>
                <div class="input-row">
                    <label>너비(px)</label>
                    <input type="number" id="resize-width" min="10" max="${editorWidth}" value="${currentWidth}">
                </div>
                <div class="input-row">
                    <label>높이(px)</label>
                    <input type="number" id="resize-height" min="10" value="${currentHeight}">
                </div>
                <div class="checkbox-row">
                    <input type="checkbox" id="maintain-ratio" checked>
                    <label for="maintain-ratio">비율 유지</label>
                </div>
                <div class="button-row">
                    <button id="resize-cancel">취소</button>
                    <button id="resize-apply" class="primary">적용</button>
                </div>
            `;
            document.body.appendChild(this.resizeModalEl);

            // 이벤트 리스너 등록
            const widthInput = this.resizeModalEl.querySelector("#resize-width") as HTMLInputElement;
            const heightInput = this.resizeModalEl.querySelector("#resize-height") as HTMLInputElement;
            const ratioCheckbox = this.resizeModalEl.querySelector("#maintain-ratio") as HTMLInputElement;

            widthInput.addEventListener("input", () => {
                if (ratioCheckbox.checked) {
                    const newHeight = Math.round(parseInt(widthInput.value) / this.originalAspectRatio);
                    heightInput.value = newHeight.toString();
                }
            });

            heightInput.addEventListener("input", () => {
                if (ratioCheckbox.checked) {
                    const newWidth = Math.round(parseInt(heightInput.value) * this.originalAspectRatio);
                    widthInput.value = Math.min(newWidth, editorWidth).toString();
                }
            });

            this.resizeModalEl.querySelector("#resize-cancel")?.addEventListener("click", () => {
                this.hideResizeModal();
            });

            this.resizeModalEl.querySelector("#resize-apply")?.addEventListener("click", () => {
                this.applyResize();
            });
        } else {
            // 기존 모달 업데이트
            const widthInput = this.resizeModalEl.querySelector("#resize-width") as HTMLInputElement;
            const heightInput = this.resizeModalEl.querySelector("#resize-height") as HTMLInputElement;
            widthInput.max = editorWidth.toString();
            widthInput.value = currentWidth.toString();
            heightInput.value = currentHeight.toString();
        }

        this.resizeModalEl.classList.remove("hidden");
    }

    private hideResizeModal() {
        this.resizeModalEl?.classList.add("hidden");
        this.resizeOverlayEl?.classList.add("hidden");
    }

    private applyResize() {
        if (!this.currentMediaEl || !this.resizeModalEl) return;

        const widthInput = this.resizeModalEl.querySelector("#resize-width") as HTMLInputElement;
        const heightInput = this.resizeModalEl.querySelector("#resize-height") as HTMLInputElement;

        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);

        if (isNaN(newWidth) || isNaN(newHeight) || newWidth < 10 || newHeight < 10) {
            alert("너비와 높이는 최소 10px 이상이어야 합니다.");
            return;
        }

        const editorWidth = this.editor.root.offsetWidth;
        if (newWidth > editorWidth) {
            alert(`너비는 에디터 너비(${editorWidth}px)를 초과할 수 없습니다.`);
            return;
        }

        // 크기 적용
        this.currentMediaEl.style.width = `${newWidth}px`;
        this.currentMediaEl.style.height = `${newHeight}px`;

        // fill-width 클래스 제거 (커스텀 크기 설정)
        const containerEl = this.currentMediaEl.parentElement;
        containerEl?.classList.remove("fill-width");
        this.currentMediaEl.classList.remove("fill-width");

        this.hideResizeModal();
        this.editor.saveHistory();
    }

    /* ================================
     * Tool Settings
     * ================================ */

    static override getToolSettings(): Record<string, ToolConfig<ImageToolConfig>> {
        return {
            image: {
                maxCount: 5,
                toolbar: true,
                onMaxCountReached: (maxCount) => {
                    alert(`이미지 블록은 최대 ${maxCount}개까지 등록할 수 있습니다.`);
                },
                config: {
                    showDeleteButton: true,
                    uploader: {
                        fileSelectButton: "image-tool-button",
                        uploadByFile: async (file: File) => {
                            return { url: URL.createObjectURL(file) };
                        },
                    },
                },
            },
        };
    }
}
