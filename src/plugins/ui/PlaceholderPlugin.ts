import Plugin from "../../core/Plugin";
import type Editor from "../../core/Editor";
import type BaseBlock from "../../blocks/BaseBlock";

/**
 * 에디터의 플레이스홀더 기능을 제공하는 플러그인
 * - 에디터가 비어 있을 때 안내 문구 표시
 */
export default class PlaceholderPlugin extends Plugin {
    private text: string;
    private el: HTMLElement | null = null;
    private mutationObserver: MutationObserver | null = null;

    // 바인딩된 핸들러(제거용)
    private updateVisibilityBound = this.updatePlaceholderVisibility.bind(this);

    constructor(editor: Editor) {
        super(editor);
        this.text = editor.placeholderText || "내용을 입력하세요...";
    }

    initialize(): void {
        if (!this.text) return;

        this.createPlaceholderElement();
        this.observeEditorChanges();
        this.updatePlaceholderVisibility();
    }

    /* ================================
     * Setup
     * ================================ */

    private createPlaceholderElement(): void {
        this.el = document.createElement("div");
        this.el.className = "editor-placeholder";
        this.el.textContent = this.text;
        this.editor.root.appendChild(this.el);
    }

    private observeEditorChanges(): void {
        const events: Array<keyof HTMLElementEventMap> = [
            "input",
            "keyup",
            "mouseup",
            "compositionend",
        ];

        events.forEach(evt => {
            this.editor.root.addEventListener(evt, this.updateVisibilityBound);
        });

        this.mutationObserver = new MutationObserver(this.updateVisibilityBound);
        this.mutationObserver.observe(this.editor.root, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        this.editor.eventBus.on("block:removed", this.updateVisibilityBound);
        this.editor.eventBus.on("block:added", this.updateVisibilityBound);
    }

    /* ================================
     * Logic
     * ================================ */

    private updatePlaceholderVisibility(): void {
        const blocks = this.editor.blocks as BaseBlock[];

        // 에디터에 블록이 정확히 1개만 있는지 확인
        if (blocks.length !== 1) {
            if (this.el) {
                this.el.style.display = "none";
            }
            return;
        }

        const firstBlock = blocks[0];
        if (!firstBlock) return;

        // 그 블록이 텍스트 블록이고 비어있는지 확인
        const shouldShow =
            firstBlock.type === "text" &&
            typeof (firstBlock as any).isEmpty === "function" &&
            firstBlock.isEmpty();

        if (!this.el) return;

        this.el.style.display = shouldShow ? "block" : "none";

        if (shouldShow && firstBlock.el) {
            this.positionPlaceholder(firstBlock.el);
        }
    }

    private positionPlaceholder(firstBlockEl?: HTMLElement): void {
        if (!this.el || !firstBlockEl) return;

        const firstBlockRect = firstBlockEl.getBoundingClientRect();
        const rootRect = this.editor.root.getBoundingClientRect();

        this.el.style.top = `${firstBlockRect.top - rootRect.top}px`;
        this.el.style.left = `${firstBlockRect.left - rootRect.left}px`;
    }

    /* ================================
     * Teardown
     * ================================ */

    destroy(): void {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }

        const events: Array<keyof HTMLElementEventMap> = [
            "input",
            "keyup",
            "mouseup",
            "compositionend",
        ];

        events.forEach(evt => {
            this.editor.root.removeEventListener(evt, this.updateVisibilityBound);
        });

        this.editor.eventBus.off("block:removed", this.updateVisibilityBound);
        this.editor.eventBus.off("block:added", this.updateVisibilityBound);

        this.el?.remove();
        this.el = null;
    }
}
