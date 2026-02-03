import Plugin from "../../core/Plugin";
import VideoBlock from "../../blocks/media/VideoBlock";
import { registerBlock } from "../../blocks/BlockFactory";
import Editor from "../../core/Editor";
import {ToolConfig, VideoToolConfig} from "../../types";

/**
 * 비디오 블록 기능을 에디터에 추가하는 플러그인입니다.
 * VideoBlock을 BlockFactory에 등록하고, 비디오 관련 toolSettings를 제공합니다.
 */
export default class VideoBlockPlugin extends Plugin {

    constructor(editor: Editor) {
        super(editor);
    }

    /**
     * 플러그인을 초기화하고 VideoBlock을 BlockFactory에 등록합니다.
     */
    initialize() {
        registerBlock("video", VideoBlock);
    }

    /**
     * 이 플러그인이 제공하는 toolSettings를 반환합니다.
     * 이 설정은 Editor의 toolSettings와 병합됩니다.
     */
    static override getToolSettings(): Record<string, ToolConfig<VideoToolConfig>> {
        return {
            video: {
                maxCount: 3, // 비디오 블록의 최대 개수
                /**
                 * 최대 개수에 도달했을 때 호출되는 콜백 함수입니다.
                 */
                onMaxCountReached: (maxCount) => {
                    // Editor의 EventBus를 통해 알림을 발생시키는 것이 더 좋습니다.
                    // 예: this.editor.eventBus.emit('notification', { message: `${type} 블록은 최대 ${maxCount}개까지 등록할 수 있습니다.` });
                    alert(`비디오 블록은 최대 ${maxCount}개까지 등록할 수 있습니다.`);
                },
                toolbar: false, // 비디오 툴바 활성화 여부
                config: { // VideoBlock 생성자에 전달될 추가 설정
                    showDeleteButton: true, // 삭제 버튼 활성화 여부
                    uploader: {
                        fileSelectButton: "video-tool-button", // 비디오를 추가하는 외부 버튼의 DOM ID
                        /**
                         * 파일을 업로드하고 비디오 URL을 반환하는 비동기 함수입니다.
                         * @param {File} file - 업로드할 비디오 파일.
                         * @returns {Promise<{url: string}>} 비디오 URL을 포함하는 객체.
                         */
                        uploadByFile: async (file) => {
                            // 실제 비디오 업로드 로직을 여기에 구현합니다.
                            // 예: 서버에 파일을 업로드하고 응답으로 URL을 받습니다.
                            // 여기서는 임시 URL을 반환합니다. 실제 환경에서는 서버 API 호출로 대체됩니다.
                            return { url: URL.createObjectURL(file) };
                        }
                    },
                }
            }
        };
    }
}
