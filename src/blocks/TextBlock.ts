import BaseBlock from "./BaseBlock";
import {BlockInit, TextBlockData, TextToolConfig} from "../types";

/**
 * 에디터의 텍스트 블록을 나타내는 클래스입니다.
 * BaseBlock을 상속받아 텍스트 편집 기능을 제공합니다.
 */
export default class TextBlock extends BaseBlock {
    config: TextToolConfig;
    api: BlockInit["api"];
    override el: HTMLDivElement;

    constructor(
        data: string | TextBlockData = "",
        init: BlockInit<TextToolConfig>
    ) {
        const depth = (typeof data === "object" && data.depth) ? data.depth : 0;
        super("text", depth);

        this.config = init.config;
        this.api = init.api;

        let initialHtml = "";
        if (typeof data === "string") {
            initialHtml = data;
        } else if (data && typeof data === "object") {
            initialHtml = data.html || ""
        }

        const el = document.createElement("div");
        el.className = "block text-block";
        if (!this.api.editor.readOnly) {
            el.contentEditable = "true"; // 텍스트 블록만 편집 가능하도록 설정
        }
        el.setAttribute('spellcheck', 'false'); // 맞춤법 검사 비활성화 (선택 사항)

        // 빈 문자열일 경우 포커싱을 위해 <br> 태그 삽입 (contenteditable 필수 트릭)
        el.innerHTML = initialHtml === "" ? "<br>" : initialHtml;

        this.el = el;
    }

    /**
     * 블록의 내용이 비어있는지 여부를 확인합니다.
     */
    override isEmpty(): boolean {
        if (!this.el) return true;
        // innerHTML이 <br>이거나 textContent가 비어있으면 비어있는 것으로 판단
        return this.el.innerHTML === "<br>" || this.el.textContent.trim().length === 0;
    }

    /**
     * 텍스트 블록에 포커스를 설정하고 캐럿을 배치합니다.
     */
    override focus(event?: MouseEvent): void {
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

        // 클릭 위치에 캐럿 배치 (드래그가 아닌 클릭인 경우에만)
        if (
            event &&
            event.type === 'click' && // 클릭 이벤트인지 확인
            document.caretRangeFromPoint &&
            event.clientX &&
            event.clientY
        ) {
            const range = document.caretRangeFromPoint(
                event.clientX,
                event.clientY
            );
            if (range && this.el.contains(range.startContainer)) {
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
                return;
            }
        }
    }

    /**
     * 텍스트 블록의 데이터를 JSON 형식으로 직렬화합니다.
     */
    override toJSON(): TextBlockData {
        return {
            id: this.id,
            type: "text",
            html: this.el.innerHTML, // 현재 DOM의 innerHTML을 저장
            depth: this.depth
        };
    }
}
