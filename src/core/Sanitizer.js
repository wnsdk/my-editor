/**
 * 붙여넣기된 HTML 콘텐츠에서 허용되지 않은 태그나 위험한 속성을 제거하여 보안을 유지하고
 * 에디터의 콘텐츠 무결성을 보장하는 유틸리티 클래스입니다.
 */

/**
 * 허용되는 HTML 태그 목록입니다. 대문자로 정의됩니다.
 * @type {Set<string>}
 */
const ALLOWED_TAGS = new Set([
    "B", "I", "U", "STRONG", "EM", "A", "SPAN", "BR", "CODE"
]);

/**
 * 블록 레벨 태그 목록 (붙여넣기 시 제거되어야 함)
 * @type {Set<string>}
 */
const BLOCK_LEVEL_TAGS = new Set([
    "DIV", "P", "UL", "OL", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE"
]);

/**
 * 허용되는 HTML 속성 목록입니다.
 * @type {Set<string>}
 */
const ALLOWED_ATTRIBUTES = new Set([
    "href", "target", "rel", "class", "id", "data-block-id", "data-img-action", "data-block-move" // 필요한 속성 추가
]);

export default class Sanitizer {
    /**
     * HTML 문자열 또는 일반 텍스트를 정리(Sanitize)합니다.
     * 허용되지 않는 태그와 위험한 속성을 제거합니다.
     * @param {string} htmlOrText - 정리할 HTML 문자열 또는 일반 텍스트.
     * @returns {string} 정리된 HTML 문자열.
     */
    static clean(htmlOrText) {
        // 단순 텍스트면 HTML 엔티티로 이스케이프
        if (!htmlOrText || !htmlOrText.includes("<")) {
            return Sanitizer._escapeHtml(htmlOrText || "");
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlOrText, "text/html");

        if (!doc || !doc.body) {
            return "";
        }

        Sanitizer._traverseAndSanitize(doc.body);

        // _traverseAndSanitize가 body를 수정했을 수 있으므로 다시 체크
        if (!doc.body) {
            return "";
        }

        return doc.body.innerHTML || "";
    }

    /**
     * DOM 트리를 순회하며 노드를 정리합니다.
     * @param {HTMLElement} node - 순회를 시작할 DOM 노드.
     * @private
     */
    static _traverseAndSanitize(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName;

            // 블록 레벨 태그 처리: 내용은 유지하되 태그는 제거하고 <br>로 구분
            if (BLOCK_LEVEL_TAGS.has(tagName)) {
                const parent = node.parentNode;
                if (parent) {
                    // 자식 노드를 부모에게 옮김
                    while (node.firstChild) {
                        parent.insertBefore(node.firstChild, node);
                    }
                    // 블록 레벨 요소 뒤에 <br> 추가 (새 줄 표시)
                    const br = document.createElement("br");
                    parent.insertBefore(br, node);
                    parent.removeChild(node);
                }
                return;
            }

            // 허용되지 않는 태그 제거
            if (!ALLOWED_TAGS.has(tagName)) {
                const parent = node.parentNode;
                if (parent) {
                    // 자식 노드를 부모에게 옮긴 후 현재 노드 제거
                    while (node.firstChild) {
                        parent.insertBefore(node.firstChild, node);
                    }
                    parent.removeChild(node);
                }
                return; // 현재 노드가 제거되었으므로 더 이상 자식 노드를 순회할 필요 없음
            }

            // 위험한 속성 제거
            Sanitizer._removeUnsafeAttributes(node);
        }

        // 자식 노드 순회 (노드가 제거되지 않은 경우에만)
        // NodeList는 live이므로 Array.from으로 복사하여 순회
        Array.from(node.childNodes).forEach(child => Sanitizer._traverseAndSanitize(child));
    }

    /**
     * 주어진 요소에서 안전하지 않은 속성을 제거합니다.
     * @param {HTMLElement} element - 속성을 정리할 요소.
     * @private
     */
    static _removeUnsafeAttributes(element) {
        Array.from(element.attributes).forEach(attr => {
            const attrName = attr.name.toLowerCase(); // 속성 이름은 소문자로 비교

            // 'on'으로 시작하는 이벤트 핸들러 속성 제거 (예: onclick, onerror)
            if (attrName.startsWith("on")) {
                element.removeAttribute(attr.name);
            }
            // 'style' 속성 제거 (인라인 스타일은 보안 및 일관성 문제 유발 가능)
            else if (attrName === "style") {
                element.removeAttribute(attr.name);
            }
            // 허용되지 않는 다른 속성 제거
            else if (!ALLOWED_ATTRIBUTES.has(attrName)) {
                element.removeAttribute(attr.name);
            }
        });
    }

    /**
     * 일반 텍스트를 HTML 엔티티로 이스케이프합니다.
     * @param {string} text - 이스케이프할 일반 텍스트.
     * @returns {string} HTML 엔티티로 이스케이프된 문자열.
     * @private
     */
    static _escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}
