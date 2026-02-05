import Plugin from "../../core/Plugin";
import type Editor from "../../core/Editor";
import BaseBlock from "../../blocks/BaseBlock";
import { getBlockElementOf } from "../../utils/dom";

/**
 * 마우스를 사용한 다중 블록 선택 처리 플러그인
 * - Shift+Click: 범위 선택
 * - Ctrl+Click (또는 Cmd+Click): 개별 블록 선택 토글
 * - 일반 클릭: 기존 선택 해제
 */
export default class SelectionPlugin extends Plugin {
    private onMouseDownBound = this._onMouseDown.bind(this);
    private onMouseMoveBound = this._onMouseMove.bind(this);
    private onMouseUpBound = this._onMouseUp.bind(this);

    /** 드래그 선택 상태 */
    private isDragging: boolean = false;

    /** 드래그 시작 블록 */
    private dragStartBlock: BaseBlock | null = null;

    constructor(editor: Editor) {
        super(editor);
    }

    initialize(): void {
        this.editor.root.addEventListener("mousedown", this.onMouseDownBound);
        document.addEventListener("mousemove", this.onMouseMoveBound);
        document.addEventListener("mouseup", this.onMouseUpBound);
    }

    destroy(): void {
        this.editor.root.removeEventListener("mousedown", this.onMouseDownBound);
        document.removeEventListener("mousemove", this.onMouseMoveBound);
        document.removeEventListener("mouseup", this.onMouseUpBound);
    }

    /**
     * 마우스 다운 이벤트 처리
     */
    private _onMouseDown(event: MouseEvent): void {
        const target = event.target as HTMLElement;

        // 클릭된 블록 요소 찾기
        const blockEl = getBlockElementOf(target);
        if (!blockEl) {
            // 빈 공간 클릭 시 선택 해제
            if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
                this.editor.multiSelection.clearSelection();
            }
            return;
        }

        const blockId = blockEl.dataset["blockId"];
        if (!blockId) return;

        const clickedBlock = this.editor.blocks.find(b => b.id === blockId);
        if (!clickedBlock) return;

        const isModifierKey = event.ctrlKey || event.metaKey;

        // Ctrl/Cmd+Click: 블록 선택 토글
        if (isModifierKey && !event.shiftKey) {
            event.preventDefault();
            this.editor.multiSelection.toggleBlockSelection(clickedBlock);
            return;
        }

        // Shift+Click: 범위 선택
        if (event.shiftKey && !isModifierKey) {
            event.preventDefault();
            const selectedBlocks = this.editor.multiSelection.getSelectedBlocks();

            if (selectedBlocks.length > 0 && selectedBlocks[0]) {
                // 이미 선택된 블록이 있으면 그 블록부터 클릭한 블록까지 선택
                this.editor.multiSelection.selectBlockRange(selectedBlocks[0], clickedBlock);
            } else {
                // 선택된 블록이 없으면 현재 캐럿 위치의 블록부터 선택
                const currentBlock = this.editor.selection.getCurrentBlock() ||
                                    this.editor.getSelectedBlock();
                if (currentBlock) {
                    this.editor.multiSelection.selectBlockRange(currentBlock, clickedBlock);
                } else {
                    this.editor.multiSelection.selectBlock(clickedBlock);
                }
            }
            return;
        }

        // 일반 클릭: 기존 다중 선택 해제
        if (this.editor.multiSelection.hasSelection()) {
            // 선택된 블록 중 하나를 클릭한 경우는 해제하지 않음
            const selectedIds = this.editor.multiSelection.getSelectedBlockIds();
            if (!selectedIds.includes(clickedBlock.id)) {
                this.editor.multiSelection.clearSelection();
            }
        }

        // 드래그 선택 시작 (비텍스트 블록 또는 이미 선택된 블록)
        if (clickedBlock.type !== 'text' && clickedBlock.type !== 'list') {
            this.isDragging = true;
            this.dragStartBlock = clickedBlock;
        }
    }

    /**
     * 마우스 이동 이벤트 처리 (드래그 선택)
     */
    private _onMouseMove(event: MouseEvent): void {
        if (!this.isDragging || !this.dragStartBlock) return;

        // 드래그 중인 위치의 블록 찾기
        const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);

        for (const elem of elementsAtPoint) {
            const blockEl = getBlockElementOf(elem as HTMLElement);
            if (blockEl) {
                const blockId = blockEl.dataset["blockId"];
                if (blockId) {
                    const hoverBlock = this.editor.blocks.find(b => b.id === blockId);
                    if (hoverBlock && hoverBlock !== this.dragStartBlock) {
                        // 드래그 범위 선택
                        this.editor.multiSelection.selectBlockRange(
                            this.dragStartBlock,
                            hoverBlock
                        );
                    }
                }
                break;
            }
        }
    }

    /**
     * 마우스 업 이벤트 처리
     */
    private _onMouseUp(_event: MouseEvent): void {
        this.isDragging = false;
        this.dragStartBlock = null;

        // 네이티브 selection을 확인하여 다중 블록 Range Selection으로 변환
        this._captureNativeSelection();
    }

    /**
     * 브라우저의 네이티브 selection을 MultiBlockSelection으로 변환
     */
    private _captureNativeSelection(): void {
        const selection = window.getSelection();
        console.log("SelectionPlugin._captureNativeSelection: selection=", selection, "isCollapsed=", selection?.isCollapsed);

        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            return;
        }

        const range = selection.getRangeAt(0);

        // 시작과 끝 블록 찾기
        const startBlockEl = getBlockElementOf(range.startContainer as HTMLElement);
        const endBlockEl = getBlockElementOf(range.endContainer as HTMLElement);

        console.log("SelectionPlugin._captureNativeSelection: startBlockEl=", startBlockEl, "endBlockEl=", endBlockEl);

        if (!startBlockEl || !endBlockEl) return;

        const startBlockId = startBlockEl.dataset["blockId"];
        const endBlockId = endBlockEl.dataset["blockId"];

        if (!startBlockId || !endBlockId) return;

        const startBlock = this.editor.blocks.find(b => b.id === startBlockId);
        const endBlock = this.editor.blocks.find(b => b.id === endBlockId);

        if (!startBlock || !endBlock) return;

        console.log("SelectionPlugin._captureNativeSelection: startBlock=", startBlock.id, "endBlock=", endBlock.id);

        // 같은 블록이면 단일 블록 선택이므로 무시
        if (startBlock === endBlock) {
            console.log("SelectionPlugin._captureNativeSelection: same block, ignoring");
            return;
        }

        console.log("SelectionPlugin._captureNativeSelection: setting range selection");

        // 여러 블록에 걸친 selection이면 Range Selection으로 설정
        this.editor.multiSelection.setRangeSelectionFromNative(
            startBlock,
            range.startOffset,
            endBlock,
            range.endOffset
        );

        // 다음 프레임에서 selection 상태 확인
        requestAnimationFrame(() => {
            const selectionAfter = window.getSelection();
            console.log("SelectionPlugin._captureNativeSelection: next frame, selection=", selectionAfter, "isCollapsed=", selectionAfter?.isCollapsed);
        });
    }
}
