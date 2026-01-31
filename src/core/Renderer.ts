// Renderer.ts

import type Editor from "./Editor";
import type BaseBlock from "../blocks/BaseBlock"; // 경로도 맞춰줘야해여오

/**
 * 에디터의 블록 모델 리스트를 실제 DOM 요소로 변환하여 화면에 렌더링하는 클래스입니다.
 * DOM과 블록 모델 간의 동기화를 담당합니다.
 */
export default class Renderer {
    private editor: Editor;

    /**
     * Renderer의 새 인스턴스를 생성합니다.
     * @param editor - 렌더러가 연결될 Editor 인스턴스.
     */
    constructor(editor: Editor) {
        this.editor = editor;
    }

    /**
     * 블록 모델 리스트를 기반으로 에디터의 DOM을 업데이트합니다.
     * 이 메서드는 DOM에서 블록을 추가, 제거, 순서 변경합니다.
     */
    render(blockModels: BaseBlock[]): void {
        const newBlockIds = new Set(blockModels.map((b) => b.id));

        const currentBlockElements = Array.from(this.editor.root.children).filter(
            (el): el is HTMLElement =>
                el instanceof HTMLElement && el.classList.contains("block")
        );

        this._removeDeletedBlocks(currentBlockElements, newBlockIds);
        this._addOrReorderBlocks(blockModels);
    }

    /**
     * DOM에서 더 이상 존재하지 않는 블록 요소를 제거합니다.
     */
    private _removeDeletedBlocks(
        currentBlockElements: HTMLElement[],
        newBlockIds: ReadonlySet<string>
    ): void {
        currentBlockElements.forEach((el) => {
            const blockId = el.dataset["blockId"];
            if (blockId && !newBlockIds.has(blockId)) {
                this.editor.root.removeChild(el);
                this.editor.eventBus.emit("block:removed", blockId);
            }
        });
    }

    /**
     * 블록 모델 리스트를 기반으로 DOM에 블록을 추가하거나 순서를 변경합니다.
     */
    private _addOrReorderBlocks(blockModels: BaseBlock[]): void {
        blockModels.forEach((block, index) => {
            const existingEl = this.editor.root.querySelector<HTMLElement>(
                `[data-block-id="${block.id}"]`
            );

            const nextBlock = blockModels[index + 1];

            const nextBlockInDom =
                nextBlock
                    ? this.editor.root.querySelector<HTMLElement>(
                        `[data-block-id="${nextBlock.id}"]`
                    )
                    : null;

            if (!existingEl) {
                // DOM에 없는 새 블록이면, 올바른 위치에 삽입
                block.mount(this.editor.root, nextBlockInDom ?? undefined);
                this.editor.eventBus.emit("block:added", block.id);
                return;
            }

            // DOM에 이미 있는 블록이면, 순서가 맞는지 확인
            const prevBlock = blockModels[index - 1];
            const expectedPrevId = prevBlock ? prevBlock.id : null;

            let actualPrevEl: Element | null = existingEl.previousElementSibling;
            while (actualPrevEl && !actualPrevEl.classList.contains("block")) {
                actualPrevEl = actualPrevEl.previousElementSibling;
            }

            const actualPrevId =
                actualPrevEl instanceof HTMLElement
                    ? actualPrevEl.dataset["blockId"] ?? null
                    : null;

            if (expectedPrevId !== actualPrevId) {
                this.editor.root.insertBefore(existingEl, nextBlockInDom);
            }
        });
    }
}
