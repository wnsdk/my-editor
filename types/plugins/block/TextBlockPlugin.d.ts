import Plugin from "../../core/Plugin";
import type Editor from "../../core/Editor";
import type { ToolConfig } from "../../types";
/**
 * 텍스트 블록 기능을 에디터에 추가하는 플러그인
 * - TextBlock 등록
 * - 텍스트 관련 toolSettings 제공
 */
export default class TextBlockPlugin extends Plugin {
    constructor(editor: Editor);
    /**
     * 플러그인을 초기화하고 TextBlock을 BlockFactory에 등록합니다.
     */
    initialize(): void;
    /**
     * 이 플러그인이 제공하는 toolSettings
     * Editor의 toolSettings와 병합됨
     */
    static getToolSettings(): Record<"text", ToolConfig<Record<string, never>>>;
}
