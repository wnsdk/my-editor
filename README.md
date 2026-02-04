# Block Editor

contenteditable 기반의 블록 에디터 라이브러리입니다.

## 설치

### NPM 패키지로 설치 (개발 중)

```bash
npm install
npm run build
```

### CDN 사용

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/wnsdk/my-editor@v1.0.0/editor.esm.css">
</head>
<body>
    <div id="editor"></div>

    <script type="module">
        import Editor from 'https://cdn.jsdelivr.net/gh/wnsdk/my-editor@v1.0.0/editor.esm.js';

        const editor = new Editor({
            holder: 'editor',
            toolbar: true,
            placeholder: '내용을 입력하세요...'
        });
    </script>
</body>
</html>
```

> **버전 지정**: URL에서 `@v1.0.0` 부분을 원하는 버전으로 변경하여 사용할 수 있습니다.
> 예: `@v1.0.1`, `@v1.1.0` 등

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

## 릴리즈 프로세스

새 버전을 릴리즈하려면 다음 단계를 따르세요:

### 1. main 브랜치에서 개발 및 커밋

```bash
# 기능 개발 및 테스트
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
```

### 2. 빌드 및 release 브랜치 생성

```bash
# 프로덕션 빌드
npm run build

# release 브랜치로 전환 (없으면 생성)
git checkout -b release

# 빌드 결과물만 유지 (dist 폴더)
# .gitignore에서 dist를 제거하거나 force add
git add -f dist/
git commit -m "build: v1.0.1 빌드 결과물"

# release 브랜치 푸시
git push origin release
```

### 3. 태그 생성 및 릴리즈

```bash
# 버전 태그 생성
git tag v1.0.1

# 태그 푸시
git push origin v1.0.1
```

### 4. GitHub Release 생성

1. GitHub 저장소로 이동
2. **Releases** 탭 클릭
3. **Create a new release** 클릭
4. 태그 선택: `v1.0.1`
5. 릴리즈 노트 작성
6. **Publish release** 클릭

### 5. CDN 링크 업데이트

릴리즈 후 다음 CDN 링크로 사용 가능합니다:

```
https://cdn.jsdelivr.net/gh/wnsdk/my-editor@v1.0.1/editor.esm.css
https://cdn.jsdelivr.net/gh/wnsdk/my-editor@v1.0.1/editor.esm.js
```

### 6. main 브랜치로 돌아가기

```bash
# 개발을 위해 main 브랜치로 복귀
git checkout main
```

### 버전 관리 규칙

- **Major (v2.0.0)**: Breaking changes, 하위 호환성 없음
- **Minor (v1.1.0)**: 새로운 기능 추가, 하위 호환성 유지
- **Patch (v1.0.1)**: 버그 수정, 하위 호환성 유지

## 라이선스

MIT
