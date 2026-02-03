import TextEditableBlock from "./TextEditableBlock";
import { ListBlockData, BlockInit } from "../types/blocks";
import { isListBlock } from "../utils/typeGuards";

export default class ListBlock extends TextEditableBlock {
    public style: 'ordered' | 'unordered';
    public html: string;

    constructor(data: ListBlockData, init: BlockInit) {
        super('list', data.depth || 0);
        this.config = init.config;
        this.api = init.api;
        this.style = data.style || 'unordered';
        this.html = data.html || "";
    }

    render(): HTMLElement {
        const container = document.createElement("div");
        container.classList.add("block", "list-block", `list-${this.style}`);
        container.dataset["type"] = "list";

        // 단일 리스트 아이템 렌더링
        const itemRow = document.createElement("div");
        itemRow.classList.add("list-item-row");
        itemRow.style.display = "flex";

        const bullet = document.createElement("span");
        bullet.classList.add("list-bullet");
        bullet.style.marginRight = "8px";
        bullet.style.userSelect = "none";
        bullet.contentEditable = "false";

        // TextEditableBlock의 createEditableElement 사용
        const content = this.createEditableElement("div", "list-item-content");
        this.setHtmlContent(content, this.html);
        content.style.flex = "1";

        itemRow.appendChild(bullet);
        itemRow.appendChild(content);
        container.appendChild(itemRow);

        this.el = container;
        this._updateBullet();
        return container;
    }

    override mount(root: HTMLElement, beforeElement?: HTMLElement | null): void {
        if (!this.el) {
            this.render();
        }
        super.mount(root, beforeElement);
    }

    /**
     * TextEditableBlock의 handleCaretPositioning 오버라이드
     * 리스트의 경우 .list-item-content 요소에 캐럿 배치
     */
    protected override handleCaretPositioning(event: Event | undefined, selection: any): void {
        // 클릭 이벤트인 경우, 클릭한 위치에 자동으로 캐럿 배치됨
        if (event && event instanceof MouseEvent && event.type === 'click') {
            return;
        }

        // 클릭이 아닌 경우 첫 번째 위치로 이동
        const firstContent = this.el.querySelector('.list-item-content');
        if (firstContent instanceof HTMLElement) {
            this.api.editor.selection.setRangeAtStart(firstContent);
        }
    }

    /**
     * TextEditableBlock의 추상 메서드 구현: HTML 콘텐츠 반환
     */
    protected getHtmlContent(): string {
        return this.html;
    }

    /**
     * 리스트 블록의 불릿(번호 또는 기호)을 업데이트합니다.
     */
    public refreshListContent() {
        this._updateBullet();
    }

    /**
     * 불릿 텍스트를 업데이트합니다.
     */
    private _updateBullet() {
        if (!this.el) return;

        const bullet = this.el.querySelector('.list-bullet');
        if (!bullet) return;

        if (this.style === 'ordered') {
            const startNumber = this._calculateStartIndex();
            bullet.textContent = `${startNumber}.`;
        } else {
            bullet.textContent = "•";
        }
    }

    private _calculateStartIndex(): number {
        const editor = this.api.editor;
        const currentIndex = editor.blocks.indexOf(this);
        let sequenceNumber = 1;

        // 이전 블록들을 순회하여 연속된 순서 리스트 블록의 개수를 세기
        for (let i = currentIndex - 1; i >= 0; i--) {
            const prevBlock = editor.blocks[i];
            if (prevBlock && isListBlock(prevBlock) && prevBlock.style === 'ordered') {
                sequenceNumber++;
            } else {
                // 리스트가 끊기면 중단
                break;
            }
        }

        // sequenceNumber가 이전 블록 개수 + 1이므로, 순서를 뒤집어야 함
        // 예: 3개의 이전 리스트가 있으면 sequenceNumber = 4
        // 실제로는 첫 번째부터 시작해야 하므로...
        // 다시 생각: 이전 블록이 3개면 현재는 4번째

        // 연속된 리스트 시작점 찾기
        let startIndex = currentIndex - (sequenceNumber - 1);

        // 시작점부터 현재까지의 순서 계산
        return currentIndex - startIndex + 1;
    }

    toJSON(): ListBlockData {
        // 실제 DOM에서 최신 텍스트 추출
        if (this.el) {
            const content = this.el.querySelector('.list-item-content');
            if (content) {
                this.html = content.innerHTML;
            }
        }
        return {
            id: this.id,
            type: 'list',
            style: this.style,
            html: this.html,
            depth: this.depth
        };
    }
}