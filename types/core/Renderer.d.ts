import type Editor from "./Editor";
import type BaseBlock from "../blocks/BaseBlock";
/**
 * 에디터의 블록 모델 리스트를 실제 DOM 요소로 변환하여 화면에 렌더링하는 클래스입니다.
 * DOM과 블록 모델 간의 동기화를 담당합니다.
 */
export default class Renderer {
    private editor;
    /**
     * Renderer의 새 인스턴스를 생성합니다.
     * @param editor - 렌더러가 연결될 Editor 인스턴스.
     */
    constructor(editor: Editor);
    /**
     * 블록 모델 리스트를 기반으로 에디터의 DOM을 업데이트합니다.
     * 이 메서드는 DOM에서 블록을 추가, 제거, 순서 변경합니다.
     */
    render(blockModels: BaseBlock[]): void;
    /**
     * DOM에서 더 이상 존재하지 않는 블록 요소를 제거합니다.
     */
    private _removeDeletedBlocks;
    /**
     * 블록 모델 리스트를 기반으로 DOM에 블록을 추가하거나 순서를 변경합니다.
     */
    private _addOrReorderBlocks;
}
