import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
import { ImageToolConfig, VideoToolConfig } from "../../types";
/**
 * 외부 UI 요소(버튼 등)와 에디터의 블록 삽입/업로드 기능을 연결하는 플러그인입니다.
 * `toolSettings`에 정의된 `fileSelectButton`를 기반으로 클릭 이벤트를 바인딩합니다.
 */
export default class ExternalToolPlugin extends Plugin {
    constructor(editor: Editor);
    initialize(): void;
    isImageOrVideoToolConfig(type: string, config: any): config is ImageToolConfig | VideoToolConfig;
    /**
     * `toolSettings`에 정의된 외부 도구 버튼에 클릭 이벤트 리스너를 바인딩합니다.
     */
    private _bindExternalTools;
    /**
     * 외부 도구 버튼 클릭 이벤트를 처리합니다.
     * 블록 최대 개수 제한을 확인하고, 커스텀 선택 로직 또는 파일 업로드 로직을 실행합니다.
     */
    private _handleToolButtonClick;
    /**
     * 파일 선택 후 미디어 블록 추가
     */
    private _handleFileUpload;
}
