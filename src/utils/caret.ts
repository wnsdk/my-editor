// utils/caret.ts

/**
 * 주어진 요소 내에서 현재 캐럿의 오프셋(텍스트 인덱스)을 가져옵니다.
 * @param el - 캐럿 오프셋을 계산할 대상 요소.
 * @returns 요소 내 캐럿의 텍스트 오프셋. 선택 영역이 없으면 0을 반환합니다.
 */
export function getCaretOffsetWithin(el: HTMLElement): number {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
        return 0;
    }

    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(el);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
}

export interface CaretCoordinates {
    left: number;
    top: number;
}

/**
 * 현재 캐럿의 화면상 좌표(left, top)를 가져옵니다.
 * @returns 캐럿의 좌표 객체 또는 선택 영역이 없으면 null.
 */
export function getCaretCoordinates(): CaretCoordinates | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
        return null;
    }

    const range = sel.getRangeAt(0).cloneRange();
    let rect: DOMRect | null = null;

    // 캐럿이 텍스트 노드의 시작에 있거나 빈 요소 내에 있을 경우 getClientRects()가 비어있을 수 있음.
    // 이 경우 getBoundingClientRect()를 사용하여 더 견고하게 처리합니다.
    if (range.getClientRects().length > 0) {
        rect = range.getClientRects()[0] || null;
    } else if (range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
        // 텍스트 노드 내에서 캐럿이 0 오프셋에 있는 경우
        // 임시로 범위를 확장하여 rect를 얻은 후 다시 축소
        const textContent = range.startContainer.textContent;
        if (range.startOffset === 0 && textContent && textContent.length > 0) {
            range.setEnd(range.startContainer, 1);
            rect = range.getBoundingClientRect();
            range.collapse(true); // 원래대로 축소
        } else if (range.startOffset > 0) {
            range.setStart(range.startContainer, range.startOffset - 1);
            rect = range.getBoundingClientRect();
            range.collapse(false); // 원래대로 축소
        }
    }

    // 여전히 rect를 얻지 못했다면, range.getBoundingClientRect()를 시도
    if (!rect) {
        rect = range.getBoundingClientRect();
    }

    // rect가 유효한지 확인 (너비나 높이가 0이 아닌지)
    if (rect && (rect.width > 0 || rect.height > 0)) {
        return { left: rect.left, top: rect.top };
    }

    return null;
}
