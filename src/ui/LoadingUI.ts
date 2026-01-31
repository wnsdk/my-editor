// ui/LoadingUI.ts

/**
 * 로딩 UI의 CSS 클래스 이름입니다.
 */
const LOADING_UI_CLASS = "editor-loading";

/**
 * 스피너의 CSS 클래스 이름입니다.
 */
const SPINNER_CLASS = "spinner";

/**
 * 요소를 숨기기 위한 CSS 클래스 이름입니다.
 */
const HIDDEN_CLASS = "hidden";

/**
 * 에디터의 로딩 상태를 표시하는 UI 컴포넌트입니다.
 */
export default class LoadingUI {
    /**
     * 로딩 UI의 부모 컨테이너입니다.
     */
    private container: HTMLElement;

    /**
     * 로딩 UI의 DOM 요소입니다.
     */
    private el: HTMLElement;

    /**
     * LoadingUI의 새 인스턴스를 생성합니다.
     * @param container - 로딩 UI를 추가할 부모 DOM 요소.
     */
    constructor(container: HTMLElement = document.body) {
        this.container = container;
        this.el = this._createLoadingElement();
        this.container.appendChild(this.el);
        this.hide(); // 초기에는 숨김
    }

    /**
     * 로딩 UI의 DOM 요소를 생성합니다.
     * @returns 생성된 로딩 UI 요소.
     */
    private _createLoadingElement(): HTMLElement {
        const el = document.createElement("div");
        el.className = LOADING_UI_CLASS;
        el.innerHTML = `<div class="${SPINNER_CLASS}"></div>`;
        return el;
    }

    /**
     * 로딩 UI를 화면에 표시합니다.
     */
    show(): void {
        this.el.classList.remove(HIDDEN_CLASS);
    }

    /**
     * 로딩 UI를 화면에서 숨깁니다.
     */
    hide(): void {
        this.el.classList.add(HIDDEN_CLASS);
    }
}
