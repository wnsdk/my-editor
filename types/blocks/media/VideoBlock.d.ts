import MediaBlock from "./MediaBlock";
import { BlockInit, VideoBlockData, VideoToolConfig } from "../../types";
/**
 * 에디터의 비디오 블록을 나타내는 클래스입니다.
 * MediaBlock을 상속받아 비디오 표시 및 관련 기능을 제공합니다.
 */
export default class VideoBlock extends MediaBlock {
    data: VideoBlockData;
    /**
     * 기본 비디오 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static createDefault(src: string, init: BlockInit<VideoToolConfig>): VideoBlock;
    /**
     * 데이터를 기반으로 비디오 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static create(data: string | VideoBlockData, init: BlockInit<VideoToolConfig>): VideoBlock;
    constructor(data: (string | VideoBlockData) | undefined, init: BlockInit<VideoToolConfig>);
    /**
     * MediaBlock의 추상 메서드 구현: 미디어 소스 반환
     */
    protected getMediaSrc(): string;
    /**
     * MediaBlock의 추상 메서드 구현: 비디오 콘텐츠 렌더링
     */
    protected renderContent(container: HTMLElement): void;
    /**
     * 비디오 요소를 생성하고 컨테이너에 추가합니다.
     */
    private _renderVideoElement;
    /**
     * 비디오 블록의 데이터를 JSON 형식으로 직렬화합니다.
     */
    toJSON(): VideoBlockData;
}
