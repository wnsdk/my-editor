import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
import BaseBlock from "../../blocks/BaseBlock";
import TextBlock from "../../blocks/TextBlock";
import {createBlock} from "../../blocks/BlockFactory";
import { isListBlock } from "../../utils/typeGuards";
import Sanitizer from "../../core/Sanitizer";

/**
 * 캐럿 위치 판단을 위한 오차 범위 (픽셀).
 */
const CARET_RECT_TOLERANCE = 5;

/**
 * 키보드 입력(엔터, 백스페이스, 딜리트, 방향키)을 처리하여 에디터의 블록을 조작하는 플러그인입니다.
 */
export default class KeyHandlerPlugin extends Plugin {

    constructor(editor: Editor) {
        super(editor);
    }

    /**
     * 플러그인을 초기화하고 에디터 루트에 키다운 이벤트 리스너를 등록합니다.
     */
    initialize() {
        this.editor.root.addEventListener("keydown", this._onKeyDown.bind(this));
    }



    /* ================================
     * Key dispatcher
     * ================================ */

    private _onKeyDown(event: KeyboardEvent) {
        if (event.isComposing) return;
        if (this.editor.readOnly) return;

        const { key } = event;
        const currentBlockWithCaret = this.editor.selection.getCurrentBlock();
        const selectedBlock = this.editor.getSelectedBlock();

        // 텍스트 블록이 아닌 블록(미디어 블록 등)이 선택된 상태에서 삭제 키 처리
        if (selectedBlock && selectedBlock.type !== 'text') {
            if (key === 'Backspace' || key === 'Delete') {
                event.preventDefault();
                const currentIndex = this.editor.blocks.indexOf(selectedBlock);
                this._handleBlockDeletionAndFocus(selectedBlock, currentIndex);
                return;
            }
        }

        const activeBlock = currentBlockWithCaret || selectedBlock;
        if (!activeBlock) return;

        if (key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            this._handleEnter(event, activeBlock);
        } else if (key === "Backspace") {
            this._handleBackspace(event, activeBlock);
        } else if (key === "Delete") {
            this._handleDelete(event, activeBlock);
        } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
            this._handleArrowKeys(event, activeBlock);
        }
    }




    /* ================================
     * Enter
     * ================================ */

    /**
     * 새 텍스트 블록을 생성하거나 블록을 분할합니다.
     */
    private _handleEnter(event: KeyboardEvent, block: BaseBlock) {
        if (block.type === "list") {
            this._handleListEnter(event, block);

        } else if (block.type !== "text") {
            // 텍스트 블록이 아닌 경우 → 디폴트 블록 삽입
            const newBlock = this.editor.createDefaultBlock();
            if (!newBlock || !newBlock.el) return;

            this.editor.addBlockAfter(block, newBlock);
            this.editor.selection.setRangeAtStart(newBlock.el);
            this.editor.saveHistory();

        } else {
            // 텍스트 블록인 경우 → 블록 분할
            const textBlock = block as TextBlock;
            if (!textBlock.el) return;

            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;

            const range = sel.getRangeAt(0);

            const afterRange = range.cloneRange();
            afterRange.selectNodeContents(textBlock.el);
            afterRange.setStart(range.endContainer, range.endOffset);

            const fragment = afterRange.extractContents();

            const tempDiv = document.createElement("div");
            tempDiv.appendChild(fragment);

            // Sanitizer를 사용하여 중첩된 블록 요소 제거
            const htmlContent = tempDiv.innerHTML || "";
            const sanitizedHtml = Sanitizer.clean(htmlContent);
            const newBlock = this.editor.createTextBlock(sanitizedHtml);
            this.editor.addBlockAfter(textBlock, newBlock);

            // addBlockAfter가 render()를 호출하므로 DOM이 업데이트된 후 포커스 설정
            requestAnimationFrame(() => {
                this.editor.selectAndFocusBlock(newBlock);
                if (newBlock.el) {
                    this.editor.selection.setRangeAtStart(newBlock.el);
                }
            });
        }
    }


    /**
     * 리스트 블록에서의 엔터 입력을 처리합니다.
     */
    private _handleListEnter(event: KeyboardEvent, block: BaseBlock) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const node = range.startContainer;

        // li 대신 .list-item-content 탐색
        const itemContent = node.nodeType === Node.ELEMENT_NODE
            ? (node as HTMLElement).closest('.list-item-content')
            : node.parentElement?.closest('.list-item-content');

        if (!itemContent) return;

        const isItemEmpty = itemContent.textContent?.trim().length === 0;

        if (isItemEmpty) {
            event.preventDefault();

            // 리스트 블록이 비어있으면 텍스트 블록으로 전환
            const newTextBlock = this.editor.createTextBlock("");
            const index = this.editor.blocks.indexOf(block);
            this.editor.blocks.splice(index, 1, newTextBlock);
            this.editor.renderer.render(this.editor.blocks);

            // render 후 DOM이 완전히 업데이트된 다음 선택 및 포커스 설정
            requestAnimationFrame(() => {
                this.editor.selectAndFocusBlock(newTextBlock);

                // 명시적으로 캐럿 위치 설정
                if (newTextBlock.el) {
                    this.editor.selection.setRangeAtStart(newTextBlock.el);
                }
            });

            this._updateSequentialListNumbers(); // 번호 재계산
            this.editor.saveHistory();
        } else {
            // 리스트 아이템 내에서 엔터 -> 리스트 분할
            event.preventDefault();

            const afterRange = range.cloneRange();
            afterRange.selectNodeContents(itemContent);
            afterRange.setStart(range.endContainer, range.endOffset);
            const fragment = afterRange.extractContents();
            const tempDiv = document.createElement("div");
            tempDiv.appendChild(fragment);

            // Sanitizer를 사용하여 중첩된 블록 요소 제거
            const sanitizedHtml = Sanitizer.clean(tempDiv.innerHTML || "");

            const listBlock = block as any;
            const newListBlock = createBlock("list", {
                type: 'list',
                style: listBlock.style,
                html: sanitizedHtml
            }, {
                config: {},
                api: {
                    removeBlock: (b) => this.editor.removeBlock(b),
                    editor: this.editor
                }
            }) as any;

            this.editor.addBlockAfter(block, newListBlock);
            this._updateSequentialListNumbers(); // 전체 리스트 번호 갱신
            this.editor.selectAndFocusBlock(newListBlock);

            const firstContent = newListBlock.el.querySelector('.list-item-content');
            if (firstContent) {
                this.editor.selection.setRangeAtStart(firstContent);
            }

            this.editor.saveHistory();
        }
    }

    /**
     * 모든 리스트 블록을 순회하며 순서가 있는 리스트의 번호를 갱신합니다.
     */
    private _updateSequentialListNumbers() {
        this.editor.blocks.forEach(block => {
            if (isListBlock(block)) {
                block.refreshListContent();
            }
        });
    }

    /* ================================
     * Arrow keys
     * ================================ */

    /**
     * 방향키 이벤트를 처리하여 블록 간 또는 블록 내 캐럿을 이동합니다.
     */
    private _handleArrowKeys(event: KeyboardEvent, block: BaseBlock): void {
        const key = event.key;
        const currentIndex = this.editor.blocks.indexOf(block);

        const isUp = key === "ArrowUp";
        const isDown = key === "ArrowDown";
        const isLeft = key === "ArrowLeft";
        const isRight = key === "ArrowRight";

        let shouldMoveBlock = false;
        let targetIndex = -1;

        this.editor.selection.saveCaretPosition();
        const savedClientX = this.editor.selection.savedCaretClientX;
        const savedCaretY = this.editor.selection.savedCaretClientY;

        if (block.type === "text" || block.type === "list") {
            if (!block.el) {
                shouldMoveBlock = true;
            } else {
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) {
                    shouldMoveBlock = true;
                } else {
                    const range = sel.getRangeAt(0);
                    if (this._isCaretAtBlockBoundary(range, block.el, isUp, isDown, isLeft, isRight)) {
                        shouldMoveBlock = true;
                    }
                }
            }
        } else {
            shouldMoveBlock = true;
        }

        if (shouldMoveBlock) {
            event.preventDefault();

            if (isUp || isLeft) targetIndex = currentIndex - 1;
            if (isDown || isRight) targetIndex = currentIndex + 1;

            const targetBlock = this.editor.blocks[targetIndex];

            if (targetBlock && targetBlock.el) {
                this.editor.selectAndFocusBlock(targetBlock);
                if (targetBlock.type === 'text') {
                    if ((isUp || isDown) && savedClientX !== null && savedCaretY !== null) {
                        this.editor.selection.setRangeAtNearestPoint(targetBlock.el, savedClientX, savedCaretY);
                    } else {
                        const restored = this.editor.selection.restoreCaretPosition(targetBlock.el);
                        if (!restored) {
                            if (isUp || isLeft) this.editor.selection.setRangeAtStart(targetBlock.el);
                            if (isDown || isRight) this.editor.selection.setRangeAtEnd(targetBlock.el);
                        }
                    }
                }
            }
        }
    }



    /* ================================
     * Backspace / Delete
     * ================================ */

    /**
     * 백스페이스 키 이벤트를 처리하여 블록을 삭제하거나 병합합니다.
     */
    private _handleBackspace(event: KeyboardEvent, block: BaseBlock): void {
        if (block.type !== "text") return;

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);

        const isAtStart = range.startOffset === 0 && range.endOffset === 0;
        const currentIndex = this.editor.blocks.indexOf(block);
        const prevBlock = this.editor.blocks[currentIndex - 1] ?? null;

        if (!isAtStart) return;

        // 에디터가 비어있는 상태 (텍스트 블록 1개만 있고 비어있음)
        if (
            this.editor.blocks.length === 1 &&
            block.el &&
            block.isEmpty()
        ) {
            event.preventDefault();
            return;
        }

        event.preventDefault();

        // 현재 블록이 비어있고 이전 블록이 있는 경우 → 삭제
        if (block.el && block.isEmpty() && prevBlock) {
            this._handleBlockDeletionAndFocus(block, currentIndex, "prev");
            this.editor.saveHistory();
            return;
        }

        // 이전 블록이 텍스트 블록인 경우 → 병합
        if (prevBlock && prevBlock.type === "text" && block.el && prevBlock.el) {
            const currentBlockContent = block.el.innerHTML;
            const prevBlockContentLength = prevBlock.el.textContent?.length ?? 0;

            prevBlock.el.innerHTML =
                prevBlock.el.innerHTML.replace(/<br>$/, "") +
                currentBlockContent;

            // TextBlock 전용 필드 접근 (타입 안전)
            if ("text" in prevBlock) {
                (prevBlock as any).text = prevBlock.el.innerHTML;
            }

            this.editor.removeBlock(block);
            this.editor.renderer.render(this.editor.blocks);

            this.editor.selectAndFocusBlock(prevBlock);
            this.editor.selection.setRange(prevBlock.el, prevBlockContentLength);
            this.editor.saveHistory();
            return;
        }

        // 이전 블록이 텍스트가 아닌 경우 → 포커스 이동
        if (prevBlock && prevBlock.type !== "text") {
            this.editor.selectAndFocusBlock(prevBlock);
        }
    }



    /**
     * 딜리트 키 이벤트를 처리하여 블록을 삭제하거나 병합합니다.
     */
    private _handleDelete(event: KeyboardEvent, block: BaseBlock): void {
        if (block.type !== "text") return;

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        if (!block.el) return;

        const blockTextLength = block.el.innerText?.length ?? 0;
        const isAtEnd = range.endOffset === blockTextLength;

        if (!isAtEnd) return;

        const currentIndex = this.editor.blocks.indexOf(block);
        const nextBlock = this.editor.blocks[currentIndex + 1] ?? null;

        // 에디터가 비어있는 상태 (텍스트 블록 1개만 있고 비어있음)
        if (
            this.editor.blocks.length === 1 &&
            block.isEmpty()
        ) {
            event.preventDefault();
            return;
        }

        event.preventDefault();

        // 현재 블록이 비어있고 다음 블록이 있는 경우 → 삭제
        if (block.isEmpty() && nextBlock) {
            this._handleBlockDeletionAndFocus(block, currentIndex, "next");
            this.editor.saveHistory();
            return;
        }

        // 다음 블록이 텍스트 블록인 경우 → 병합
        if (nextBlock && nextBlock.type === "text" && nextBlock.el) {
            const currentBlockContentLength =
                block.el.textContent?.length ?? 0;

            const nextBlockContent = nextBlock.el.innerHTML;

            block.el.innerHTML =
                block.el.innerHTML.replace(/<br>$/, "") + nextBlockContent;

            // TextBlock 전용 필드 안전 처리
            if ("text" in block) {
                (block as any).text = block.el.innerHTML;
            }

            this.editor.removeBlock(nextBlock);
            this.editor.renderer.render(this.editor.blocks);

            this.editor.selectAndFocusBlock(block);
            this.editor.selection.setRange(block.el, currentBlockContentLength);
            this.editor.saveHistory();
            return;
        }

        // 다음 블록이 텍스트가 아닌 경우 → 포커스 이동
        if (nextBlock && nextBlock.type !== "text") {
            this.editor.selectAndFocusBlock(nextBlock);
        }
    }



    /* ================================
     * Shared
     * ================================ */

    /**
     * 블록 삭제 후 적절한 블록으로 포커스를 이동하는 헬퍼 메서드입니다.
     */
    private _handleBlockDeletionAndFocus(
        blockToDelete: BaseBlock,
        currentIndex: number,
        focusDirection = 'auto'
    ): void {
        this.editor.removeBlock(blockToDelete);

        if (this.editor.blocks.length === 0) {
            this.editor.handleEmptyEditorState()
            return;
        }

        let targetBlock = null;
        if (focusDirection === 'prev') {
            targetBlock = this.editor.blocks[currentIndex - 1];
        } else if (focusDirection === 'next') {
            targetBlock = this.editor.blocks[currentIndex];
        } else {
            targetBlock = this.editor.blocks[currentIndex] || this.editor.blocks[currentIndex - 1];
        }

        if (targetBlock && targetBlock.el) {
            this.editor.selectAndFocusBlock(targetBlock);
            if (targetBlock.type === 'text') {
                if (focusDirection === 'prev' || focusDirection === 'auto') {
                    this.editor.selection.setRangeAtEnd(targetBlock.el);
                } else if (focusDirection === 'next') {
                    this.editor.selection.setRangeAtStart(targetBlock.el);
                }
            }
        }
    }



    /**
     * 캐럿이 현재 텍스트 블록의 경계(맨 위/아래 라인, 맨 왼쪽/오른쪽 끝)에 있는지 확인합니다.
     */
    private _isCaretAtBlockBoundary(
        range: Range,
        blockEl: HTMLElement,
        isUp: boolean,
        isDown: boolean,
        isLeft: boolean,
        isRight: boolean
    ): boolean {
        const blockRect = blockEl.getBoundingClientRect();
        const caretRect = range.getBoundingClientRect();

        // 1. 수직 경계 검사 (맨 위줄/맨 아래줄)
        const isAtTopLine = (caretRect.top - blockRect.top) <= CARET_RECT_TOLERANCE;
        const isAtBottomLine = (blockRect.bottom - caretRect.bottom) <= CARET_RECT_TOLERANCE;

        // 2. 수평 경계 검사 (전체 블록의 시작/끝)
        const tempRange = document.createRange();
        tempRange.selectNodeContents(blockEl);

        // 캐럿이 블록의 완전한 시작점인지 확인
        const isAtStartOfBlock = range.compareBoundaryPoints(Range.START_TO_START, tempRange) === 0;

        // 캐럿이 블록의 완전한 끝점인지 확인
        tempRange.collapse(false);
        const isAtEndOfBlock = range.compareBoundaryPoints(Range.END_TO_END, tempRange) === 0;

        if (isUp && isAtTopLine) return true;
        if (isDown && isAtBottomLine) return true;
        if (isLeft && isAtStartOfBlock) return true;
        if (isRight && isAtEndOfBlock) return true;

        return false;
    }

}
