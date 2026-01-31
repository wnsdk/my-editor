// utils/dom.js

/**
 * 블록 요소를 찾는 데 사용되는 데이터 속성 이름입니다.
 * @type {string}
 */
const BLOCK_ID_DATA_ATTRIBUTE = 'blockId';

/**
 * 삭제 버튼에 사용되는 SVG 아이콘 문자열입니다.
 * @type {string}
 */
const DELETE_ICON_SVG = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.6056 12L3 4.39436L4.39436 3L12 10.6056L19.6056 3L21 4.39436L13.3944 12L21 19.6056L19.6056 21L12 13.3944L4.39436 21L3 19.6056L10.6056 12Z" fill="#fff"/>
    </svg>
`;

/**
 * 주어진 DOM 노드에서 가장 가까운 블록 요소를 찾습니다.
 * 블록 요소는 'data-block-id' 속성을 가집니다.
 * @param {Node} node - 검색을 시작할 DOM 노드.
 * @returns {HTMLElement|null} 가장 가까운 블록 요소 또는 찾지 못한 경우 null.
 */
export function getBlockElementOf(node) {
    if (!node) {
        return null;
    }
    let el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    while (el) {
        if (el.dataset && el.dataset[BLOCK_ID_DATA_ATTRIBUTE]) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}

/**
 * 주어진 요소에 블록 ID 데이터 속성을 설정합니다.
 * @param {HTMLElement} el - 블록 ID를 설정할 요소.
 * @param {string} id - 설정할 블록 ID.
 */
export function setBlockId(el, id) {
    el.dataset[BLOCK_ID_DATA_ATTRIBUTE] = id;
}

/**
 * 삭제 버튼 요소를 생성하고 반환합니다.
 * @returns {HTMLButtonElement} 삭제 버튼 요소.
 */
export function createDeleteButton() {
    const btn = document.createElement('button');
    btn.classList.add('delete-media-btn');
    btn.innerHTML = DELETE_ICON_SVG;
    return btn;
}
