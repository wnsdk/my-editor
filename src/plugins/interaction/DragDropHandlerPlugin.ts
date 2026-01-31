import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
import BaseBlock from "../../blocks/BaseBlock";

/**
 * 드래그 앤 드롭을 통해 에디터 블록의 순서를 변경하는 기능을 제공하는 플러그인입니다.
 */
export default class DragDropHandlerPlugin extends Plugin {
    private draggingBlockEl: HTMLElement | null = null;
    private draggingBlockId: string | null = null;
    private dragOverBlockEl: HTMLElement | null = null;
    private dropPosition: "top" | "bottom" | null = null;
    private dragIndicatorEl: HTMLElement | null = null;

    constructor(editor: Editor) {
        super(editor);
    }

    /**
     * 플러그인을 초기화하고 에디터 루트에 드래그 앤 드롭 관련 이벤트 리스너를 등록합니다.
     */
    initialize() {
        this.editor.root.addEventListener("dragstart", this._onDragStart.bind(this));
        this.editor.root.addEventListener("dragover", this._onDragOver.bind(this));
        this.editor.root.addEventListener("dragleave", this._onDragLeave.bind(this));
        this.editor.root.addEventListener("drop", this._onDrop.bind(this));
        this.editor.root.addEventListener("dragend", this._onDragEnd.bind(this));
    }



    private _onDragStart(event: DragEvent) {
        const target = event.target as HTMLElement | null;
        const blockEl = target?.closest<HTMLElement>(".image-block-wrapper, .video-block-wrapper");

        if (!blockEl || !event.dataTransfer) {
            event.preventDefault();
            return;
        }

        this.draggingBlockEl = blockEl;
        this.draggingBlockId = blockEl.dataset["blockId"] ?? null;

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", this.draggingBlockId ?? "");

        const dragImage = blockEl.cloneNode(true) as HTMLElement;
        dragImage.style.position = "absolute";
        dragImage.style.top = "-9999px";
        dragImage.style.width = "120px";
        dragImage.style.height = "120px";
        dragImage.style.objectFit = "cover";
        dragImage.style.overflow = "hidden";

        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, event.offsetX, event.offsetY);

        setTimeout(() => {
            blockEl.classList.add("dragging");
            dragImage.remove();
        }, 0);
    }



    private _onDragOver(event: DragEvent) {
        event.preventDefault();
        if (!this.draggingBlockEl) return;

        this._ensureDragIndicatorExists();
        if (!this.dragIndicatorEl) return;

        this.dragIndicatorEl.style.display = "none";

        const droppableBlocks = Array.from(
            this.editor.root.querySelectorAll<HTMLElement>(".block")
        ).filter(el => el !== this.draggingBlockEl);

        if (droppableBlocks.length === 0) return;

        const result = this._calculateDropPosition(event.clientY, droppableBlocks);
        if (!result) return;

        const { targetBlock, dropPosition, indicatorTop } = result;

        this._updateDragIndicator();
        this.dragOverBlockEl = targetBlock;
        this.dropPosition = dropPosition;
    }



    private _onDragLeave(event: DragEvent) {
        if (
            !this.editor.root.contains(event.relatedTarget as Node | null) &&
            event.relatedTarget !== this.editor.root
        ) {
            this._clearDragOverStyles();
        }
    }



    private _onDrop(event: DragEvent) {
        event.preventDefault();

        if (
            !this.draggingBlockId ||
            !this.dragOverBlockEl ||
            !this.dropPosition
        ) {
            this._onDragEnd();
            return;
        }

        const blocks = this.editor.blocks;
        const fromIdx = blocks.findIndex(b => b.id === this.draggingBlockId);
        const toId = this.dragOverBlockEl.dataset["blockId"];
        const rawToIdx = blocks.findIndex(b => b.id === toId);

        if (fromIdx === -1 || rawToIdx === -1 || fromIdx === rawToIdx) {
            this._onDragEnd();
            return;
        }

        let toIdx = rawToIdx;
        if (this.dropPosition === "bottom") {
            toIdx += 1;
        }

        const movedBlock = this._reorderBlocks(fromIdx, toIdx);
        if (!movedBlock) {
            this._onDragEnd();
            return;
        }

        this.editor.renderer.render(blocks);
        this.editor.saveHistory();
        this.editor.selectAndFocusBlock(movedBlock);

        this._onDragEnd();
    }



    private _onDragEnd() {
        if (this.draggingBlockEl) {
            this.draggingBlockEl.classList.remove("dragging");
        }
        this._clearDragOverStyles();
        this.draggingBlockEl = null;
        this.draggingBlockId = null;
        this.dragOverBlockEl = null;
        this.dropPosition = null;
    }



    /**
     * 블록 배열 내에서 블록의 순서를 재정렬합니다.
     */
    private _reorderBlocks(fromIndex: number, toIndex: number): BaseBlock | null {
        const blocks = this.editor.blocks;
        const removed = blocks.splice(fromIndex, 1);
        const movedBlock = removed[0];

        if (!movedBlock) return null;

        const insertIndex = toIndex > fromIndex ? toIndex - 1 : toIndex;
        blocks.splice(insertIndex, 0, movedBlock);

        return movedBlock;
    }



    /**
     * 드래그 인디케이터가 DOM에 존재하는지 확인하고 없으면 생성합니다.
     */
    private _ensureDragIndicatorExists(): void {
        if (this.dragIndicatorEl && this.dragIndicatorEl.parentNode !== this.editor.root) {
            this.dragIndicatorEl = null; // DOM에서 제거된 경우 참조 초기화
        }
        if (!this.dragIndicatorEl) {
            this.dragIndicatorEl = document.createElement("div");
            this.dragIndicatorEl.classList.add("drag-indicator");
            this.editor.root.appendChild(this.dragIndicatorEl);
        }
    }



    /**
     * 드롭 위치를 계산하고 해당 위치의 인디케이터 상단 좌표를 반환합니다.
     */
    private _calculateDropPosition(
        mouseY: number,
        droppableBlocks: HTMLElement[]
    ): { targetBlock: HTMLElement; dropPosition: "top" | "bottom"; indicatorTop: number } | null {

        const editorRect = this.editor.root.getBoundingClientRect();

        for (const [i, blockEl] of droppableBlocks.entries()) {
            const rect = blockEl.getBoundingClientRect();
            const blockMidY = rect.top + rect.height / 2;

            if (mouseY < blockMidY) {
                return {
                    targetBlock: blockEl,
                    dropPosition: "top",
                    indicatorTop: rect.top - editorRect.top
                };
            }

            if (i === droppableBlocks.length - 1) {
                return {
                    targetBlock: blockEl,
                    dropPosition: "bottom",
                    indicatorTop: rect.bottom - editorRect.top
                };
            }
        }

        return null;
    }



    /**
     * 드래그 인디케이터의 위치와 스타일을 업데이트하여 표시합니다.
     */
    private _updateDragIndicator() {
        if (!this.dragIndicatorEl) return;

        const rect = this.editor.root.getBoundingClientRect();
        this.dragIndicatorEl.style.top = `${top}px`;
        this.dragIndicatorEl.style.left = "0px";
        this.dragIndicatorEl.style.width = `${rect.width}px`;
        this.dragIndicatorEl.style.display = "block";
    }



    /**
     * 드래그 오버 시 표시되는 스타일(인디케이터)을 제거합니다.
     */
    private _clearDragOverStyles(): void {
        if (this.dragIndicatorEl && this.dragIndicatorEl.parentNode) {
            this.dragIndicatorEl.parentNode.removeChild(this.dragIndicatorEl);
        }
        this.dragIndicatorEl = null;
    }
}
