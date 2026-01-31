/**
 * 에디터의 현재 선택 영역(Selection)과 캐럿(Caret) 위치를 관리하고 제어하는 클래스입니다.
 * DOM Selection API를 추상화하여 에디터의 특정 요구사항에 맞게 기능을 제공합니다.
 */
import { getBlockElementOf } from "../utils/dom.js";
import Editor from "./Editor";
import BaseBlock from "../blocks/BaseBlock"; // getBlockElementOf 임포트 추가

export default class Selection {
    private editor: Editor;

    private savedRange: Range | null = null;
    savedCaretClientX: number | null = null;
    savedCaretClientY: number | null = null;

    constructor(editor: Editor) {
        this.editor = editor;
    }

    /**
     * 브라우저의 네이티브 Selection 객체를 반환합니다.
     */
    getNativeSelection(): globalThis.Selection | null {
        return window.getSelection();
    }

    /**
     * 현재 캐럿이 위치하거나 선택 영역이 포함된 블록 모델을 반환합니다.
     */
    getCurrentBlock(): BaseBlock | null {
        const nativeSelection = this.getNativeSelection();
        if (!nativeSelection || nativeSelection.rangeCount === 0) {
            return null;
        }

        const node = nativeSelection.anchorNode;
        if (!node) return null;

        const blockEl = getBlockElementOf(node);
        if (!blockEl) return null;

        const blockId = blockEl.dataset["blockId"];
        if (!blockId) return null;

        return this.editor.blocks.find(b => b.id === blockId) ?? null;
    }

    /**
     * 현재 캐럿의 위치(Range 객체 및 화면상 좌표)를 저장합니다.
     */
    saveCaretPosition(): void {
        const nativeSelection = this.getNativeSelection();
        if (nativeSelection && nativeSelection.rangeCount > 0) {
            this.savedRange = nativeSelection.getRangeAt(0).cloneRange();
            const rect = this.savedRange.getBoundingClientRect();
            this.savedCaretClientX = rect.left + rect.width / 2;
            this.savedCaretClientY = rect.top + rect.height / 2;
        } else {
            this.savedRange = null;
            this.savedCaretClientX = null;
            this.savedCaretClientY = null;
        }
    }

    /**
     * 저장된 캐럿 위치를 지정된 요소 내에서 복원합니다.
     */
    restoreCaretPosition(targetElement: HTMLElement): boolean {
        if (
            this.savedRange &&
            targetElement.contains(this.savedRange.startContainer) &&
            targetElement.contains(this.savedRange.endContainer)
        ) {
            const nativeSelection = this.getNativeSelection();
            if (!nativeSelection) return false;

            nativeSelection.removeAllRanges();
            nativeSelection.addRange(this.savedRange);
            return true;
        }
        return false;
    }

    /**
     * 주어진 요소의 시작 부분에 캐럿을 배치합니다.
     */
    setRangeAtStart(el: HTMLElement): void {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(true); // 시작 부분으로 collapse
        const nativeSelection = this.getNativeSelection();
        nativeSelection?.removeAllRanges();
        nativeSelection?.addRange(range);
    }

    /**
     * 주어진 요소의 끝 부분에 캐럿을 배치합니다.
     */
    setRangeAtEnd(el: HTMLElement): void {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false); // 끝 부분으로 collapse
        const nativeSelection = this.getNativeSelection();
        nativeSelection?.removeAllRanges();
        nativeSelection?.addRange(range);
    }

    /**
     * 주어진 요소 내에서 특정 수평/수직 좌표(clientX, clientY)에 가장 가까운 위치로 캐럿을 이동합니다.
     */
    setRangeAtNearestPoint(element: HTMLElement, clientX: number, clientY: number): boolean {
        if (!element) return false;

        const nativeSelection = this.getNativeSelection();
        if (!nativeSelection) return false;

        nativeSelection.removeAllRanges();
        let range: Range | null = null;

        // document.caretPositionFromPoint는 Firefox에서 지원
        // document.caretRangeFromPoint는 Webkit 기반 브라우저에서 지원
        if (document.caretPositionFromPoint) {
            const pos = document.caretPositionFromPoint(clientX, clientY);
            if (pos && element.contains(pos.offsetNode)) {
                range = document.createRange();
                range.setStart(pos.offsetNode, pos.offset);
                range.collapse(true);
            }
        } else if (document.caretRangeFromPoint) {
            const tempRange = document.caretRangeFromPoint(clientX, clientY);
            if (tempRange && element.contains(tempRange.startContainer)) {
                range = tempRange;
            }
        }

        if (range) {
            nativeSelection.addRange(range);
            return true;
        } else {
            // 캐럿 위치를 찾지 못하면 최후의 수단으로 블록의 시작에 캐럿 배치
            this.setRangeAtStart(element);
            return false;
        }
    }

    /**
     * 주어진 요소 내의 특정 텍스트 오프셋에 캐럿을 배치합니다.
     * HTML 구조 내에서 텍스트 노드를 탐색하여 정확한 위치를 찾습니다.
     */
    setRange(element: HTMLElement, offset: number): void {
        const nativeSelection = window.getSelection();
        if (!nativeSelection) return;

        const range = document.createRange();
        let currentOffset = 0;
        let found = false;

        /**
         * DOM 노드를 재귀적으로 탐색하여 지정된 오프셋에 해당하는 텍스트 노드와 오프셋을 찾습니다.
         */
        function traverse(node: Node): boolean {
            if (node.nodeType === Node.TEXT_NODE) {
                const len = node.textContent?.length ?? 0;
                if (currentOffset + len >= offset) {
                    range.setStart(node, offset - currentOffset);
                    range.collapse(true);
                    found = true;
                    return true;
                }
                currentOffset += len;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (const child of Array.from(node.childNodes)) {
                    if (traverse(child)) return true;
                }
            }
            return false;
        }

        // 요소의 자식 노드부터 탐색 시작
        for (const child of Array.from(element.childNodes)) {
            if (traverse(child)) break;
        }

        if (!found) {
            // 오프셋을 찾지 못하면 요소의 끝에 배치 (예: 오프셋이 실제 텍스트 길이보다 긴 경우)
            this.setRangeAtEnd(element);
        }

        nativeSelection.removeAllRanges();
        nativeSelection.addRange(range);
    }
}
