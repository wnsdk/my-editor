/**
 * 다중 블록 선택 및 Range Selection을 관리하는 클래스입니다.
 *
 * Selection 유형:
 * 1. Collapsed Selection: 캐럿이 한 위치에 있음 (텍스트 편집 모드)
 * 2. Range Selection: 여러 블록에 걸친 콘텐츠 선택 (Shift+Click, Shift+Arrow)
 * 3. Block Selection: 전체 블록 단위 선택 (Ctrl+Click, Ctrl+A)
 */
import Editor from "./Editor";
import BaseBlock from "../blocks/BaseBlock";
import { BaseBlockData } from "../types";

export interface SelectionRange {
    /** 선택 시작 블록 */
    startBlock: BaseBlock;
    /** 선택 시작 위치 (텍스트 블록의 경우 오프셋, 비텍스트 블록은 0) */
    startOffset: number;
    /** 선택 끝 블록 */
    endBlock: BaseBlock;
    /** 선택 끝 위치 */
    endOffset: number;
}

export type SelectionType = 'collapsed' | 'range' | 'block';

export default class MultiBlockSelection {
    private editor: Editor;

    /** 현재 선택된 블록들의 ID 집합 (Block Selection 모드) */
    private selectedBlockIds: Set<string> = new Set();

    /** Range Selection 상태 */
    private rangeSelection: SelectionRange | null = null;

    /** 현재 선택 유형 */
    private selectionType: SelectionType = 'collapsed';

    /** Range Selection 시작 앵커 */
    private anchorBlock: BaseBlock | null = null;
    private anchorOffset: number = 0;

    constructor(editor: Editor) {
        this.editor = editor;
    }

    /**
     * 현재 선택 유형을 반환합니다.
     */
    getSelectionType(): SelectionType {
        return this.selectionType;
    }

    /**
     * 선택된 블록 ID 목록을 반환합니다.
     */
    getSelectedBlockIds(): string[] {
        return Array.from(this.selectedBlockIds);
    }

    /**
     * 선택된 블록 인스턴스들을 반환합니다.
     */
    getSelectedBlocks(): BaseBlock[] {
        return this.editor.blocks.filter(block =>
            this.selectedBlockIds.has(block.id)
        );
    }

    /**
     * Range Selection 정보를 반환합니다.
     */
    getRangeSelection(): SelectionRange | null {
        return this.rangeSelection;
    }

    /**
     * 선택이 활성화되어 있는지 확인합니다.
     */
    hasSelection(): boolean {
        return this.selectionType !== 'collapsed' &&
               (this.selectedBlockIds.size > 0 || this.rangeSelection !== null);
    }

    /**
     * 단일 블록을 선택합니다 (Block Selection 모드).
     */
    selectBlock(block: BaseBlock, addToSelection: boolean = false): void {
        if (!addToSelection) {
            this.clearSelection();
        }

        this.selectionType = 'block';
        this.selectedBlockIds.add(block.id);
        this._updateBlockSelectionUI();
    }

    /**
     * 블록 선택을 토글합니다 (Ctrl+Click).
     */
    toggleBlockSelection(block: BaseBlock): void {
        this.selectionType = 'block';

        if (this.selectedBlockIds.has(block.id)) {
            this.selectedBlockIds.delete(block.id);
        } else {
            this.selectedBlockIds.add(block.id);
        }

        // 선택된 블록이 없으면 collapsed 상태로
        if (this.selectedBlockIds.size === 0) {
            this.selectionType = 'collapsed';
        }

        this._updateBlockSelectionUI();
    }

    /**
     * 범위 내의 모든 블록을 선택합니다 (Shift+Click).
     */
    selectBlockRange(fromBlock: BaseBlock, toBlock: BaseBlock): void {
        const blocks = this.editor.blocks;
        const fromIndex = blocks.indexOf(fromBlock);
        const toIndex = blocks.indexOf(toBlock);

        if (fromIndex === -1 || toIndex === -1) return;

        const startIndex = Math.min(fromIndex, toIndex);
        const endIndex = Math.max(fromIndex, toIndex);

        this.clearSelection();
        this.selectionType = 'block';

        for (let i = startIndex; i <= endIndex; i++) {
            const block = blocks[i];
            if (block) {
                this.selectedBlockIds.add(block.id);
            }
        }

        this._updateBlockSelectionUI();
    }

    /**
     * Range Selection을 시작합니다 (앵커 설정).
     */
    startRangeSelection(block: BaseBlock, offset: number = 0): void {
        this.anchorBlock = block;
        this.anchorOffset = offset;
        this.selectionType = 'range';
    }

    /**
     * Range Selection을 확장합니다.
     */
    extendRangeSelection(toBlock: BaseBlock, toOffset: number = 0): void {
        if (!this.anchorBlock) {
            this.startRangeSelection(toBlock, toOffset);
            return;
        }

        const blocks = this.editor.blocks;
        const anchorIndex = blocks.indexOf(this.anchorBlock);
        const toIndex = blocks.indexOf(toBlock);

        if (anchorIndex === -1 || toIndex === -1) return;

        // 선택 방향에 따라 start/end 결정
        let startBlock: BaseBlock, startOffset: number;
        let endBlock: BaseBlock, endOffset: number;

        if (anchorIndex < toIndex || (anchorIndex === toIndex && this.anchorOffset <= toOffset)) {
            startBlock = this.anchorBlock;
            startOffset = this.anchorOffset;
            endBlock = toBlock;
            endOffset = toOffset;
        } else {
            startBlock = toBlock;
            startOffset = toOffset;
            endBlock = this.anchorBlock;
            endOffset = this.anchorOffset;
        }

        this.rangeSelection = {
            startBlock,
            startOffset,
            endBlock,
            endOffset
        };

        // 범위 내 모든 블록 선택
        this.selectedBlockIds.clear();
        const rangeStartIndex = blocks.indexOf(startBlock);
        const rangeEndIndex = blocks.indexOf(endBlock);

        for (let i = rangeStartIndex; i <= rangeEndIndex; i++) {
            const block = blocks[i];
            if (block) {
                this.selectedBlockIds.add(block.id);
            }
        }

        this._updateRangeSelectionUI();
    }

    /**
     * 네이티브 selection으로부터 Range Selection을 설정합니다.
     */
    setRangeSelectionFromNative(
        startBlock: BaseBlock,
        startOffset: number,
        endBlock: BaseBlock,
        endOffset: number
    ): void {
        this.selectionType = 'range';
        this.anchorBlock = startBlock;
        this.anchorOffset = startOffset;

        this.rangeSelection = {
            startBlock,
            startOffset,
            endBlock,
            endOffset
        };

        // 범위 내 모든 블록 선택
        this.selectedBlockIds.clear();
        const blocks = this.editor.blocks;
        const rangeStartIndex = blocks.indexOf(startBlock);
        const rangeEndIndex = blocks.indexOf(endBlock);

        for (let i = rangeStartIndex; i <= rangeEndIndex; i++) {
            const block = blocks[i];
            if (block) {
                this.selectedBlockIds.add(block.id);
            }
        }

        // range-selected 클래스를 추가하지 않음
        // 네이티브 selection이 이미 시각적으로 표현하고 있음
        // CSS 클래스를 추가하면 블록 전체가 하이라이트되어 block selection처럼 보임

        console.log("setRangeSelectionFromNative: range selection saved, native selection preserved");
    }

    /**
     * 모든 블록을 선택합니다 (Ctrl+A).
     */
    selectAll(): void {
        this.clearSelection();
        this.selectionType = 'block';

        this.editor.blocks.forEach(block => {
            this.selectedBlockIds.add(block.id);
        });

        this._updateBlockSelectionUI();
    }

    /**
     * 선택을 모두 해제합니다.
     */
    clearSelection(): void {
        console.log("MultiBlockSelection.clearSelection called", new Error().stack);
        this.selectedBlockIds.clear();
        this.rangeSelection = null;
        this.anchorBlock = null;
        this.anchorOffset = 0;
        this.selectionType = 'collapsed';

        this._clearSelectionUI();
    }

    /**
     * 선택된 블록들을 삭제합니다.
     */
    deleteSelectedBlocks(): void {
        if (this.selectedBlockIds.size === 0) return;

        const blocksToDelete = this.getSelectedBlocks();

        blocksToDelete.forEach(block => {
            const index = this.editor.blocks.indexOf(block);
            if (index !== -1) {
                this.editor.blocks.splice(index, 1);
            }
        });

        this.clearSelection();
        this.editor.handleEmptyEditorState();
        this.editor.renderer.render(this.editor.blocks);
        this.editor.saveHistory();
        this.editor.eventBus.emit('document:mutated');
    }

    /**
     * 선택된 콘텐츠를 직렬화합니다 (복사/잘라내기용).
     */
    serializeSelection(): BaseBlockData[] {
        if (this.selectionType === 'block') {
            // Block Selection: 전체 블록 데이터 반환
            return this.getSelectedBlocks().map(block => block.toJSON());
        }

        if (this.selectionType === 'range' && this.rangeSelection) {
            // Range Selection: 부분 콘텐츠 포함
            return this._serializeRangeSelection();
        }

        return [];
    }

    /**
     * Range Selection의 콘텐츠를 직렬화합니다.
     */
    private _serializeRangeSelection(): BaseBlockData[] {
        if (!this.rangeSelection) return [];

        const { startBlock, startOffset, endBlock, endOffset } = this.rangeSelection;
        const blocks = this.editor.blocks;
        const startIndex = blocks.indexOf(startBlock);
        const endIndex = blocks.indexOf(endBlock);

        const result: BaseBlockData[] = [];

        for (let i = startIndex; i <= endIndex; i++) {
            const block = blocks[i];
            if (!block) continue;

            const blockData = block.toJSON();
            const isTextEditable = (block.type === 'text' || block.type === 'list') && 'html' in blockData;

            if (i === startIndex && i === endIndex) {
                // 단일 블록 내 선택
                if (isTextEditable) {
                    const html = (blockData as any).html || '';
                    (blockData as any).html = this._extractTextRange(html, startOffset, endOffset);
                }
            } else if (i === startIndex) {
                // 시작 블록: startOffset부터 끝까지
                if (isTextEditable) {
                    const html = (blockData as any).html || '';
                    (blockData as any).html = this._extractTextRange(html, startOffset, html.length);
                }
            } else if (i === endIndex) {
                // 끝 블록: 처음부터 endOffset까지
                if (isTextEditable) {
                    const html = (blockData as any).html || '';
                    (blockData as any).html = this._extractTextRange(html, 0, endOffset);
                }
            }
            // 중간 블록은 전체 포함

            result.push(blockData);
        }

        return result;
    }

    /**
     * HTML 텍스트에서 특정 범위를 추출합니다.
     */
    private _extractTextRange(html: string, start: number, end: number): string {
        // 간단한 구현: HTML 태그를 고려하지 않고 텍스트만 추출
        // 실제로는 DOM을 파싱하여 정확한 범위를 추출해야 함
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const text = tempDiv.textContent || '';
        return text.substring(start, end);
    }

    /**
     * Block Selection UI를 업데이트합니다.
     */
    private _updateBlockSelectionUI(): void {
        this.editor.blocks.forEach(block => {
            if (block.el) {
                if (this.selectedBlockIds.has(block.id)) {
                    block.el.classList.add('multi-selected');
                } else {
                    block.el.classList.remove('multi-selected');
                }
            }
        });
    }

    /**
     * Range Selection UI를 업데이트합니다.
     */
    private _updateRangeSelectionUI(): void {
        // Range Selection의 경우 선택된 블록에 range-selected 클래스 추가
        this.editor.blocks.forEach(block => {
            if (block.el) {
                if (this.selectedBlockIds.has(block.id)) {
                    block.el.classList.add('range-selected');
                } else {
                    block.el.classList.remove('range-selected');
                }
            }
        });

        // 네이티브 Selection API로 텍스트 범위 선택 시각화
        this._applyNativeRangeSelection();
    }

    /**
     * 네이티브 Selection API를 사용하여 범위 선택을 시각화합니다.
     */
    private _applyNativeRangeSelection(): void {
        if (!this.rangeSelection) return;

        const { startBlock, startOffset, endBlock, endOffset } = this.rangeSelection;

        const nativeSelection = window.getSelection();
        if (!nativeSelection) return;

        nativeSelection.removeAllRanges();

        try {
            const range = document.createRange();

            // 시작 위치 설정 (리스트 블록은 .list-item-content 기준)
            const startEl = this._getEditableRoot(startBlock);
            const startNode = this._getTextNodeAtOffset(startEl, startOffset);
            if (startNode.node) {
                range.setStart(startNode.node, startNode.offset);
            } else if (startEl) {
                range.setStart(startEl, 0);
            }

            // 끝 위치 설정
            const endEl = this._getEditableRoot(endBlock);
            const endNode = this._getTextNodeAtOffset(endEl, endOffset);
            if (endNode.node) {
                range.setEnd(endNode.node, endNode.offset);
            } else if (endEl) {
                range.setEndAfter(endEl);
            }

            nativeSelection.addRange(range);
        } catch (e) {
            console.warn('Failed to apply native range selection:', e);
        }
    }

    /**
     * 블록의 편집 가능한 루트 요소를 반환합니다.
     * 리스트 블록은 .list-item-content, 텍스트 블록은 el 자체를 반환합니다.
     */
    private _getEditableRoot(block: BaseBlock): HTMLElement | null {
        if (!block.el) return null;
        if (block.type === 'list') {
            return block.el.querySelector('.list-item-content') as HTMLElement | null;
        }
        return block.el;
    }

    /**
     * 특정 오프셋에 해당하는 텍스트 노드를 찾습니다.
     */
    private _getTextNodeAtOffset(element: HTMLElement | null, targetOffset: number): { node: Node | null; offset: number } {
        if (!element) return { node: null, offset: 0 };

        let currentOffset = 0;

        function traverse(node: Node): { node: Node | null; offset: number } | null {
            if (node.nodeType === Node.TEXT_NODE) {
                const len = node.textContent?.length ?? 0;
                if (currentOffset + len >= targetOffset) {
                    return { node, offset: targetOffset - currentOffset };
                }
                currentOffset += len;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (const child of Array.from(node.childNodes)) {
                    const result = traverse(child);
                    if (result) return result;
                }
            }
            return null;
        }

        const result = traverse(element);
        return result || { node: element, offset: 0 };
    }

    /**
     * Selection UI를 초기화합니다.
     */
    private _clearSelectionUI(): void {
        this.editor.blocks.forEach(block => {
            if (block.el) {
                block.el.classList.remove('multi-selected', 'range-selected');
            }
        });
    }

    /**
     * 리소스를 정리합니다.
     */
    destroy(): void {
        this.clearSelection();
    }
}
