import { BaseBlockData, ToolType } from "../types";
/**
 * 모든 블록의 기본 클래스입니다.
 * 에디터의 모든 블록(텍스트, 이미지, 비디오 등)은 이 클래스를 상속합니다.
 */
export default abstract class BaseBlock {
    readonly id: string;
    readonly type: ToolType;
    depth: number;
    el: HTMLElement | null;
    /**
     * BaseBlock의 새 인스턴스를 생성합니다.
     */
    protected constructor(type: ToolType, depth?: number);
    /**
     * 블록의 DOM 요소를 지정된 루트 요소에 마운트합니다.
     */
    mount(root: HTMLElement, beforeElement?: HTMLElement | null): void;
    /**
     * 블록의 내용이 비어있는지 여부를 확인합니다.
     * 이 메서드는 하위 클래스에서 오버라이드될 수 있습니다.
     */
    isEmpty(): boolean;
    /**
     * 블록에 포커스를 설정합니다.
     * 텍스트 블록의 경우 캐럿을 배치하고, 다른 블록의 경우 요소에 포커스만 줍니다.
     */
    focus(event?: Event): void;
    /**
     * 블록의 데이터를 JSON 형식으로 직렬화합니다.
     */
    abstract toJSON(): BaseBlockData;
}
