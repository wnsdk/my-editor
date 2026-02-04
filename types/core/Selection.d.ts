import Editor from "./Editor";
import BaseBlock from "../blocks/BaseBlock";
export default class Selection {
    private editor;
    private savedRange;
    savedCaretClientX: number | null;
    savedCaretClientY: number | null;
    constructor(editor: Editor);
    /**
     * 브라우저의 네이티브 Selection 객체를 반환합니다.
     */
    getNativeSelection(): globalThis.Selection | null;
    /**
     * 현재 캐럿이 위치하거나 선택 영역이 포함된 블록 모델을 반환합니다.
     */
    getCurrentBlock(): BaseBlock | null;
    /**
     * 현재 캐럿의 위치(Range 객체 및 화면상 좌표)를 저장합니다.
     */
    saveCaretPosition(): void;
    /**
     * 저장된 캐럿 위치를 지정된 요소 내에서 복원합니다.
     */
    restoreCaretPosition(targetElement: HTMLElement): boolean;
    /**
     * 주어진 요소의 시작 부분에 캐럿을 배치합니다.
     */
    setRangeAtStart(el: HTMLElement): void;
    /**
     * 주어진 요소의 끝 부분에 캐럿을 배치합니다.
     */
    setRangeAtEnd(el: HTMLElement): void;
    /**
     * 주어진 요소 내에서 특정 수평/수직 좌표(clientX, clientY)에 가장 가까운 위치로 캐럿을 이동합니다.
     */
    setRangeAtNearestPoint(element: HTMLElement, clientX: number, clientY: number): boolean;
    /**
     * 주어진 요소 내의 특정 텍스트 오프셋에 캐럿을 배치합니다.
     * HTML 구조 내에서 텍스트 노드를 탐색하여 정확한 위치를 찾습니다.
     */
    setRange(element: HTMLElement, offset: number): void;
}
