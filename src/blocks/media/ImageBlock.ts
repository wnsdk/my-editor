import MediaBlock from "./MediaBlock";
import {BlockInit, ImageBlockData, ImageToolConfig} from "../../types";

/**
 * 에디터의 이미지 블록을 나타내는 클래스입니다.
 * MediaBlock을 상속받아 이미지 표시 및 관련 기능을 제공합니다.
 */
export default class ImageBlock extends MediaBlock {
    data: ImageBlockData;

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
            fillWidth: false,
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
            align: data.align ?? "center",
            fillWidth: data.fillWidth ?? false
        };

        // MediaBlock의 createWrapper 사용
        const { wrapper, content } = this.createWrapper(this.data.align);
        this.renderContent(content);

        // fillWidth 상태 복원
        if (this.data.fillWidth) {
            content.classList.add("fill-width");
            wrapper.style.textAlign = "";

            // img 요소에도 클래스 추가
            const img = content.querySelector('img');
            if (img) {
                img.classList.add("fill-width");
                img.style.display = "block";
                img.style.margin = "0";
            }
        }
    }

    /**
     * MediaBlock의 추상 메서드 구현: 미디어 소스 반환
     */
    protected getMediaSrc(): string {
        return this.data.src;
    }

    /**
     * MediaBlock의 추상 메서드 구현: 이미지 콘텐츠 렌더링
     */
    protected renderContent(container: HTMLElement): void {
        container.innerHTML = ""; // 기존 컨텐츠 초기화

        // 이미지가 있는 경우
        if (this.data.src) {
            this._renderImageElement(container);
        }
        // 이미지가 없는 경우 (플레이스홀더 표시)
        else {
            const placeholder = this.createPlaceholder("No Image Selected");
            container.appendChild(placeholder);
        }
    }

    /**
     * 이미지 요소를 생성하고 컨테이너에 추가합니다.
     */
    private _renderImageElement(container: HTMLElement): void {
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
        this.appendDeleteButton(container); // MediaBlock의 메서드 사용
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
