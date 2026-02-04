import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
/**
 * 텍스트 선택 시 나타나는 컨텍스트 툴바 플러그인
 * - selectionchange 감지
 * - 툴바 UI 렌더링
 * - 서식 적용
 */
export default class ToolbarPlugin extends Plugin {
    private el;
    constructor(editor: Editor);
    initialize(): void;
    destroy(): void;
    private onSelectionChange;
    private createToolbarElement;
    private showToolbar;
    private hideToolbar;
    private onToolbarClick;
}
