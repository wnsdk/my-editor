import { EditorOptions, BaseBlockData, PluginInterface, ToolType, ToolConfig, UploaderConfig } from '../types/index.js';
import EventBus from "./EventBus.js";
import History from "./History.js";
import Selection from "./Selection.js";
import MultiBlockSelection from "./MultiBlockSelection.js";
import Renderer from "./Renderer.js";
import BaseBlock from "../blocks/BaseBlock";
/**
 * Mnote 에디터의 핵심 클래스입니다.
 * 에디터의 초기화, 렌더링, 이벤트 바인딩 및 플러그인 관리를 총괄합니다.
 */
export default class Editor {
    root: HTMLElement;
    toolbarEnabled: boolean;
    placeholderText: string;
    toolSettings: Partial<Record<ToolType, ToolConfig>>;
    blocks: BaseBlock[];
    readOnly: boolean;
    eventBus: EventBus;
    history: History;
    selection: Selection;
    multiSelection: MultiBlockSelection;
    renderer: Renderer;
    plugins: PluginInterface[];
    blockCountChangeCallbacks: Record<string, (currentCount: number, maxCount?: number) => void>;
    private options;
    constructor(options: EditorOptions);
    /**
     * 에디터를 초기화합니다.
     */
    init(): void;
    /**
     * 에디터의 루트 DOM 요소를 설정합니다.
     */
    private _setupRootElement;
    /**
     * toolSettings에서 onCountChange 콜백을 추출하여 등록합니다.
     */
    private _initializeBlockCountChangeCallbacks;
    /**
     * 기본 플러그인 및 사용자 정의 플러그인을 초기화하고 toolSettings를 수집합니다.
     */
    private _initializePluginsAndToolSettings;
    /**
     * 특정 타입의 도구 설정을 가져옵니다.
     */
    getToolConfig(type: ToolType): ToolConfig | undefined;
    getImageUploader(): UploaderConfig | null;
    getVideoUploader(): UploaderConfig | null;
    private _mergeToolSettings;
    /**
     * 에디터의 초기 블록(텍스트 블록)을 생성합니다.
     */
    createDefaultBlock(): BaseBlock;
    /**
     * 새 블록을 에디터에 삽입합니다.
     */
    insertBlock(block: BaseBlock): BaseBlock | null;
    /**
     * 특정 블록 앞에 새 블록을 추가합니다.
     */
    addBlockBefore(targetBlock: BaseBlock, newBlock: BaseBlock): void;
    /**
     * 특정 블록 뒤에 새 블록을 추가합니다.
     */
    addBlockAfter(targetBlock: BaseBlock, newBlock: BaseBlock): void;
    /**
     * 현재 선택된 블록을 복제합니다.
     * @returns {BaseBlock | null} 복제된 블록 또는 복제 실패 시 null
     */
    duplicateBlock(blockToDuplicate?: BaseBlock): BaseBlock | null;
    /**
     * 에디터에서 특정 블록을 제거합니다.
     */
    removeBlock(blockToRemove: BaseBlock): void;
    /**
     * 에디터가 비어있는 상태일 때 기본 텍스트 블록을 추가합니다.
     */
    handleEmptyEditorState(): void;
    /**
     * 특정 타입의 블록 개수를 반환합니다.
     */
    getBlockCount(type: ToolType): number;
    /**
     * 블록 삽입 전 최대 개수 제한을 확인합니다.
     */
    checkBlockMaxCount(type: ToolType): boolean;
    /**
     * 블록 개수 변경을 감지하고 등록된 콜백을 실행합니다.
     */
    private _notifyBlockCountChange;
    getRemainingCount(type: ToolType): number;
    canInsert(type: ToolType): boolean;
    /**
     * 에디터 루트 요소의 클릭 이벤트를 처리합니다.
     */
    handleBlockClick(event: MouseEvent): void;
    /**
     * 에디터의 빈 공간을 클릭했을 때 캐럿 위치를 조정합니다.
     */
    private _handleEmptySpaceClick;
    /**
     * 특정 블록을 선택하고 포커스를 설정합니다.
     */
    selectAndFocusBlock(blockToSelect: BaseBlock, event?: Event): void;
    /**
     * 현재 선택된 블록을 가져옵니다.
     */
    getSelectedBlock(): BaseBlock | null;
    /**
     * 현재 에디터 상태를 히스토리에 저장합니다.
     */
    saveHistory(): void;
    /**
     * 실행 취소 (Undo)를 수행합니다.
     * @returns {boolean} 실행 취소가 성공하면 true, 그렇지 않으면 false
     */
    undo(): boolean;
    /**
     * 다시 실행 (Redo)을 수행합니다.
     * @returns {boolean} 다시 실행이 성공하면 true, 그렇지 않으면 false
     */
    redo(): boolean;
    /**
     * 히스토리 상태를 복원합니다.
     */
    private _restoreState;
    /**
     * 현재 에디터의 모든 블록을 JSON 형식으로 직렬화합니다.
     */
    serialize(): BaseBlockData[];
    /**
     * JSON 데이터로부터 에디터 상태를 로드합니다.
     */
    load(jsonBlocks: BaseBlockData[]): void;
    /**
     * 에디터가 비어있는 상태인지 확인합니다.
     * (텍스트 블록 1개만 있고, 그 블록이 비어있는 경우)
     * @returns {boolean} 에디터가 비어있으면 true, 그렇지 않으면 false
     */
    isEditorEmpty(): boolean;
    /**
     * 에디터에 의미 있는 콘텐츠가 있는지 확인합니다.
     */
    hasMeaningfulContent(): boolean;
    private _commitChange;
    /**
     * 에디터 인스턴스를 정리합니다.
     * 이벤트 리스너 제거, 플러그인 정리, DOM 정리 등을 수행합니다.
     * SPA에서 컴포넌트 언마운트 시 메모리 누수를 방지하기 위해 호출합니다.
     */
    destroy(): void;
}
