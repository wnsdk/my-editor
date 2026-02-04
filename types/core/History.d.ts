/**
 * 편집 내용의 실행 취소(Undo)와 다시 실행(Redo)을 위한 상태 스택을 관리하는 클래스입니다.
 */
export interface HistoryState {
    canUndo: boolean;
    canRedo: boolean;
    stackSize: number;
    currentIndex: number;
}
export default class History {
    /**
     * 에디터 상태를 저장하는 스택입니다. 각 상태는 JSON 문자열로 직렬화되어 저장됩니다.
     */
    private historyStack;
    /**
     * 현재 상태 스택의 인덱스입니다.
     */
    private currentIndex;
    /**
     * 히스토리 스택의 최대 크기입니다.
     */
    private limit;
    /**
     * History의 새 인스턴스를 생성합니다.
     * @param limit - 히스토리 스택에 저장할 최대 상태 개수.
     */
    constructor(limit?: number);
    /**
     * 현재 에디터 상태를 히스토리 스택에 추가합니다.
     * 새로운 상태가 추가되면 현재 인덱스 이후의 모든 상태는 버려집니다.
     * @param state - 저장할 에디터 상태 객체.
     */
    push(state: unknown): void;
    /**
     * 실행 취소(Undo)가 가능한지 여부를 확인합니다.
     * @returns 실행 취소가 가능하면 true, 그렇지 않으면 false.
     */
    canUndo(): boolean;
    /**
     * 다시 실행(Redo)이 가능한지 여부를 확인합니다.
     * @returns 다시 실행이 가능하면 true, 그렇지 않으면 false.
     */
    canRedo(): boolean;
    /**
     * 이전 상태로 되돌립니다 (Undo).
     * @returns 이전 에디터 상태 객체 또는 실행 취소가 불가능한 경우 null.
     */
    undo(): unknown | null;
    /**
     * 다음 상태로 다시 실행합니다 (Redo).
     * @returns 다음 에디터 상태 객체 또는 다시 실행이 불가능한 경우 null.
     */
    redo(): unknown | null;
    /**
     * 히스토리 스택을 초기화합니다.
     */
    clear(): void;
    /**
     * 현재 히스토리 상태 정보를 반환합니다.
     */
    getState(): HistoryState;
}
