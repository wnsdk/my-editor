import Plugin from "../../core/Plugin";
import Sanitizer from "../../core/Sanitizer";
import type Editor from "../../core/Editor";
import { createBlockFromJSON } from "../../blocks/BlockFactory";
import { BaseBlockData } from "../../types";

/**
 * 에디터 복사/잘라내기/붙여넣기 이벤트 처리 플러그인
 * - 다중 블록 선택 시 블록 단위 복사/붙여넣기
 * - Range Selection 시 부분 콘텐츠 복사/붙여넣기
 * - 클립보드 데이터 sanitize
 */
export default class CopyPastePlugin extends Plugin {
    private onCopyBound = this._onCopy.bind(this);
    private onCutBound = this._onCut.bind(this);
    private onPasteBound = this._onPaste.bind(this);

    /** 커스텀 MIME 타입 (에디터 블록 데이터) */
    private static readonly MIME_TYPE = 'application/x-mnote-blocks';

    constructor(editor: Editor) {
        super(editor);
    }

    initialize(): void {
        this.editor.root.addEventListener("copy", this.onCopyBound);
        this.editor.root.addEventListener("cut", this.onCutBound);
        this.editor.root.addEventListener("paste", this.onPasteBound);
    }

    destroy(): void {
        this.editor.root.removeEventListener("copy", this.onCopyBound);
        this.editor.root.removeEventListener("cut", this.onCutBound);
        this.editor.root.removeEventListener("paste", this.onPasteBound);
    }

    /**
     * 복사 이벤트 처리
     */
    private _onCopy(event: ClipboardEvent): void {
        const multiSelection = this.editor.multiSelection;

        // 다중 블록 선택이 있는 경우
        if (multiSelection.hasSelection()) {
            event.preventDefault();
            this._copySelectedContent(event.clipboardData);
        }
        // 그 외의 경우 (단일 블록 내 텍스트 선택)는 브라우저 기본 동작 사용
    }

    /**
     * 잘라내기 이벤트 처리
     */
    private _onCut(event: ClipboardEvent): void {
        if (this.editor.readOnly) return;

        const multiSelection = this.editor.multiSelection;

        // 다중 블록 선택이 있는 경우
        if (multiSelection.hasSelection()) {
            event.preventDefault();
            this._copySelectedContent(event.clipboardData);
            this._deleteSelectedContent();
        }
        // 그 외의 경우는 브라우저 기본 동작 사용
    }

    /**
     * 붙여넣기 이벤트 처리
     */
    private _onPaste(event: ClipboardEvent): void {
        if (this.editor.readOnly) return;

        const clipboardData = event.clipboardData;
        if (!clipboardData) {
            console.warn("CopyPastePlugin: No clipboard data available.");
            return;
        }

        // 커스텀 블록 데이터가 있는지 확인
        const blocksJson = clipboardData.getData(CopyPastePlugin.MIME_TYPE);

        if (blocksJson) {
            event.preventDefault();
            this._pasteBlocks(blocksJson);
            return;
        }

        // 일반 HTML/텍스트 붙여넣기
        event.preventDefault();
        const html = clipboardData.getData("text/html");
        const text = clipboardData.getData("text/plain");

        const cleanedContent = Sanitizer.clean(html || text || "");

        try {
            // 다중 블록 선택이 있으면 먼저 삭제
            if (this.editor.multiSelection.hasSelection()) {
                this._deleteSelectedContent();
            }

            // NOTE: deprecated이지만 현재는 가장 단순한 방법
            document.execCommand("insertHTML", false, cleanedContent);
            this.editor.saveHistory();
        } catch (error) {
            console.error("CopyPastePlugin: Failed to insert content:", error);
        }
    }

    /**
     * 선택된 콘텐츠를 클립보드에 복사
     */
    private _copySelectedContent(clipboardData: DataTransfer | null): void {
        if (!clipboardData) return;

        const multiSelection = this.editor.multiSelection;
        const blocksData = multiSelection.serializeSelection();

        if (blocksData.length === 0) return;

        // 커스텀 MIME 타입으로 블록 데이터 저장
        clipboardData.setData(CopyPastePlugin.MIME_TYPE, JSON.stringify(blocksData));

        // 일반 텍스트/HTML로도 저장 (다른 앱으로 붙여넣기 가능하도록)
        const { text, html } = this._blocksToTextAndHtml(blocksData);
        clipboardData.setData("text/plain", text);
        clipboardData.setData("text/html", html);
    }

    /**
     * 선택된 콘텐츠를 삭제
     */
    private _deleteSelectedContent(): void {
        const multiSelection = this.editor.multiSelection;
        const selectionType = multiSelection.getSelectionType();

        if (selectionType === 'block') {
            // Block Selection: 전체 블록 삭제
            multiSelection.deleteSelectedBlocks();
        } else if (selectionType === 'range') {
            // Range Selection: 부분 삭제
            this._deleteRangeSelection();
        }
    }

    /**
     * Range Selection의 콘텐츠를 삭제
     */
    private _deleteRangeSelection(): void {
        const rangeSelection = this.editor.multiSelection.getRangeSelection();
        if (!rangeSelection) return;

        const { startBlock, startOffset, endBlock, endOffset } = rangeSelection;
        const blocks = this.editor.blocks;
        const startIndex = blocks.indexOf(startBlock);
        const endIndex = blocks.indexOf(endBlock);

        if (startIndex === endIndex) {
            // 같은 블록 내 삭제
            if (startBlock.type === 'text' && startBlock.el) {
                this._deleteTextRange(startBlock.el, startOffset, endOffset);
            }
        } else {
            // 여러 블록에 걸친 삭제
            // 시작 블록: startOffset 이후 삭제
            if (startBlock.type === 'text' && startBlock.el) {
                const fullText = startBlock.el.textContent || '';
                startBlock.el.textContent = fullText.substring(0, startOffset);
            }

            // 끝 블록: endOffset 이전 삭제
            if (endBlock.type === 'text' && endBlock.el) {
                const fullText = endBlock.el.textContent || '';
                endBlock.el.textContent = fullText.substring(endOffset);
            }

            // 중간 블록들 삭제
            const blocksToRemove = blocks.slice(startIndex + 1, endIndex);
            blocksToRemove.forEach(block => {
                const idx = this.editor.blocks.indexOf(block);
                if (idx !== -1) {
                    this.editor.blocks.splice(idx, 1);
                }
            });

            // 시작/끝 블록이 모두 텍스트면 병합
            if (startBlock.type === 'text' && endBlock.type === 'text' &&
                startBlock.el && endBlock.el) {
                startBlock.el.textContent =
                    (startBlock.el.textContent || '') + (endBlock.el.textContent || '');

                const endIdx = this.editor.blocks.indexOf(endBlock);
                if (endIdx !== -1) {
                    this.editor.blocks.splice(endIdx, 1);
                }
            }
        }

        this.editor.multiSelection.clearSelection();
        this.editor.renderer.render(this.editor.blocks);
        this.editor.saveHistory();
        this.editor.eventBus.emit('document:mutated');
    }

    /**
     * 텍스트 범위를 삭제
     */
    private _deleteTextRange(element: HTMLElement, start: number, end: number): void {
        const text = element.textContent || '';
        element.textContent = text.substring(0, start) + text.substring(end);
    }

    /**
     * 블록 데이터를 텍스트와 HTML로 변환
     */
    private _blocksToTextAndHtml(blocksData: BaseBlockData[]): { text: string; html: string } {
        let text = '';
        let html = '';

        blocksData.forEach((block, index) => {
            if (index > 0) {
                text += '\n';
                html += '<br>';
            }

            switch (block.type) {
                case 'text': {
                    const textContent = (block as any).html || '';
                    text += this._stripHtml(textContent);
                    html += textContent;
                    break;
                }
                case 'list': {
                    const listHtml = (block as any).html || '';
                    const style = (block as any).style || 'unordered';
                    text += this._stripHtml(listHtml);
                    html += style === 'ordered' ? `<ol>${listHtml}</ol>` : `<ul>${listHtml}</ul>`;
                    break;
                }
                case 'image': {
                    const src = (block as any).src || '';
                    const alt = (block as any).alt || '';
                    text += `[Image: ${alt || src}]`;
                    html += `<img src="${src}" alt="${alt}">`;
                    break;
                }
                case 'video': {
                    const src = (block as any).src || '';
                    text += `[Video: ${src}]`;
                    html += `<video src="${src}"></video>`;
                    break;
                }
                default:
                    text += `[${block.type}]`;
            }
        });

        return { text, html };
    }

    /**
     * HTML 태그를 제거하고 텍스트만 추출
     */
    private _stripHtml(html: string): string {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || '';
    }

    /**
     * 블록 데이터를 붙여넣기
     */
    private _pasteBlocks(blocksJson: string): void {
        try {
            const blocksData: BaseBlockData[] = JSON.parse(blocksJson);

            if (!Array.isArray(blocksData) || blocksData.length === 0) return;

            // 현재 선택이 있으면 삭제
            if (this.editor.multiSelection.hasSelection()) {
                this._deleteSelectedContent();
            }

            // 현재 블록 찾기
            const currentBlock = this.editor.selection.getCurrentBlock() ||
                                 this.editor.getSelectedBlock() ||
                                 this.editor.blocks[this.editor.blocks.length - 1];

            let insertIndex = currentBlock ?
                this.editor.blocks.indexOf(currentBlock) + 1 :
                this.editor.blocks.length;

            // 블록들 삽입
            const newBlocks = blocksData.map(data => {
                const toolConfig = this.editor.toolSettings[data.type];
                return createBlockFromJSON(data, {
                    config: toolConfig?.config ?? {},
                    api: {
                        removeBlock: (block) => this.editor.removeBlock(block),
                        editor: this.editor
                    }
                });
            });

            // 각 블록을 적절한 위치에 삽입
            newBlocks.forEach((block, idx) => {
                this.editor.blocks.splice(insertIndex + idx, 0, block);
            });

            this.editor.renderer.render(this.editor.blocks);
            this.editor.saveHistory();
            this.editor.eventBus.emit('document:mutated');

            // 마지막으로 삽입된 블록에 포커스
            const lastNewBlock = newBlocks[newBlocks.length - 1];
            if (lastNewBlock) {
                requestAnimationFrame(() => {
                    this.editor.selectAndFocusBlock(lastNewBlock);
                });
            }
        } catch (error) {
            console.error("CopyPastePlugin: Failed to parse blocks data:", error);
        }
    }
}
