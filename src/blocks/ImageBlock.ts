import BaseBlock from "./BaseBlock";
import { createDeleteButton } from "../utils/dom.js";
import {BlockInit, ImageBlockData, ImageToolConfig} from "../types";

/**
 * 에디터의 이미지 블록을 나타내는 클래스입니다.
 * BaseBlock을 상속받아 이미지 표시 및 관련 기능을 제공합니다.
 */
export default class ImageBlock extends BaseBlock {
    data: ImageBlockData;
    config: Partial<ImageToolConfig>;
    api: BlockInit["api"];

    /**
     * 기본 이미지 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static createDefault(src: string, init: BlockInit<ImageToolConfig>): ImageBlock {
        const data: ImageBlockData = {
            type: "image",
            src,
            alt: "",
            width: null,
            height: null,
            align: "center",
        };
        return new ImageBlock(data, init);
    }

    /**
     * 데이터를 기반으로 이미지 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static create(data: ImageBlockData, init: BlockInit<ImageToolConfig>): ImageBlock {
        return new ImageBlock(data, init);
    }

    constructor(
        data: ImageBlockData,
        init: BlockInit<ImageToolConfig>
    ) {
        super("image", data.depth || 0);

        this.config = init.config;
        this.api = init.api;

        // 데이터 초기화: src 필수, 나머지는 디폴트값
        this.data = {
            type: 'image',
            src: data.src ?? "",
            alt: data.alt ?? "",
            width: data.width ?? null,
            height: data.height ?? null,
            align: data.align ?? "center"
        };

        // 1. 래퍼(wrapper) div 생성
        this.el = document.createElement("div");
        this.el.className = "block image-block-wrapper";
        this.el.contentEditable = "false"; // 이 래퍼는 편집 불가능
        this.el.draggable = true; // 드래그는 이 래퍼에서 처리

        // 2. 내부 컨텐츠 div 생성
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "image-block";
        contentWrapper.classList.add(`align-${this.data.align}`);
        this.el.appendChild(contentWrapper);

        this._renderContent(contentWrapper); // 내부 컨텐츠 렌더링
    }

    /**
     * 블록의 내부 컨텐츠를 렌더링합니다.
     */
    private _renderContent(container: HTMLElement) {
        container.innerHTML = ""; // 기존 컨텐츠 초기화

        // 이미지가 있는 경우
        if (this.data.src) {
            this._renderImageElement(container);
        }
        // 이미지가 없는 경우 (플레이스홀더 표시)
        else {
            container.innerHTML = `<div class="image-placeholder">No Image Selected</div>`;
        }
    }

    /**
     * 이미지 요소를 생성하고 컨테이너에 추가합니다.
     */
    private _renderImageElement(container: HTMLElement) {
        // 기본 뷰: img 태그 생성
        const img = document.createElement("img");
        img.src = this.data.src;
        if (this.data.alt != null) {
            img.alt = this.data.alt;
        }

        // width, height 적용
        if (this.data.width !== null && this.data.width !== undefined) {
            img.style.width = typeof this.data.width === "number"
                ? `${this.data.width}px`
                : this.data.width;
        }
        if (this.data.height !== null && this.data.height !== undefined) {
            img.style.height = typeof this.data.height === "number"
                ? `${this.data.height}px`
                : this.data.height;
        }

        container.appendChild(img);

        this._appendDeleteButton(container);
    }

    /**
     * 블록 삭제 버튼을 생성하고 컨테이너에 추가합니다.
     */
    private _appendDeleteButton(container: HTMLElement) {
        if (!this.config.showDeleteButton) return;

        const btn = createDeleteButton();
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.api.removeBlock(this);
        });

        container.appendChild(btn);
    }

    /**
     * 이미지 블록의 데이터를 JSON 형식으로 직렬화합니다.
     */
    toJSON(): ImageBlockData {
        return {
            id: this.id,
            ...this.data,
            depth: this.depth
        };
    }
}
