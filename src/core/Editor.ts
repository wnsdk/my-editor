import {
    EditorOptions,
    BaseBlockData,
    PluginInterface,
    PluginConstructor,
    ToolType, ToolConfig, TextBlockData, ListBlockData, ImageBlockData, VideoBlockData, ImageToolConfig, VideoToolConfig,
    UploaderConfig
} from '../types/index.js';
import EventBus from "./EventBus.js";
import History from "./History.js";
import Selection from "./Selection.js";
import MultiBlockSelection from "./MultiBlockSelection.js";
import Renderer from "./Renderer.js";
import { createBlock, createBlockFromJSON } from "../blocks/BlockFactory.js";
import Plugin from "./Plugin.js";
import TextBlock from "../blocks/editable/TextBlock";
import ImageBlock from "../blocks/media/ImageBlock";
import VideoBlock from "../blocks/media/VideoBlock";
import BaseBlock from "../blocks/BaseBlock";
import {
    BlockMoveHandlerPlugin,
    DragDropHandlerPlugin,
    ExternalToolPlugin, ImageBlockPlugin,
    KeyHandlerPlugin, ListBlockPlugin,
    CopyPastePlugin, PlaceholderPlugin, TextBlockPlugin, ToolbarPlugin, VideoBlockPlugin,
    SelectionPlugin
} from "../plugins";
import { isListBlock } from "../utils/typeGuards.js";

/**
 * Mnote 에디터의 핵심 클래스입니다.
 * 에디터의 초기화, 렌더링, 이벤트 바인딩 및 플러그인 관리를 총괄합니다.
 */
export default class Editor {
    public root: HTMLElement;

    public toolbarEnabled: boolean;
    public placeholderText: string;
    public toolSettings: Partial<Record<ToolType, ToolConfig>>;
    public blocks: BaseBlock[];
    public readOnly: boolean;

    public eventBus: EventBus;
    public history: History;
    public selection: Selection;
    public multiSelection: MultiBlockSelection;
    public renderer: Renderer;
    public plugins: PluginInterface[];
    public blockCountChangeCallbacks: Record<string, (currentCount: number, maxCount?: number) => void> = {};
    private options: EditorOptions;



    constructor(options: EditorOptions) {
        this.options = options;
        const {
            holder,
            toolbar = true,
            placeholder = "",
            tools = {},
            plugins = [],
            readOnly = false
        } = options;

        this.root = typeof holder === "string" ? document.getElementById(holder)! : holder;
        if (!this.root) {
            throw new Error("Editor: holder element not found!");
        }
        this.toolbarEnabled = toolbar;
        this.placeholderText = placeholder;
        this.readOnly = readOnly;
        this.toolSettings = {};
        Object.assign(this.toolSettings, tools);

        this.blocks = [];
        this.eventBus = new EventBus();
        this.history = new History();
        this.selection = new Selection(this);
        this.multiSelection = new MultiBlockSelection(this);
        this.renderer = new Renderer(this);
        this.plugins = [];

        this._initializePluginsAndToolSettings(plugins);
        this._mergeToolSettings(this.toolSettings, tools);
        this._initializeBlockCountChangeCallbacks();

        this.init();

        this.eventBus.on('document:mutated', () => {
            if (typeof this.options.onChange === 'function') {
                this.options.onChange(this.serialize());
            }
        });
    }

    /**
     * 에디터를 초기화합니다.
     */
    init() {
        this._setupRootElement();
        this.blocks = [this.createDefaultBlock()];
        this.renderer.render(this.blocks);

        // readOnly 모드가 아닐 때만 이벤트 리스너 등록
        if (!this.readOnly) {
            this.root.addEventListener("click", this.handleBlockClick.bind(this));
            this.root.addEventListener("input", () => {
                this.eventBus.emit("document:mutated");
            });

            // 첫 번째 블록에 자동 포커스 설정
            // requestAnimationFrame을 사용하여 DOM이 완전히 렌더링된 후 포커스
            requestAnimationFrame(() => {
                const firstBlock = this.blocks[0];
                if (firstBlock && firstBlock.el) {
                    this.selection.setRangeAtStart(firstBlock.el);
                }
            });
        }

        this.saveHistory();
    }


    /**
     * 에디터의 루트 DOM 요소를 설정합니다.
     */
    private _setupRootElement() {
        this.root.classList.add("editor-root");

        if (this.readOnly) {
            this.root.contentEditable = "false";
            this.root.classList.add("editor-readonly");
        } else {
            this.root.contentEditable = "true";
        }

        this.root.setAttribute('spellcheck', 'false');
    }






    /* ========================================
     *  플러그인 / 툴 관련
     * ======================================== */

    /**
     * toolSettings에서 onCountChange 콜백을 추출하여 등록합니다.
     */
    private _initializeBlockCountChangeCallbacks() {
        Object.entries(this.toolSettings).forEach(([type, settings]) => {
            if (settings.onCountChange && typeof settings.onCountChange === 'function') {
                this.blockCountChangeCallbacks[type] = settings.onCountChange;
            }
        });
    }

    /**
     * 기본 플러그인 및 사용자 정의 플러그인을 초기화하고 toolSettings를 수집합니다.
     */
    private _initializePluginsAndToolSettings(customPlugins: PluginConstructor[]){
        // 1. 항상 활성화되는 핵심 플러그인
        const corePlugins: PluginConstructor[] = [
            TextBlockPlugin, // 텍스트 블록은 기본적으로 포함
        ];

        // readOnly 모드가 아닐 때만 편집 관련 플러그인 추가
        if (!this.readOnly) {
            corePlugins.push(
                KeyHandlerPlugin,
                CopyPastePlugin,
                DragDropHandlerPlugin,
                BlockMoveHandlerPlugin,
                ExternalToolPlugin,
                SelectionPlugin
            );
        }

        // 2. tools 설정에 따라 선택적으로 활성화되는 블록 플러그인들
        const optionalBlockPlugins: PluginConstructor[] = [
            ImageBlockPlugin,
            VideoBlockPlugin,
            ListBlockPlugin,
        ];

        if (this.toolbarEnabled && !this.readOnly) {
            corePlugins.push(ToolbarPlugin);
        }

        if (this.placeholderText && !this.readOnly) {
            corePlugins.push(PlaceholderPlugin);
        }

        // 3. 활성화할 플러그인 목록 결정
        const activePlugins: PluginConstructor[] = [...corePlugins];

        optionalBlockPlugins.forEach(PluginClass => {
            if (typeof PluginClass.getToolSettings === 'function') {
                const settings = PluginClass.getToolSettings();
                const toolType = Object.keys(settings)[0] as ToolType;

                // 사용자가 Editor 생성 시 tools 옵션에 해당 타입을 넣었는지 확인
                if (this.options.tools && this.options.tools[toolType]) {
                    activePlugins.push(PluginClass);
                }
            }
        });

        // 4. 플러그인 인스턴스 생성 및 초기화
        [...activePlugins, ...customPlugins].forEach(PluginClass => {
            if (PluginClass.prototype instanceof Plugin) {
                const pluginInstance = new PluginClass(this);
                this.plugins.push(pluginInstance);
                pluginInstance.initialize();

                if (typeof PluginClass.getToolSettings === 'function') {
                    // 플러그인의 기본 설정과 사용자의 설정을 병합
                    this._mergeToolSettings(this.toolSettings, PluginClass.getToolSettings());
                }
            } else {
                console.warn("Editor: Provided plugin does not extend base Plugin class.", PluginClass);
            }
        });
    }


    /**
     * 특정 타입의 도구 설정을 가져옵니다.
     */
    getToolConfig(type: ToolType): ToolConfig | undefined {
        return this.toolSettings[type];
    }



    getImageUploader(): UploaderConfig | null {
        const tool = this.getToolConfig("image")?.config as ImageToolConfig | undefined;
        return tool?.uploader ?? null;
    }

    getVideoUploader(): UploaderConfig | null {
        const tool = this.getToolConfig("video")?.config as VideoToolConfig | undefined;
        return tool?.uploader ?? null;
    }




    private _mergeToolSettings(
        base: Record<string, ToolConfig>,
        override: Record<string, ToolConfig>
    ) {
        (Object.keys(override) as ToolType[]).forEach(type => {
            this.toolSettings[type] = {
                ...this.toolSettings[type],
                ...override[type],
                config: {
                    ...(this.toolSettings[type]?.config ?? {}),
                    ...(override[type]?.config ?? {})
                }
            };
        });
    }





    /* ========================================
     *  블록 생성 / 관리
     * ======================================== */

    /**
     * 에디터의 초기 블록(텍스트 블록)을 생성합니다.
     */
    createDefaultBlock(): BaseBlock {
        const defaultTextConfig = this.toolSettings["text"] || {};
        return createBlock("text", "", {
            config: defaultTextConfig.config ?? {},
            api: {
                removeBlock: (block: BaseBlock) => this.removeBlock(block),
                editor: this
            }
        });
    }


    /**
     * 새 블록을 에디터에 삽입합니다.
     */
    insertBlock(block: BaseBlock): BaseBlock | null {
        if (!this.checkBlockMaxCount(block.type)) return null;

        if (this.isEditorEmpty() && (block.type === 'image' || block.type === 'video')) {
            // 에디터가 비어있고 이미지/비디오 블록을 삽입하는 경우, 기본 텍스트 블록을 대체
            this.blocks.splice(0, 1, block);
        } else {
            const current = this.selection.getCurrentBlock();
            if (current) {
                this.addBlockAfter(current, block);
            } else {
                this.blocks.push(block);
            }
        }

        this._notifyBlockCountChange(block.type);
        this._commitChange();

        return block;
    }

    /**
     * 특정 블록 앞에 새 블록을 추가합니다.
     */
    addBlockBefore(targetBlock: BaseBlock, newBlock: BaseBlock): void {
        const idx = this.blocks.indexOf(targetBlock);
        if (idx === -1) {
            this.blocks.unshift(newBlock);
        } else {
            this.blocks.splice(idx, 0, newBlock);
        }
        this.renderer.render(this.blocks);
        this.saveHistory();
    }

    /**
     * 특정 블록 뒤에 새 블록을 추가합니다.
     */
    addBlockAfter(targetBlock: BaseBlock, newBlock: BaseBlock): void {
        const idx = this.blocks.indexOf(targetBlock);
        if (idx === -1) {
            this.blocks.push(newBlock);
        } else {
            this.blocks.splice(idx + 1, 0, newBlock);
        }
        this.renderer.render(this.blocks);
        this.saveHistory();
        newBlock.focus?.();
    }

    /**
     * 현재 선택된 블록을 복제합니다.
     * @returns {BaseBlock | null} 복제된 블록 또는 복제 실패 시 null
     */
    duplicateBlock(blockToDuplicate?: BaseBlock): BaseBlock | null {
        const targetBlock = blockToDuplicate || this.getSelectedBlock() || this.selection.getCurrentBlock();
        if (!targetBlock) {
            return null;
        }

        // 블록 타입에 따른 최대 개수 체크
        if (!this.checkBlockMaxCount(targetBlock.type)) {
            return null;
        }

        // 블록 데이터를 복사하여 새 블록 생성
        const blockData = targetBlock.toJSON();
        const toolConfig = this.toolSettings[blockData.type];

        const duplicatedBlock = createBlockFromJSON(blockData, {
            config: toolConfig?.config ?? {},
            api: {
                removeBlock: (block: BaseBlock) => this.removeBlock(block),
                editor: this
            }
        });

        // 원본 블록 바로 뒤에 복제된 블록 삽입
        const idx = this.blocks.indexOf(targetBlock);
        if (idx === -1) {
            this.blocks.push(duplicatedBlock);
        } else {
            this.blocks.splice(idx + 1, 0, duplicatedBlock);
        }

        this._notifyBlockCountChange(duplicatedBlock.type);
        this.renderer.render(this.blocks);
        this.saveHistory();

        // 복제된 블록에 포커스
        requestAnimationFrame(() => {
            this.selectAndFocusBlock(duplicatedBlock);
            if (duplicatedBlock.type === 'text' && duplicatedBlock.el) {
                this.selection.setRangeAtEnd(duplicatedBlock.el);
            }
        });

        return duplicatedBlock;
    }

    /**
     * 에디터에서 특정 블록을 제거합니다.
     */
    removeBlock(blockToRemove: BaseBlock): void {
        const type = blockToRemove.type;
        this.blocks = this.blocks.filter(b => b !== blockToRemove);

        this.handleEmptyEditorState(); // 에디터가 비어있는 상태 처리
        this._notifyBlockCountChange(type);

        this._commitChange();
    }

    /**
     * 에디터가 비어있는 상태일 때 기본 텍스트 블록을 추가합니다.
     */
    handleEmptyEditorState() {
        if (this.blocks.length === 0) {
            const defaultBlock = this.createDefaultBlock();
            this.blocks = [defaultBlock];
            this.selectAndFocusBlock(defaultBlock)
        }
    }






    /* ========================================
     *  블록 개수 / 제한
     * ======================================== */

    /**
     * 특정 타입의 블록 개수를 반환합니다.
     */
    getBlockCount(type: ToolType): number {
        return this.blocks.filter(block => block.type === type).length;
    }

    /**
     * 블록 삽입 전 최대 개수 제한을 확인합니다.
     */
    checkBlockMaxCount(type: ToolType): boolean {
        const toolConfig = this.getToolConfig(type);
        if (!toolConfig) return false;

        const maxCount = toolConfig.maxCount;
        const currentCount = this.getBlockCount(type);

        if (maxCount !== undefined && currentCount >= maxCount) {
            if (toolConfig.onMaxCountReached && typeof toolConfig.onMaxCountReached === 'function') {
                toolConfig.onMaxCountReached(maxCount);
            }
            return false;
        }
        return true;
    }



    /**
     * 블록 개수 변경을 감지하고 등록된 콜백을 실행합니다.
     */
    private _notifyBlockCountChange(type: ToolType): void {
        const currentCount = this.getBlockCount(type);
        const toolConfig = this.getToolConfig(type);
        if (!toolConfig) return;

        const maxCount = toolConfig.maxCount;

        // 등록된 콜백이 있으면 실행
        if (this.blockCountChangeCallbacks && this.blockCountChangeCallbacks[type]) {
            this.blockCountChangeCallbacks[type](currentCount, maxCount);
        }
    }


    getRemainingCount(type: ToolType): number {
        const toolConfig = this.getToolConfig(type);
        if (!toolConfig) return 0;

        const maxCount = toolConfig.maxCount;

        if (maxCount == null) return Infinity;

        const current = this.getBlockCount(type);
        return Math.max(0, maxCount - current);
    }

    canInsert(type: ToolType) {
        return this.getRemainingCount(type) > 0;
    }






    /* ========================================
     *  블록 선택 / 포커스
     * ======================================== */


    /**
     * 에디터 루트 요소의 클릭 이벤트를 처리합니다.
     */
    handleBlockClick(event: MouseEvent) {
        const clickedBlockEl = event.target instanceof Element
            ? event.target.closest(".block")
            : null;

        // 블록이 클릭된 경우
        if (clickedBlockEl instanceof HTMLElement) {
            const blockId = clickedBlockEl.dataset["blockId"];
            if (blockId) {
                const clickedBlock = this.blocks.find(b => b.id === blockId);
                if (clickedBlock) {
                    this.selectAndFocusBlock(clickedBlock, event);
                }
            }
        } else {
            // 에디터의 빈 공간을 클릭했을 때 처리
            this._handleEmptySpaceClick(event);
        }
    }


    /**
     * 에디터의 빈 공간을 클릭했을 때 캐럿 위치를 조정합니다.
     */
    private _handleEmptySpaceClick(event: MouseEvent) {
        if (this.isEditorEmpty() && this.blocks[0]) {
            this.selectAndFocusBlock(this.blocks[0], event);
            return;
        }

        // 텍스트 블록이 아닌 곳을 클릭했을 때, 가장 가까운 텍스트 블록으로 포커스 이동
        const textBlocks = this.blocks.filter(b => b.type === 'text');
        if (textBlocks.length > 0) {
            const lastTextBlock = textBlocks[textBlocks.length - 1];
            if (lastTextBlock) {
                this.selectAndFocusBlock(lastTextBlock, event);
                if (lastTextBlock.el) {
                    this.selection.setRangeAtEnd(lastTextBlock.el);
                } // 캐럿을 블록의 끝으로 이동
            }
        } else if (this.blocks.length > 0 && this.blocks[0]) {
            // 텍스트 블록이 없고 다른 블록만 있는 경우, 첫 블록에 포커스
            this.selectAndFocusBlock(this.blocks[0], event);
        }
    }

    /**
     * 특정 블록을 선택하고 포커스를 설정합니다.
     */
    selectAndFocusBlock(blockToSelect: BaseBlock, event?: Event) {
        // readOnly 모드에서는 블록 선택/포커스 비활성화
        if (this.readOnly) return;

        this.blocks.forEach(block => {
            if (block !== blockToSelect && block.el) {
                block.el.classList.remove("selected");
            }
        });

        // 미디어 블록(이미지, 비디오)을 선택할 때는 기존 텍스트 커서를 제거
        if (blockToSelect && (blockToSelect.type === 'image' || blockToSelect.type === 'video')) {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
            }
        }

        if (blockToSelect && blockToSelect.el) {
            blockToSelect.el.classList.add("selected");
            blockToSelect.focus(event); // 블록 자체의 focus 메서드 호출
        }
    }

    /**
     * 현재 선택된 블록을 가져옵니다.
     */
    getSelectedBlock(): BaseBlock | null {
        const selectedEl = this.root.querySelector('.block.selected');
        if (!selectedEl) return null;

        const blockId = (selectedEl as HTMLElement).dataset["blockId"];
        if (!blockId) return null;

        return this.blocks.find(b => b.id === blockId) || null;
    }





    
    /* ========================================
     *  히스토리 / 상태
     * ======================================== */
    
    /**
     * 현재 에디터 상태를 히스토리에 저장합니다.
     */
    saveHistory() {
        this.history.push(this.serialize());
    }

    /**
     * 실행 취소 (Undo)를 수행합니다.
     * @returns {boolean} 실행 취소가 성공하면 true, 그렇지 않으면 false
     */
    undo(): boolean {
        if (!this.history.canUndo()) {
            return false;
        }

        const previousState = this.history.undo() as BaseBlockData[] | null;
        if (!previousState) {
            return false;
        }

        this._restoreState(previousState);
        return true;
    }

    /**
     * 다시 실행 (Redo)을 수행합니다.
     * @returns {boolean} 다시 실행이 성공하면 true, 그렇지 않으면 false
     */
    redo(): boolean {
        if (!this.history.canRedo()) {
            return false;
        }

        const nextState = this.history.redo() as BaseBlockData[] | null;
        if (!nextState) {
            return false;
        }

        this._restoreState(nextState);
        return true;
    }

    /**
     * 히스토리 상태를 복원합니다.
     */
    private _restoreState(state: BaseBlockData[]): void {
        this.blocks = state.map(data => {
            const toolConfig = this.toolSettings[data.type];

            return createBlockFromJSON(data, {
                config: toolConfig?.config ?? {},
                api: {
                    removeBlock: (block: BaseBlock) => this.removeBlock(block),
                    editor: this
                }
            });
        });

        this.renderer.render(this.blocks);

        // 첫 번째 블록에 포커스
        requestAnimationFrame(() => {
            if (this.blocks.length > 0 && this.blocks[0]?.el) {
                this.selectAndFocusBlock(this.blocks[0]);
                if (this.blocks[0].type === 'text') {
                    this.selection.setRangeAtStart(this.blocks[0].el);
                }
            }
        });

        // 블록 카운트 콜백 호출
        const types = new Set(this.blocks.map(b => b.type));
        types.forEach(type => this._notifyBlockCountChange(type));

        this.eventBus.emit("document:mutated");
    }

    /**
     * 현재 에디터의 모든 블록을 JSON 형식으로 직렬화합니다.
     */
    serialize(): BaseBlockData[] {
        return this.blocks.map(b => b.toJSON());
    }

    /**
     * JSON 데이터로부터 에디터 상태를 로드합니다.
     */
    load(jsonBlocks: BaseBlockData[]): void {
        this.blocks = jsonBlocks.map(data => {
            const toolConfig = this.toolSettings[data.type];

            return createBlockFromJSON(data, {
                config: toolConfig?.config ?? {},
                api: {
                    removeBlock: (block: BaseBlock) => this.removeBlock(block),
                    editor: this
                }
            });
        });

        this._commitChange({
            skipHistory: true
        });

        const types = new Set(this.blocks.map(b => b.type));
        types.forEach(type => this._notifyBlockCountChange(type));
    }

    




    /* ========================================
     *  기타
     * ======================================== */

    /**
     * 에디터가 비어있는 상태인지 확인합니다.
     * (텍스트 블록 1개만 있고, 그 블록이 비어있는 경우)
     * @returns {boolean} 에디터가 비어있으면 true, 그렇지 않으면 false
     */
    isEditorEmpty(): boolean {
        return this.blocks.length === 1 &&
            this.blocks[0] != null &&
            this.blocks[0].type === 'text' &&
            this.blocks[0].isEmpty();
    }

    /**
     * 에디터에 의미 있는 콘텐츠가 있는지 확인합니다.
     */
    hasMeaningfulContent(): boolean {
        return this.serialize().some(block => {
            switch (block.type) {
                case "text": {
                    const text = (block as TextBlockData).html ?? "";
                    return text.replace(/<br\s*\/?>/gi, "").trim().length > 0;
                }

                case "list": {
                    const html = (block as ListBlockData).html ?? "";
                    return html.replace(/<br\s*\/?>/gi, "").trim().length > 0;
                }

                case "image": {
                    const src = (block as ImageBlockData)?.src;
                    return typeof src === "string" && src.trim().length > 0;
                }

                case "video": {
                    const src = (block as VideoBlockData)?.src;
                    return typeof src === "string" && src.trim().length > 0;
                }

                default:
                    return false;
            }
        });
    }



    private _commitChange(options?: {
        silent?: boolean;
        skipHistory?: boolean;
    }) {

        if (!options?.skipHistory) {
            this.saveHistory();
        }

        // 리스트 번호 연속성 보장을 위해 렌더링 전/후 갱신 로직 추가 가능
        this.blocks.forEach(block => {
            if (isListBlock(block)) {
                block.refreshListContent();
            }
        });

        this.renderer.render(this.blocks);

        if (!options?.silent) {
            this.eventBus.emit("document:mutated");
        }
    }

    /**
     * 에디터 인스턴스를 정리합니다.
     * 이벤트 리스너 제거, 플러그인 정리, DOM 정리 등을 수행합니다.
     * SPA에서 컴포넌트 언마운트 시 메모리 누수를 방지하기 위해 호출합니다.
     */
    destroy(): void {
        // 1. 이벤트 버스 모든 리스너 제거
        this.eventBus.clear();

        // 2. 플러그인 정리 (destroy 메서드가 있는 경우)
        this.plugins.forEach(plugin => {
            if (typeof (plugin as any).destroy === 'function') {
                (plugin as any).destroy();
            }
        });
        this.plugins = [];

        // 3. 히스토리 초기화
        this.history.clear();

        // 4. MultiBlockSelection 정리
        this.multiSelection.destroy();

        // 5. 블록 정리
        this.blocks.forEach(block => {
            if (typeof (block as any).destroy === 'function') {
                (block as any).destroy();
            }
        });
        this.blocks = [];

        // 6. DOM 정리
        this.root.innerHTML = '';
        this.root.classList.remove('editor-root', 'editor-readonly');
        this.root.removeAttribute('contenteditable');
        this.root.removeAttribute('spellcheck');

        // 7. 콜백 정리
        this.blockCountChangeCallbacks = {};
    }

}

