import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
import ImageBlock from "../../blocks/ImageBlock";
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

        if (!this.currentMediaEl) return;

        // 정렬 처리 (임시 DOM 조작)
        this.currentMediaEl.style.display = "block";
        this.currentMediaEl.style.margin = "0 auto";

        if (action === "left") {
            this.currentMediaEl.style.marginLeft = "0";
            this.currentMediaEl.style.marginRight = "auto";
        }

        if (action === "right") {
            this.currentMediaEl.style.marginLeft = "auto";
            this.currentMediaEl.style.marginRight = "0";
        }

        // TODO: block.data.align = action
        // → 이후 renderer 기반으로 리팩토링
    };

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
