import MediaBlock from "./MediaBlock";
import { BlockInit, ImageBlockData, ImageToolConfig } from "../../types";
/**
 * 에디터의 이미지 블록을 나타내는 클래스입니다.
 * MediaBlock을 상속받아 이미지 표시 및 관련 기능을 제공합니다.
 */
export default class ImageBlock extends MediaBlock {
    data: ImageBlockData;
    /**
     * 기본 이미지 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static createDefault(src: string, init: BlockInit<ImageToolConfig>): ImageBlock;
    /**
     * 데이터를 기반으로 이미지 블록을 생성하는 정적 팩토리 메서드입니다.
     */
    static create(data: ImageBlockData, init: BlockInit<ImageToolConfig>): ImageBlock;
    constructor(data: ImageBlockData, init: BlockInit<ImageToolConfig>);
    /**
     * MediaBlock의 추상 메서드 구현: 미디어 소스 반환
     */
    protected getMediaSrc(): string;
    /**
     * MediaBlock의 추상 메서드 구현: 이미지 콘텐츠 렌더링
     */
    protected renderContent(container: HTMLElement): void;
    /**
     * 이미지 요소를 생성하고 컨테이너에 추가합니다.
     */
    private _renderImageElement;
    /**
     * 이미지 블록의 데이터를 JSON 형식으로 직렬화합니다.
     */
    toJSON(): ImageBlockData;
}
