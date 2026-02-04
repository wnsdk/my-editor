import BaseBlock from "../BaseBlock";
import { BlockInit, ToolType } from "../../types";
/**
 * 편집 가능한 텍스트 블록(텍스트, 리스트)의 공통 기능을 제공하는 추상 클래스입니다.
 * BaseBlock을 상속받아 contentEditable 텍스트 편집 기능을 정의합니다.
 */
export default abstract class TextEditableBlock extends BaseBlock {
    config: any;
    api: BlockInit["api"];
    el: HTMLElement;
    protected constructor(type: ToolType, depth?: number);
    /**
     * 편집 가능한 요소를 생성합니다.
     */
    protected createEditableElement(tagName: string | undefined, className: string): HTMLElement;
    /**
     * HTML 콘텐츠를 설정합니다.
     * 빈 문자열일 경우 <br> 태그를 삽입합니다.
     */
    protected setHtmlContent(element: HTMLElement, html: string): void;
    /**
     * 블록의 내용이 비어있는지 여부를 확인합니다.
     */
    isEmpty(): boolean;
    /**
     * 텍스트 블록에 포커스를 설정하고 캐럿을 배치합니다.
     */
    focus(event?: Event): void;
    /**
     * 캐럿 위치를 처리합니다.
     * 하위 클래스에서 필요에 따라 오버라이드할 수 있습니다.
     */
    protected handleCaretPositioning(event: Event | undefined, selection: any): void;
    /**
     * HTML 콘텐츠를 반환합니다.
     * 하위 클래스에서 구현해야 합니다.
     */
    protected abstract getHtmlContent(): string;
}
