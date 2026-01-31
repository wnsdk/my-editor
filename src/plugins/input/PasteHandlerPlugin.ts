import Plugin from "../../core/Plugin";
import Sanitizer from "../../core/Sanitizer";
import type Editor from "../../core/Editor";

/**
 * 에디터 붙여넣기(Paste) 이벤트 처리 플러그인
 * - 클립보드 데이터 sanitize
 * - 에디터에 삽입
 */
export default class PasteHandlerPlugin extends Plugin {
    // 제거를 위해 바인딩된 핸들러 보관
    private onPasteBound = this.onPaste.bind(this);

    constructor(editor: Editor) {
        super(editor);
    }

    initialize(): void {
        this.editor.root.addEventListener("paste", this.onPasteBound);
    }

    destroy(): void {
        this.editor.root.removeEventListener("paste", this.onPasteBound);
    }

    /**
     * 붙여넣기 이벤트 처리
     */
    private onPaste(event: ClipboardEvent): void {
        if (this.editor.readOnly) return;

        event.preventDefault();

        const clipboardData = event.clipboardData;
        if (!clipboardData) {
            console.warn("PasteHandlerPlugin: No clipboard data available.");
            return;
        }

        const html: string = clipboardData.getData("text/html");
        const text: string = clipboardData.getData("text/plain");

        const cleanedContent: string = Sanitizer.clean(html || text || "");

        try {
            // NOTE: deprecated이지만 현재는 가장 단순한 방법
            document.execCommand("insertHTML", false, cleanedContent);
            this.editor.saveHistory();
        } catch (error) {
            console.error(
                "PasteHandlerPlugin: Failed to insert content via execCommand:",
                error
            );
        }
    }
}
