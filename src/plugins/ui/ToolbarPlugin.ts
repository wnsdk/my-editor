import Plugin from "../../core/Plugin";
import { throttle } from "../../utils/throttle";
import Editor from "../../core/Editor";

/**
 * 텍스트 선택 시 나타나는 컨텍스트 툴바 플러그인
 * - selectionchange 감지
 * - 툴바 UI 렌더링
 * - 서식 적용
 */
export default class ToolbarPlugin extends Plugin {
    private el: HTMLElement | null = null;

    constructor(editor: Editor) {
        super(editor);
    }

    initialize() {
        // ❌ editor.toolbarEnabled 같은 전역 가드는 두지 않음
        // → 보여줄지 말지는 toolSettings 기준

        document.addEventListener(
            "selectionchange",
            throttle(this.onSelectionChange, 50) as EventListener
        );
    }

    destroy() {
        document.removeEventListener(
            "selectionchange",
            this.onSelectionChange
        );
        this.el?.remove();
    }

    /* ================================
     * Selection Handling
     * ================================ */

    private onSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            this.hideToolbar();
            return;
        }

        // 에디터 영역 밖 선택이면 무시
        if (
            !this.editor.root.contains(selection.anchorNode) ||
            !this.editor.root.contains(selection.focusNode)
        ) {
            this.hideToolbar();
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width === 0 && rect.height === 0) {
            this.hideToolbar();
            return;
        }

        // 현재 블록의 toolbar 설정 확인
        const currentBlock = this.editor.selection.getCurrentBlock();
        if (currentBlock) {
            const toolSettings = this.editor.getToolConfig(currentBlock.type);
            if (toolSettings?.toolbar === false) {
                this.hideToolbar();
                return;
            }
        }

        this.showToolbar(rect);
    };

    /* ================================
     * Toolbar UI
     * ================================ */

    private createToolbarElement(): HTMLElement {
        const el = document.createElement("div");
        el.className = "editor-toolbar hidden";
        el.innerHTML = `
            <button data-cmd="bold"><b>B</b></button>
            <button data-cmd="italic"><i>I</i></button>
            <button data-cmd="underline"><u>U</u></button>
            <button data-cmd="strikeThrough"><s>S</s></button>
        `;

        // 툴바 클릭 시 포커스 잃지 않게
        el.addEventListener("mousedown", e => e.preventDefault());
        el.addEventListener("click", this.onToolbarClick);

        return el;
    }

    private showToolbar(rect: DOMRect) {
        if (!this.el) {
            this.el = this.createToolbarElement();
            document.body.appendChild(this.el);
        }

        const toolbarRect = this.el.getBoundingClientRect();

        this.el.style.left =
            `${rect.left + rect.width / 2 - toolbarRect.width / 2}px`;
        this.el.style.top =
            `${rect.top - toolbarRect.height - 8 + window.scrollY}px`;

        this.el.classList.remove("hidden");
    }

    private hideToolbar() {
        if (!this.el) return;
        this.el.classList.add("hidden");
    }

    /* ================================
     * Actions
     * ================================ */

    private onToolbarClick = (event: MouseEvent) => {
        const button = (event.target as HTMLElement)
            .closest("button[data-cmd]");
        if (!(button instanceof HTMLElement)) return;

        const command = button.dataset["cmd"];
        if (!command) return;

        try {
            // NOTE: deprecated지만 현재는 가장 단순
            document.execCommand(command, false);
            this.editor.saveHistory();
        } catch (err) {
            console.error(
                `ToolbarPlugin: command "${command}" failed`,
                err
            );
        }
    };
}
