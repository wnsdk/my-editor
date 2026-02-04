import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
import { ImageToolConfig, ToolConfig } from "../../types";
/**
 * 이미지 블록 + 이미지 컨텍스트 툴바를 제공하는 플러그인
 */
export default class ImageBlockPlugin extends Plugin {
    private toolbarEl;
    private currentBlock;
    private currentMediaEl;
    constructor(editor: Editor);
    initialize(): void;
    destroy(): void;
    private createToolbarElement;
    private onRootClick;
    private showToolbar;
    private hideToolbar;
    private onToolbarClick;
    static getToolSettings(): Record<string, ToolConfig<ImageToolConfig>>;
}
