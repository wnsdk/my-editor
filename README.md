# Block Editor

contenteditable 기반의 블록 에디터 라이브러리입니다.

## 설치

```bash
npm install
npm run build
```

## 사용법

### 기본 사용

```javascript
import Editor from 'editor';

const editor = new Editor({
    holder: 'editor',           // 에디터를 렌더링할 요소의 ID 또는 HTMLElement
    toolbar: true,              // 툴바 표시 여부
    placeholder: '내용을 입력하세요...'
});

await editor.isReady;
```

### 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `holder` | `string \| HTMLElement` | 필수 | 에디터를 렌더링할 요소 |
| `toolbar` | `boolean` | `false` | 툴바 표시 여부 |
| `placeholder` | `string` | `''` | 빈 에디터에 표시할 플레이스홀더 |
| `readOnly` | `boolean` | `false` | 읽기 전용 모드 |
| `onChange` | `function` | - | 내용 변경 시 호출되는 콜백 |
| `tools` | `object` | - | 블록 도구 설정 |
| `plugins` | `array` | - | 추가 플러그인 목록 |

### 데이터 저장

```javascript
const data = editor.save();
console.log(data.blocks);
```

### 데이터 불러오기

```javascript
await editor.render({
    blocks: [
        {
            type: 'text',
            data: { text: '첫 번째 문단입니다.' }
        },
        {
            type: 'text',
            data: { text: '두 번째 문단입니다.' }
        }
    ]
});
```

### 변경 감지

```javascript
const editor = new Editor({
    holder: 'editor',
    onChange: (blocks) => {
        console.log('변경됨:', blocks);
    }
});
```

## 블록 타입

### Text
텍스트 콘텐츠를 위한 기본 블록입니다.

```javascript
{
    type: 'text',
    data: { text: '텍스트 내용' }
}
```

### Image
이미지를 표시하는 블록입니다.

```javascript
{
    type: 'image',
    data: {
        url: 'https://example.com/image.jpg',
        caption: '이미지 설명'
    }
}
```

### Video
비디오를 임베드하는 블록입니다.

```javascript
{
    type: 'video',
    data: {
        url: 'https://example.com/video.mp4'
    }
}
```

### List
순서 있는/없는 목록 블록입니다.

```javascript
{
    type: 'list',
    data: {
        style: 'unordered',  // 'ordered' 또는 'unordered'
        items: ['항목 1', '항목 2', '항목 3']
    }
}
```

## 데모

로컬에서 데모를 실행하려면:

```bash
npm run build
npm run serve
```

브라우저에서 `http://localhost:3000/demo` 접속

## 개발

```bash
# 감시 모드로 빌드 (파일 변경 시 자동 재빌드)
npm run dev

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
editor/
├── src/
│   ├── index.ts          # 메인 엔트리
│   ├── blocks/           # 블록 타입 구현
│   ├── core/             # 에디터 코어
│   ├── plugins/          # 플러그인
│   ├── types/            # TypeScript 타입
│   ├── styles/           # CSS 스타일
│   ├── ui/               # UI 컴포넌트
│   └── utils/            # 유틸리티
├── demo/                 # 데모 페이지
└── dist/                 # 빌드 결과물
```

## 라이선스

MIT
