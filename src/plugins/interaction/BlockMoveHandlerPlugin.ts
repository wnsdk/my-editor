import Plugin from "../../core/Plugin";
import {Editor} from "../../index";
import BaseBlock from "../../blocks/BaseBlock";

/**
 * 블록 이동 버튼 클릭을 통해 블록의 순서를 위아래로 변경하는 기능을 제공하는 플러그인입니다.
 */
export default class BlockMoveHandlerPlugin extends Plugin {

    constructor(editor: Editor) {
        super(editor);
    }

    /**
     * 플러그인을 초기화하고 에디터 루트에 클릭 이벤트 리스너를 등록합니다.
     */
    initialize() {
        this.editor.root.addEventListener("click", this.onClick.bind(this));
    }

    /**
     * 에디터 루트에서 발생하는 클릭 이벤트를 처리합니다.
     * 블록 이동 버튼 클릭 시 해당 블록의 순서를 변경합니다.
     */
    onClick(e: MouseEvent): void {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        const upBtn = target.closest("[data-block-move='up']");
        const downBtn = target.closest("[data-block-move='down']");

        if (!upBtn && !downBtn) return;

        const blockEl = target.closest<HTMLElement>("[data-block-id]");
        const blockId = blockEl?.dataset["blockId"];
        if (!blockId) return;

        const blocks: BaseBlock[] = this.editor.blocks;
        const blockIndex = blocks.findIndex(b => b.id === blockId);

        if (blockIndex === -1) return;

        let movedBlock: BaseBlock | null = null;

        if (upBtn && blockIndex > 0) {
            movedBlock = this._moveBlock(blockIndex, blockIndex - 1);
        } else if (downBtn && blockIndex < blocks.length - 1) {
            movedBlock = this._moveBlock(blockIndex, blockIndex + 1);
        }

        if (movedBlock) {
            this.editor.renderer.render(blocks);
            this.editor.saveHistory();
            this.editor.selectAndFocusBlock(movedBlock);
        }
    }



    /**
     * 블록 배열 내에서 위치 이동
     */
    private _moveBlock(fromIndex: number, toIndex: number): BaseBlock | null {
        const blocks = this.editor.blocks;
        const removed = blocks.splice(fromIndex, 1);
        const movedBlock = removed[0];

        if (!movedBlock) return null;

        blocks.splice(toIndex, 0, movedBlock);
        return movedBlock;
    }
}
