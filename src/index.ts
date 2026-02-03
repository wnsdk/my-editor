/**
 * Mnote 에디터 라이브러리의 메인 진입점 파일입니다.
 * Editor 클래스와 BlockFactory의 주요 함수들을 내보냅니다.
 */

import Editor from "./core/Editor.js";
// 블록 파일들은 이제 각 블록 플러그인을 통해 BlockFactory에 등록되므로 직접 임포트할 필요가 없습니다.
// import "./blocks/TextBlock.ts";
// import "./blocks/ImageBlock.ts";
// import "./blocks/VideoBlock.ts";
import * as BlockFactory from "./blocks/BlockFactory.js"; // BlockFactory를 명확한 이름으로 임포트
import TextBlock from "./blocks/TextBlock.js";
import ImageBlock from "./blocks/ImageBlock.js";
import VideoBlock from "./blocks/VideoBlock.js";

// 에디터에 필요한 스타일시트 임포트
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
export { Editor, BlockFactory as Blocks, TextBlock, ImageBlock, VideoBlock };

/**
 * 기본 내보내기로 Editor 클래스를 제공합니다.
 * @default Editor
 */
export default Editor;
