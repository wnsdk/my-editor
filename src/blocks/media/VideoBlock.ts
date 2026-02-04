import MediaBlock from "./MediaBlock";
import {BlockInit, VideoBlockData, VideoToolConfig} from "../../types";

/**
 * 에디터의 비디오 블록을 나타내는 클래스입니다.
 * MediaBlock을 상속받아 비디오 표시 및 관련 기능을 제공합니다.
 */
export default class VideoBlock extends MediaBlock {
    data: VideoBlockData;

    /**
     * 기본 비디오 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static createDefault(src: string, init: BlockInit<VideoToolConfig>): VideoBlock {
        const data: VideoBlockData = {
            type: "video",
            src,
            width: null,
            height: null,
            align: "center",
        };
        return new VideoBlock(data, init);
    }

    /**
     * 데이터를 기반으로 비디오 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static create(data: string | VideoBlockData, init: BlockInit<VideoToolConfig>): VideoBlock {
        return new VideoBlock(data, init);
    }

    constructor(
        data: string | VideoBlockData = "",
        init: BlockInit<VideoToolConfig>
    ) {
        const depth = (typeof data === "object" && data.depth) ? data.depth : 0;
        super("video", depth);

        this.config = init.config;
        this.api = init.api;

        this.data = {
            type: 'video',
            src: typeof data === "string" ? data : data.src ?? "",
            posterUrl: typeof data === "string" ? undefined : data.posterUrl,
            width: typeof data === "string" ? null : data.width ?? null,
            height: typeof data === "string" ? null : data.height ?? null,
            align: typeof data === "string" ? "center" : data.align ?? "center"
        };

        // MediaBlock의 createWrapper 사용
        const { content } = this.createWrapper(this.data.align);
        this.renderContent(content);
    }

    /**
     * MediaBlock의 추상 메서드 구현: 미디어 소스 반환
     */
    protected getMediaSrc(): string {
        return this.data.src;
    }

    /**
     * MediaBlock의 추상 메서드 구현: 비디오 콘텐츠 렌더링
     */
    protected renderContent(container: HTMLElement): void {
        container.innerHTML = ""; // 기존 컨텐츠 초기화

        if (this.data.src) {
            this._renderVideoElement(container);
        } else {
            const placeholder = this.createPlaceholder("No Video Selected");
            container.appendChild(placeholder);
        }
    }

    /**
     * 비디오 요소를 생성하고 컨테이너에 추가합니다.
     */
    private _renderVideoElement(container: HTMLElement): void {
        const video = document.createElement("video");
        video.controls = true;

        if (this.data.posterUrl) {
            video.poster = this.data.posterUrl;
        }

        // width, height 적용
        if (this.data.width !== null && this.data.width !== undefined) {
            video.style.width = typeof this.data.width === "number"
                ? `${this.data.width}px`
                : this.data.width;
        }
        if (this.data.height !== null && this.data.height !== undefined) {
            video.style.height = typeof this.data.height === "number"
                ? `${this.data.height}px`
                : this.data.height;
        }

        const source = document.createElement("source");
        source.src = this.data.src;
        video.appendChild(source);

        video.insertAdjacentText('beforeend', 'Your browser does not support the video tag.'); // 대체 텍스트

        container.appendChild(video);
        this.appendDeleteButton(container); // MediaBlock의 메서드 사용
    }

    /**
     * 비디오 블록의 데이터를 JSON 형식으로 직렬화합니다.
     */
    toJSON(): VideoBlockData {
        return {
            id: this.id,
            ...this.data,
            depth: this.depth
        };
    }
}
