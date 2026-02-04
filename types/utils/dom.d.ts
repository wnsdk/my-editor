/**
 * 주어진 DOM 노드에서 가장 가까운 블록 요소를 찾습니다.
 * 블록 요소는 'data-block-id' 속성을 가집니다.
 * @param node - 검색을 시작할 DOM 노드.
 * @returns 가장 가까운 블록 요소 또는 찾지 못한 경우 null.
 */
export declare function getBlockElementOf(node: Node | null): HTMLElement | null;
/**
 * 주어진 요소에 블록 ID 데이터 속성을 설정합니다.
 * @param el - 블록 ID를 설정할 요소.
 * @param id - 설정할 블록 ID.
 */
export declare function setBlockId(el: HTMLElement, id: string): void;
/**
 * 삭제 버튼 요소를 생성하고 반환합니다.
 * @returns 삭제 버튼 요소.
 */
export declare function createDeleteButton(): HTMLButtonElement;
