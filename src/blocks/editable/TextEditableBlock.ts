import BaseBlock from "../BaseBlock";
import { BlockInit, ToolConfig, ToolType } from "../../types";

/**
 * 편집 가능한 텍스트 블록(텍스트, 리스트)의 공통 기능을 제공하는 추상 클래스입니다.
 * BaseBlock을 상속받아 contentEditable 텍스트 편집 기능을 정의합니다.
 */
export default abstract class TextEditableBlock extends BaseBlock {
    config!: any; // 하위 클래스에서 구체적인 타입 지정
    api!: BlockInit["api"];
    override el!: HTMLElement;

    protected constructor(type: ToolType, depth: number = 0) {
        super(type, depth);
    }

    /**
     * 편집 가능한 요소를 생성합니다.
     */
    protected createEditableElement(tagName: string = "div", className: string): HTMLElement {
        const el = document.createElement(tagName);
        el.className = className;

        if (!this.api.editor.readOnly) {
            el.contentEditable = "true"; // 편집 가능하도록 설정
        }

        el.setAttribute('spellcheck', 'false'); // 맞춤법 검사 비활성화

        return el;
    }

    /**
     * HTML 콘텐츠를 설정합니다.
     * 빈 문자열일 경우 <br> 태그를 삽입합니다.
     */
    protected setHtmlContent(element: HTMLElement, html: string): void {
        element.innerHTML = html === "" ? "<br>" : html;
    }

    /**
     * 블록의 내용이 비어있는지 여부를 확인합니다.
     */
    override isEmpty(): boolean {
        if (!this.el) return true;
        // innerHTML이 <br>이거나 textContent가 비어있으면 비어있는 것으로 판단
        return this.el.innerHTML === "<br>" || this.el.textContent?.trim().length === 0;
    }

    /**
     * 텍스트 블록에 포커스를 설정하고 캐럿을 배치합니다.
     */
    override focus(event?: Event): void {
        if (!this.el) return;

        // BaseBlock의 focus 메서드 호출 (스크롤 처리 등)
        super.focus(event);

        const selection = this.api.editor.selection;
        if (!selection) {
            this.el.focus({ preventScroll: true });
            return;
        }

        // 드래그 중인 경우 선택 영역을 건드리지 않음
        const currentSelection = window.getSelection();
        if (currentSelection && !currentSelection.isCollapsed) {
            return; // 텍스트가 선택된 상태면 캐럿 배치를 하지 않음
        }

        // 클릭 위치에 캐럿 배치
        this.handleCaretPositioning(event, selection);
    }

    /**
     * 캐럿 위치를 처리합니다.
     * 하위 클래스에서 필요에 따라 오버라이드할 수 있습니다.
     */
    protected handleCaretPositioning(event: Event | undefined, selection: any): void {
        // 클릭 이벤트인 경우 클릭 위치에 캐럿 배치
        if (
            event &&
            event instanceof MouseEvent &&
            event.type === 'click' &&
            document.caretRangeFromPoint &&
            event.clientX &&
            event.clientY
        ) {
            const range = document.caretRangeFromPoint(event.clientX, event.clientY);
            if (range && this.el.contains(range.startContainer)) {
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
                return;
            }
        }
    }

    /**
     * HTML 콘텐츠를 반환합니다.
     * 하위 클래스에서 구현해야 합니다.
     */
    protected abstract getHtmlContent(): string;
}
