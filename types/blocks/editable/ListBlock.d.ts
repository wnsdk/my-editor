import TextEditableBlock from "./TextEditableBlock";
import { ListBlockData, BlockInit } from "../../types/blocks";
export default class ListBlock extends TextEditableBlock {
    style: 'ordered' | 'unordered';
    html: string;
    constructor(data: ListBlockData, init: BlockInit);
    render(): HTMLElement;
    mount(root: HTMLElement, beforeElement?: HTMLElement | null): void;
    /**
     * TextEditableBlock의 handleCaretPositioning 오버라이드
     * 리스트의 경우 .list-item-content 요소에 캐럿 배치
     */
    protected handleCaretPositioning(event: Event | undefined, selection: any): void;
    /**
     * TextEditableBlock의 추상 메서드 구현: HTML 콘텐츠 반환
     */
    protected getHtmlContent(): string;
    /**
     * 리스트 블록의 불릿(번호 또는 기호)을 업데이트합니다.
     */
    refreshListContent(): void;
    /**
     * 불릿 텍스트를 업데이트합니다.
     */
    private _updateBullet;
    private _calculateStartIndex;
    toJSON(): ListBlockData;
}
