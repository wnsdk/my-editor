/**
 * 주어진 요소 내에서 현재 캐럿의 오프셋(텍스트 인덱스)을 가져옵니다.
 * @param el - 캐럿 오프셋을 계산할 대상 요소.
 * @returns 요소 내 캐럿의 텍스트 오프셋. 선택 영역이 없으면 0을 반환합니다.
 */
export declare function getCaretOffsetWithin(el: HTMLElement): number;
export interface CaretCoordinates {
    left: number;
    top: number;
}
/**
 * 현재 캐럿의 화면상 좌표(left, top)를 가져옵니다.
 * @returns 캐럿의 좌표 객체 또는 선택 영역이 없으면 null.
 */
export declare function getCaretCoordinates(): CaretCoordinates | null;
