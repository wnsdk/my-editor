import Plugin from "../../core/Plugin";
import type Editor from "../../core/Editor";
/**
 * 에디터 붙여넣기(Paste) 이벤트 처리 플러그인
 * - 클립보드 데이터 sanitize
 * - 에디터에 삽입
 */
export default class PasteHandlerPlugin extends Plugin {
    private onPasteBound;
    constructor(editor: Editor);
    initialize(): void;
    destroy(): void;
    /**
     * 붙여넣기 이벤트 처리
     */
    private onPaste;
}
