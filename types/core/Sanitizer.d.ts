/**
 * 붙여넣기된 HTML 콘텐츠에서 허용되지 않은 태그나 위험한 속성을 제거하여 보안을 유지하고
 * 에디터의 콘텐츠 무결성을 보장하는 유틸리티 클래스입니다.
 */
export default class Sanitizer {
    /**
     * HTML 문자열 또는 일반 텍스트를 정리(Sanitize)합니다.
     * 허용되지 않는 태그와 위험한 속성을 제거합니다.
     * @param htmlOrText - 정리할 HTML 문자열 또는 일반 텍스트.
     * @returns 정리된 HTML 문자열.
     */
    static clean(htmlOrText: string): string;
    /**
     * DOM 트리를 순회하며 노드를 정리합니다.
     * @param node - 순회를 시작할 DOM 노드.
     */
    private static _traverseAndSanitize;
    /**
     * 주어진 요소에서 안전하지 않은 속성을 제거합니다.
     * @param element - 속성을 정리할 요소.
     */
    private static _removeUnsafeAttributes;
    /**
     * URL이 안전한지 검증합니다.
     * javascript:, vbscript:, data: 등의 위험한 프로토콜을 차단합니다.
     * @param url - 검증할 URL.
     * @returns URL이 안전하면 true, 그렇지 않으면 false.
     */
    private static _isValidUrl;
    /**
     * 일반 텍스트를 HTML 엔티티로 이스케이프합니다.
     * @param text - 이스케이프할 일반 텍스트.
     * @returns HTML 엔티티로 이스케이프된 문자열.
     */
    private static _escapeHtml;
}
