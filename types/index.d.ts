/**
 * Mnote 에디터 라이브러리의 메인 진입점 파일입니다.
 * Editor 클래스와 BlockFactory의 주요 함수들을 내보냅니다.
 */
import Editor from "./core/Editor.js";
import * as BlockFactory from "./blocks/BlockFactory.js";
import BaseBlock from "./blocks/BaseBlock.js";
import MediaBlock from "./blocks/media/MediaBlock.js";
import TextEditableBlock from "./blocks/editable/TextEditableBlock.js";
import TextBlock from "./blocks/editable/TextBlock.js";
import ImageBlock from "./blocks/media/ImageBlock.js";
import VideoBlock from "./blocks/media/VideoBlock.js";
import ListBlock from "./blocks/editable/ListBlock.js";
import TableBlock from "./blocks/TableBlock.js";
import "./styles/editor.css";
import "./styles/toolbar.css";
import "./styles/blocks.css";
/**
 * Editor 클래스와 BlockFactory의 주요 함수들을 포함하는 객체입니다.
 * @namespace
 * @property {Editor} Editor - 에디터의 핵심 클래스.
 * @property {object} Blocks - 블록 생성 및 관리를 위한 팩토리 함수들을 포함하는 객체.
 * @property {function(string, object, object): BaseBlock} Blocks.createBlock - 새 블록 인스턴스를 생성하는 함수.
 * @property {function(object, object): BaseBlock} Blocks.createBlockFromJSON - JSON 데이터로부터 블록 인스턴스를 생성하는 함수.
 */
export { Editor, BlockFactory as Blocks, BaseBlock, MediaBlock, TextEditableBlock, TextBlock, ImageBlock, VideoBlock, ListBlock, TableBlock };
/**
 * 기본 내보내기로 Editor 클래스를 제공합니다.
 * @default Editor
 */
export default Editor;
