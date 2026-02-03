import Plugin from "../../core/Plugin";
import ListBlock from "../../blocks/editable/ListBlock";
import { registerBlock } from "../../blocks/BlockFactory";
import type Editor from "../../core/Editor";
import { ToolConfig } from "../../types";

export default class ListBlockPlugin extends Plugin {
    constructor(editor: Editor) {
        super(editor);
    }

    initialize(): void {
        registerBlock("list", ListBlock);
        this.editor.root.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (event.key !== " ") return;

        const selection = this.editor.selection;
        const currentBlock = selection.getCurrentBlock();
        if (!currentBlock || currentBlock.type !== "text") return;

        const textBlockEl = currentBlock.el;
        if (!textBlockEl) return;

        const text = textBlockEl.textContent || "";
        // 캐럿이 맨 앞에 있는지 확인 (간소화를 위해 텍스트 길이와 오프셋 비교)
        const nativeSel = window.getSelection();
        if (!nativeSel || nativeSel.anchorOffset > 2) return;

        let style: 'ordered' | 'unordered' | null = null;
        let prefixLen = 0;

        if (text === "*" || text === "-") {
            style = 'unordered';
            prefixLen = 1;
        } else if (text === "1.") {
            style = 'ordered';
            prefixLen = 2;
        }

        if (style) {
            event.preventDefault();

            // 현재 상태 저장 (Ctrl+Z를 위해)
            this.editor.saveHistory();

            const newListBlock = new ListBlock({ type: 'list', style, html: "" }, {
                config: {},
                api: {
                    removeBlock: (block) => this.editor.removeBlock(block),
                    editor: this.editor
                }
            });

            // 블록 교체
            const index = this.editor.blocks.indexOf(currentBlock);
            this.editor.blocks.splice(index, 1, newListBlock);

            this.editor.renderer.render(this.editor.blocks);
            newListBlock.focus();

            // 전환 직후 상태를 다시 저장하여 history stack을 올바르게 유지
            this.editor.saveHistory();
        }
    }

    static override getToolSettings(): Record<"list", ToolConfig> {
        return {
            list: {
                toolbar: true,
                config: {}
            }
        };
    }
}