import Plugin from "../../core/Plugin";
import Sanitizer from "../../core/Sanitizer";
import type Editor from "../../core/Editor";
import { createBlockFromJSON } from "../../blocks/BlockFactory";
import { BaseBlockData } from "../../types";
import type BaseBlock from "../../blocks/BaseBlock";

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

        console.log("CopyPastePlugin._onCopy: hasSelection=", multiSelection.hasSelection(),
                    "selectionType=", multiSelection.getSelectionType(),
                    "rangeSelection=", multiSelection.getRangeSelection());

        // 다중 블록 선택이 있는 경우만 커스텀 처리
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

        console.log("CopyPastePlugin._onPaste: blocksJson=", blocksJson);

        if (blocksJson) {
            event.preventDefault();
            console.log("CopyPastePlugin._onPaste: pasting blocks");
            this._pasteBlocks(blocksJson);
            return;
        }

        // 일반 HTML/텍스트 붙여넣기
        const html = clipboardData.getData("text/html");
        const text = clipboardData.getData("text/plain");

        console.log("CopyPastePlugin: html=", html);
        console.log("CopyPastePlugin: text=", text);

        // HTML이나 텍스트가 있는 경우에만 처리
        if (html || text) {
            event.preventDefault();

            // HTML을 정리
            let cleanedContent = Sanitizer.clean(html || "");

            // Sanitizer가 모든 내용을 제거한 경우, 텍스트 데이터 사용
            if (!cleanedContent.trim() && text) {
                cleanedContent = Sanitizer.clean(text);
            }

            console.log("CopyPastePlugin: cleanedContent=", cleanedContent);

            try {
                // 다중 블록 선택이 있으면 먼저 삭제
                if (this.editor.multiSelection.hasSelection()) {
                    this._deleteSelectedContent();
                }

                // 현재 선택 영역 가져오기
                const selection = window.getSelection();
                console.log("CopyPastePlugin: selection=", selection, "rangeCount=", selection?.rangeCount);

                if (!selection || selection.rangeCount === 0) {
                    console.warn("CopyPastePlugin: No selection range available.");
                    return;
                }

                const range = selection.getRangeAt(0);
                console.log("CopyPastePlugin: range=", range);

                // 선택된 내용 삭제
                range.deleteContents();

                // HTML 파싱
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cleanedContent;

                // DocumentFragment 생성하여 삽입
                const fragment = document.createDocumentFragment();
                let node;
                while ((node = tempDiv.firstChild)) {
                    fragment.appendChild(node);
                }

                console.log("CopyPastePlugin: fragment=", fragment);

                // 커서 위치에 삽입
                range.insertNode(fragment);

                // 커서를 삽입된 내용 끝으로 이동
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);

                console.log("CopyPastePlugin: paste completed");

                // input 이벤트를 발생시켜 히스토리 자동 저장 트리거
                // (input 이벤트가 자동으로 saveHistoryDebounced를 호출함)
                const inputEvent = new Event('input', { bubbles: true });
                this.editor.root.dispatchEvent(inputEvent);
            } catch (error) {
                console.error("CopyPastePlugin: Failed to insert content:", error);
            }
        }
    }

    /**
     * 선택된 콘텐츠를 클립보드에 복사
     */
    private _copySelectedContent(clipboardData: DataTransfer | null): void {
        if (!clipboardData) return;

        const multiSelection = this.editor.multiSelection;
        const blocksData = multiSelection.serializeSelection();

        console.log("CopyPastePlugin._copySelectedContent: blocksData=", blocksData);

        if (blocksData.length === 0) return;

        // 커스텀 MIME 타입으로 블록 데이터 저장
        clipboardData.setData(CopyPastePlugin.MIME_TYPE, JSON.stringify(blocksData));

        // 일반 텍스트/HTML로도 저장 (다른 앱으로 붙여넣기 가능하도록)
        const { text, html } = this._blocksToTextAndHtml(blocksData);
        clipboardData.setData("text/plain", text);
        clipboardData.setData("text/html", html);

        console.log("CopyPastePlugin._copySelectedContent: copied to clipboard, MIME_TYPE data=", JSON.stringify(blocksData));
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

        if (startIndex === -1 || endIndex === -1) {
            console.warn("CopyPastePlugin: startBlock or endBlock not found in editor.blocks");
            this.editor.multiSelection.clearSelection();
            return;
        }

        const isTextEditable = (block: BaseBlock) =>
            (block.type === 'text' || block.type === 'list') && block.el;

        if (startIndex === endIndex) {
            // 같은 블록 내 삭제
            if (isTextEditable(startBlock)) {
                const editableEl = this._getEditableElement(startBlock);
                if (editableEl) {
                    this._deleteTextRange(editableEl, startOffset, endOffset);
                }
            }
        } else {
            // 여러 블록에 걸친 삭제
            // 시작 블록: startOffset 이후 삭제
            if (isTextEditable(startBlock)) {
                const editableEl = this._getEditableElement(startBlock);
                if (editableEl) {
                    const fullText = editableEl.textContent || '';
                    editableEl.textContent = fullText.substring(0, startOffset);
                }
            }

            // 끝 블록: endOffset 이전 삭제
            if (isTextEditable(endBlock)) {
                const editableEl = this._getEditableElement(endBlock);
                if (editableEl) {
                    const fullText = editableEl.textContent || '';
                    editableEl.textContent = fullText.substring(endOffset);
                }
            }

            // 중간 블록들 삭제 (역순으로 삭제하여 인덱스 문제 방지)
            for (let i = endIndex - 1; i > startIndex; i--) {
                this.editor.blocks.splice(i, 1);
            }

            // 시작/끝 블록이 모두 텍스트 편집 가능 블록이면 병합
            if (isTextEditable(startBlock) && isTextEditable(endBlock)) {
                const startEl = this._getEditableElement(startBlock);
                const endEl = this._getEditableElement(endBlock);
                if (startEl && endEl) {
                    startEl.textContent =
                        (startEl.textContent || '') + (endEl.textContent || '');

                    // 끝 블록 삭제 (중간 블록들을 삭제했으므로 인덱스 재계산 필요)
                    const newEndIdx = this.editor.blocks.indexOf(endBlock);
                    if (newEndIdx !== -1) {
                        this.editor.blocks.splice(newEndIdx, 1);
                    }
                }
            }
        }

        this.editor.multiSelection.clearSelection();
        this.editor.renderer.render(this.editor.blocks);
        this.editor.saveHistory();
        this.editor.eventBus.emit('document:mutated');
    }

    /**
     * 블록의 편집 가능한 요소를 반환
     * 텍스트 블록은 el 자체, 리스트 블록은 .list-item-content 요소
     */
    private _getEditableElement(block: BaseBlock): HTMLElement | null {
        if (!block.el) return null;
        if (block.type === 'list') {
            return block.el.querySelector('.list-item-content') as HTMLElement | null;
        }
        return block.el;
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
                html += ' '; // <br> 대신 공백 사용 (한 블록 내에서 줄바꿈 문제 방지)
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

            console.log("CopyPastePlugin._pasteBlocks: blocksData=", blocksData);

            if (!Array.isArray(blocksData) || blocksData.length === 0) return;

            // 현재 선택이 있으면 삭제
            if (this.editor.multiSelection.hasSelection()) {
                console.log("CopyPastePlugin._pasteBlocks: deleting selected content");
                this._deleteSelectedContent();
            }

            const currentBlock = this.editor.selection.getCurrentBlock() ||
                                 this.editor.getSelectedBlock();

            const isCurrentTextEditable = currentBlock &&
                (currentBlock.type === 'text' || currentBlock.type === 'list') &&
                currentBlock.el;

            if (!currentBlock || !isCurrentTextEditable) {
                console.warn("CopyPastePlugin._pasteBlocks: Current block is not a text-editable block");
                return;
            }

            // 편집 가능한 요소 찾기 (텍스트: el 자체, 리스트: .list-item-content)
            const editableEl = this._getEditableElement(currentBlock);
            if (!editableEl) {
                console.warn("CopyPastePlugin._pasteBlocks: No editable element found");
                return;
            }

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                console.warn("CopyPastePlugin._pasteBlocks: No selection range available.");
                return;
            }

            const range = selection.getRangeAt(0);

            // 커서 이후의 내용을 추출 (나중에 마지막 블록에 붙일 것)
            const afterRange = range.cloneRange();
            afterRange.selectNodeContents(editableEl);
            afterRange.setStart(range.endContainer, range.endOffset);
            const afterFragment = afterRange.extractContents();
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(afterFragment);
            const afterHtml = tempDiv.innerHTML || "";

            // 첫 번째 블록 데이터를 현재 커서 위치에 삽입
            const firstBlockData = blocksData[0];
            if (firstBlockData && (firstBlockData.type === 'text' || firstBlockData.type === 'list')) {
                const firstHtml = (firstBlockData as any).html || '';

                // 현재 위치에 첫 번째 블록 내용 삽입
                const insertRange = range.cloneRange();
                const tempInsert = document.createElement('div');
                tempInsert.innerHTML = firstHtml;
                const insertFragment = document.createDocumentFragment();
                while (tempInsert.firstChild) {
                    insertFragment.appendChild(tempInsert.firstChild);
                }
                insertRange.insertNode(insertFragment);
            }

            // 나머지 블록들을 새로운 블록으로 생성
            const currentBlockIndex = this.editor.blocks.indexOf(currentBlock);
            const newBlocks: BaseBlock[] = [];

            for (let i = 1; i < blocksData.length; i++) {
                const blockData = blocksData[i];
                if (!blockData) continue;
                const toolConfig = this.editor.toolSettings[blockData.type];
                const newBlock = createBlockFromJSON(blockData, {
                    config: toolConfig?.config ?? {},
                    api: {
                        removeBlock: (block) => this.editor.removeBlock(block),
                        editor: this.editor
                    }
                });
                newBlocks.push(newBlock);
            }

            // 마지막 블록에 커서 이후 내용 추가
            if (newBlocks.length > 0) {
                const lastBlock = newBlocks[newBlocks.length - 1];
                const lastEditableEl = lastBlock ? this._getEditableElement(lastBlock) : null;
                if (lastEditableEl && afterHtml) {
                    lastEditableEl.innerHTML = (lastEditableEl.innerHTML || '') + afterHtml;
                }
            } else if (afterHtml) {
                // 블록이 하나뿐이면 현재 블록에 afterHtml 추가
                editableEl.innerHTML = (editableEl.innerHTML || '') + afterHtml;
            }

            // 새 블록들을 현재 블록 다음에 삽입
            newBlocks.forEach((block, idx) => {
                this.editor.blocks.splice(currentBlockIndex + 1 + idx, 0, block);
            });

            this.editor.renderer.render(this.editor.blocks);
            this.editor.saveHistory();
            this.editor.eventBus.emit('document:mutated');

            // 마지막 블록 또는 현재 블록에 포커스
            const focusBlock = newBlocks.length > 0 ? newBlocks[newBlocks.length - 1] : currentBlock;
            if (focusBlock) {
                requestAnimationFrame(() => {
                    this.editor.selectAndFocusBlock(focusBlock);
                    if (focusBlock.el) {
                        // 마지막 위치로 커서 이동
                        this.editor.selection.setRange(focusBlock.el, focusBlock.el.textContent?.length || 0);
                    }
                });
            }

            console.log("CopyPastePlugin._pasteBlocks: paste completed");
        } catch (error) {
            console.error("CopyPastePlugin: Failed to parse blocks data:", error);
        }
    }
}
