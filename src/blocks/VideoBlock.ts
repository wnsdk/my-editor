import BaseBlock from "./BaseBlock";
import { createDeleteButton } from "../utils/dom.js";
import {BlockInit, VideoBlockData, VideoToolConfig} from "../types";

/**
 * 에디터의 비디오 블록을 나타내는 클래스입니다.
 * BaseBlock을 상속받아 비디오 표시 및 관련 기능을 제공합니다.
 */
export default class VideoBlock extends BaseBlock {
    data: VideoBlockData;
    config: Partial<VideoToolConfig>;
    api: BlockInit["api"];

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
            posterUrl: typeof data === "string" ? undefined : data.posterUrl
        };

        // 1. 래퍼(wrapper) div 생성
        this.el = document.createElement("div");
        this.el.className = "block video-block-wrapper";
        this.el.contentEditable = "false"; // 이 래퍼는 편집 불가능
        this.el.draggable = true; // 드래그는 이 래퍼에서 처리

        // 2. 내부 컨텐츠 div 생성
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "video-block";
        this.el.appendChild(contentWrapper);

        this._renderContent(contentWrapper); // 내부 컨텐츠 렌더링
    }

    /**
     * 블록의 내부 컨텐츠를 렌더링합니다.
     */
    private _renderContent(container: HTMLElement) {
        container.innerHTML = ""; // 기존 컨텐츠 초기화

        if (this.data.src) {
            this._renderVideoElement(container);
        } else {
            container.innerHTML = `<div class="video-placeholder">No Video Selected</div>`;
        }
    }

    /**
     * 비디오 요소를 생성하고 컨테이너에 추가합니다.
     */
    private _renderVideoElement(container: HTMLElement) {
        const video = document.createElement("video");
        video.controls = true;

        if (this.data.posterUrl) {
            video.poster = this.data.posterUrl;
        }

        const source = document.createElement("source");
        source.src = this.data.src;
        video.appendChild(source);

        video.insertAdjacentText('beforeend', 'Your browser does not support the video tag.'); // 대체 텍스트

        container.appendChild(video);
        this._appendDeleteButton(container);
    }

    /**
     * 블록 삭제 버튼을 생성하고 컨테이너에 추가합니다.
     */
    private _appendDeleteButton(container: HTMLElement) {
        if (!this.config.showDeleteButton) return;

        const btn = createDeleteButton();
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); // 이벤트 버블링 방지
            e.preventDefault(); // 기본 동작 방지

            if (this.api && this.api.removeBlock) {
                this.api.removeBlock(this);
            }
        });
        container.appendChild(btn);
    }

    /**
     * 비디오 블록의 데이터를 JSON 형식으로 직렬화합니다.
     */
    toJSON(): VideoBlockData {
        return {
            id: this.id,
            type: "video",
            src: this.data.src,
            posterUrl: this.data.posterUrl,
            depth: this.depth
        };
    }
}
