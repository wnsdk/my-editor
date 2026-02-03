import TextEditableBlock from "./TextEditableBlock";
import {BlockInit, TextBlockData, TextToolConfig} from "../types";

/**
 * 에디터의 텍스트 블록을 나타내는 클래스입니다.
 * TextEditableBlock을 상속받아 텍스트 편집 기능을 제공합니다.
 */
export default class TextBlock extends TextEditableBlock {
    override el: HTMLDivElement;

    /**
     * 기본 텍스트 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static createDefault(init: BlockInit<TextToolConfig>): TextBlock {
        return new TextBlock("", init);
    }

    /**
     * 데이터를 기반으로 텍스트 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static create(data: string | TextBlockData, init: BlockInit<TextToolConfig>): TextBlock {
        return new TextBlock(data, init);
    }

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

        // TextEditableBlock의 createEditableElement 사용
        this.el = this.createEditableElement("div", "block text-block") as HTMLDivElement;

        // TextEditableBlock의 setHtmlContent 사용
        this.setHtmlContent(this.el, initialHtml);
    }

    /**
     * TextEditableBlock의 추상 메서드 구현: HTML 콘텐츠 반환
     */
    protected getHtmlContent(): string {
        return this.el.innerHTML;
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
