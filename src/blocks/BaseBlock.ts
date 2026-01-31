// blocks/BaseBlock.js
import { setBlockId } from "../utils/dom.js";
import {BaseBlockData, ToolType} from "../types";

/**
 * 모든 블록의 기본 클래스입니다.
 * 에디터의 모든 블록(텍스트, 이미지, 비디오 등)은 이 클래스를 상속합니다.
 */
export default abstract class BaseBlock {
    readonly id: string;
    readonly type: ToolType;
    depth: number;
    el: HTMLElement | null = null;

    /**
     * BaseBlock의 새 인스턴스를 생성합니다.
     */
    protected constructor(type: ToolType, depth: number = 0) {
        this.type = type;
        this.id = crypto.randomUUID(); // 고유 ID 생성
        this.depth = depth;
    }

    /**
     * 블록의 DOM 요소를 지정된 루트 요소에 마운트합니다.
     */
    mount(root: HTMLElement, beforeElement?: HTMLElement | null) {
        if (!this.el) {
            console.warn(`Block type ${this.type} has no element to mount.`);
            return;
        }
        setBlockId(this.el, this.id); // DOM 요소에 블록 ID 설정
        if (beforeElement) {
            root.insertBefore(this.el, beforeElement);
        } else {
            root.appendChild(this.el);
        }
    }

    /**
     * 블록의 내용이 비어있는지 여부를 확인합니다.
     * 이 메서드는 하위 클래스에서 오버라이드될 수 있습니다.
     */
    isEmpty(): boolean {
        if (!this.el) return true;
        // 기본적으로 textContent를 기준으로 비어있는지 판단
        return this.el.textContent.trim() === "";
    }

    /**
     * 블록에 포커스를 설정합니다.
     * 텍스트 블록의 경우 캐럿을 배치하고, 다른 블록의 경우 요소에 포커스만 줍니다.
     */
    focus(event?: Event) {
        if (!this.el) return;

        // 텍스트 블록이 아닌 경우 (미디어 블록 등)
        if (this.type !== 'text') {
            this.el.focus({ preventScroll: true });
        }
        // 텍스트 블록의 경우, 캐럿 배치는 TextBlock에서 오버라이드하여 처리하거나
        // Editor의 selection 모듈을 통해 처리하는 것이 좋습니다.
        // BaseBlock에서는 단순히 요소에 포커스만 주거나,
        // TextBlock에서 selection.setRangeAtStart/End 등을 호출하도록 합니다.
        // 현재는 TextBlock에서 오버라이드하는 것을 가정하고, BaseBlock에서는 아무것도 하지 않습니다.
        // (TextBlock의 focus 메서드에서 selection.setRangeAtStart 등을 호출할 것임)

        // 블록이 화면에 보이도록 스크롤
        this.el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * 블록의 데이터를 JSON 형식으로 직렬화합니다.
     */
    abstract toJSON(): BaseBlockData;
}
