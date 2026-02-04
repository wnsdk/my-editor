import BaseBlock from "../BaseBlock";
import { BlockInit, ToolType } from "../../types";
/**
 * 미디어 블록(이미지, 비디오)의 공통 기능을 제공하는 추상 클래스입니다.
 * BaseBlock을 상속받아 미디어 블록의 공통 구조와 동작을 정의합니다.
 */
export default abstract class MediaBlock extends BaseBlock {
    config: any;
    api: BlockInit["api"];
    el: HTMLDivElement;
    protected constructor(type: ToolType, depth?: number);
    /**
     * 미디어 블록의 기본 래퍼 구조를 생성합니다.
     * 외부 wrapper div와 내부 content div로 구성됩니다.
     */
    protected createWrapper(align?: string): {
        wrapper: HTMLDivElement;
        content: HTMLDivElement;
    };
    /**
     * 미디어가 없을 때 표시할 플레이스홀더를 생성합니다.
     */
    protected createPlaceholder(message: string): HTMLDivElement;
    /**
     * 삭제 버튼을 생성하고 컨테이너에 추가합니다.
     */
    protected appendDeleteButton(container: HTMLElement): void;
    /**
     * 미디어 블록의 콘텐츠를 렌더링합니다.
     * 하위 클래스에서 구현해야 합니다.
     */
    protected abstract renderContent(container: HTMLElement): void;
    /**
     * 미디어 소스(src)를 반환합니다.
     * 하위 클래스에서 구현해야 합니다.
     */
    protected abstract getMediaSrc(): string;
}
