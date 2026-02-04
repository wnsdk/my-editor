/**
 * 에디터의 로딩 상태를 표시하는 UI 컴포넌트입니다.
 */
export default class LoadingUI {
    /**
     * 로딩 UI의 부모 컨테이너입니다.
     */
    private container;
    /**
     * 로딩 UI의 DOM 요소입니다.
     */
    private el;
    /**
     * LoadingUI의 새 인스턴스를 생성합니다.
     * @param container - 로딩 UI를 추가할 부모 DOM 요소.
     */
    constructor(container?: HTMLElement);
    /**
     * 로딩 UI의 DOM 요소를 생성합니다.
     * @returns 생성된 로딩 UI 요소.
     */
    private _createLoadingElement;
    /**
     * 로딩 UI를 화면에 표시합니다.
     */
    show(): void;
    /**
     * 로딩 UI를 화면에서 숨깁니다.
     */
    hide(): void;
}
