import Plugin from "../../core/Plugin";
import type Editor from "../../core/Editor";
import { TableToolConfig, ToolConfig } from "../../types";
/**
 * 테이블 블록 기능을 에디터에 추가하는 플러그인입니다.
 * TableBlock을 BlockFactory에 등록하고, 테이블 관련 toolSettings를 제공합니다.
 */
export default class TableBlockPlugin extends Plugin {
    constructor(editor: Editor);
    /**
     * 플러그인을 초기화하고 TableBlock을 BlockFactory에 등록합니다.
     */
    initialize(): void;
    /**
     * 이 플러그인이 제공하는 toolSettings를 반환합니다.
     */
    static getToolSettings(): Record<string, ToolConfig<TableToolConfig>>;
}
