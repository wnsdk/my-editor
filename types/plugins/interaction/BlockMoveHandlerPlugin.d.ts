import Plugin from "../../core/Plugin";
import { Editor } from "../../index";
/**
 * 블록 이동 버튼 클릭을 통해 블록의 순서를 위아래로 변경하는 기능을 제공하는 플러그인입니다.
 */
export default class BlockMoveHandlerPlugin extends Plugin {
    constructor(editor: Editor);
    /**
     * 플러그인을 초기화하고 에디터 루트에 클릭 이벤트 리스너를 등록합니다.
     */
    initialize(): void;
    /**
     * 에디터 루트에서 발생하는 클릭 이벤트를 처리합니다.
     * 블록 이동 버튼 클릭 시 해당 블록의 순서를 변경합니다.
     */
    onClick(e: MouseEvent): void;
    /**
     * 블록 배열 내에서 위치 이동
     */
    private _moveBlock;
}
