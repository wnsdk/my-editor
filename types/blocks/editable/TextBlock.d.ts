import TextEditableBlock from "./TextEditableBlock";
import { BlockInit, TextBlockData, TextToolConfig } from "../../types";
/**
 * 에디터의 텍스트 블록을 나타내는 클래스입니다.
 * TextEditableBlock을 상속받아 텍스트 편집 기능을 제공합니다.
 */
export default class TextBlock extends TextEditableBlock {
    el: HTMLDivElement;
    /**
     * 기본 텍스트 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static createDefault(init: BlockInit<TextToolConfig>): TextBlock;
    /**
     * 데이터를 기반으로 텍스트 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static create(data: string | TextBlockData, init: BlockInit<TextToolConfig>): TextBlock;
    constructor(data: (string | TextBlockData) | undefined, init: BlockInit<TextToolConfig>);
    /**
     * TextEditableBlock의 추상 메서드 구현: HTML 콘텐츠 반환
     */
    protected getHtmlContent(): string;
    /**
     * 텍스트 블록의 데이터를 JSON 형식으로 직렬화합니다.
     */
    toJSON(): TextBlockData;
}
