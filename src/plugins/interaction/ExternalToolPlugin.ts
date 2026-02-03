import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
import {ImageToolConfig, ToolConfig, ToolType, VideoToolConfig} from "../../types";
import ImageBlock from "../../blocks/ImageBlock";
import VideoBlock from "../../blocks/VideoBlock";

/**
 * 외부 UI 요소(버튼 등)와 에디터의 블록 삽입/업로드 기능을 연결하는 플러그인입니다.
 * `toolSettings`에 정의된 `fileSelectButton`를 기반으로 클릭 이벤트를 바인딩합니다.
 */
export default class ExternalToolPlugin extends Plugin {

    constructor(editor: Editor) {
        super(editor);
    }

    initialize() {
        this._bindExternalTools();
    }

    isImageOrVideoToolConfig(
        type: string,
        config: any
    ): config is ImageToolConfig | VideoToolConfig {
        return type === "image" || type === "video";
    }

    /**
     * `toolSettings`에 정의된 외부 도구 버튼에 클릭 이벤트 리스너를 바인딩합니다.
     */
    private _bindExternalTools() {
        Object.entries(this.editor.toolSettings).forEach(([type, settings]) => {
            if (!settings) return;

            const config = settings.config;
            if (!this.isImageOrVideoToolConfig(type, config)) return;

            // uploader가 없으면 스킵 (readOnly 모드 등)
            if (!config.uploader || !config.uploader.fileSelectButton) return;

            const element = document.getElementById(config.uploader.fileSelectButton);
            if (!element) {
                console.warn(
                    `Editor: External tool element #${config.uploader.fileSelectButton} for type "${type}" not found.`
                );
                return;
            }

            element.addEventListener("click", (event: MouseEvent) => {
                this._handleToolButtonClick(
                    event,
                    type as "image" | "video",
                    config
                );
            });
        });
    }



    /**
     * 외부 도구 버튼 클릭 이벤트를 처리합니다.
     * 블록 최대 개수 제한을 확인하고, 커스텀 선택 로직 또는 파일 업로드 로직을 실행합니다.
     */
    private async _handleToolButtonClick(
        event: MouseEvent,
        type: "image" | "video",
        config: ImageToolConfig | VideoToolConfig
    ): Promise<void> {
        event.preventDefault();

        // 최대 개수 제한 확인
        if (!this.editor.checkBlockMaxCount(type)) return;


        if (config.uploader.openFilePicker) {
            // 커스텀 선택 로직
            try {
                await config.uploader.openFilePicker();
            } catch (err) {
                console.error(
                    `ExternalToolPlugin: Custom select for type "${type}" failed:`,
                    err
                );
            }
        } else if (config.uploader?.uploadByFile) {
            // 파일 업로드 로직
            await this._handleFileUpload(type, config.uploader.uploadByFile);
        }
    }



    /**
     * 파일 선택 후 미디어 블록 추가
     */
    private async _handleFileUpload(
        type: ToolType,
        uploadFn: (file: File) => Promise<any>
    ): Promise<void> {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = type === "video" ? "video/*" : "image/*";

        input.onchange = async (event: Event) => {
            const target = event.target as HTMLInputElement | null;
            const file = target?.files?.[0];
            if (!file) return;

            try {
                const response = await uploadFn(file);

                const src =
                    typeof response === "string"
                        ? response
                        : response?.url ??
                        response?.file?.url ??
                        "";

                if (src) {
                    // 타입에 따라 적절한 블록 생성
                    const toolConfig = this.editor.getToolConfig(type);
                    const block = type === "video"
                        ? VideoBlock.createDefault(src, {
                            config: toolConfig?.config ?? {},
                            api: {
                                editor: this.editor,
                                removeBlock: (block) => this.editor.removeBlock(block)
                            }
                        })
                        : ImageBlock.createDefault(src, {
                            config: toolConfig?.config ?? {},
                            api: {
                                editor: this.editor,
                                removeBlock: (block) => this.editor.removeBlock(block)
                            }
                        });
                    this.editor.insertBlock(block);
                }
            } catch (err) {
                console.error(`ExternalToolPlugin: ${type} upload failed:`, err);
            }
        };

        input.click();
    }
}
