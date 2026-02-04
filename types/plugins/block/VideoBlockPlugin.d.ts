import Plugin from "../../core/Plugin";
import Editor from "../../core/Editor";
import { ToolConfig, VideoToolConfig } from "../../types";
/**
 * 비디오 블록 기능을 에디터에 추가하는 플러그인입니다.
 * VideoBlock을 BlockFactory에 등록하고, 비디오 관련 toolSettings를 제공합니다.
 */
export default class VideoBlockPlugin extends Plugin {
    constructor(editor: Editor);
    /**
     * 플러그인을 초기화하고 VideoBlock을 BlockFactory에 등록합니다.
     */
    initialize(): void;
    /**
     * 이 플러그인이 제공하는 toolSettings를 반환합니다.
     * 이 설정은 Editor의 toolSettings와 병합됩니다.
     */
    static getToolSettings(): Record<string, ToolConfig<VideoToolConfig>>;
}
