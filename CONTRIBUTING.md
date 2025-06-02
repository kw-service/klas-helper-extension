# Contributing to [KLAS Helper](https://github.com/kw-service/klas-helper)

KLAS Helper 프로젝트에 관심을 가져 주셔서 감사합니다. 이 프로젝트는 오픈 소스 프로젝트로 누구나 자유롭게 기여할 수 있습니다. 맞춤법, 번역, 문서화 등 코드와 상관없는 기여도 언제든 환영입니다! ❤

## 개발자 가이드

코드를 기여하고 싶으신가요? 아래 내용을 확인해 주세요.

### 사전 준비

* [Node.js](https://nodejs.org/)가 설치되어 있어야 합니다.
* 에디터로 [Visual Studio Code](https://code.visualstudio.com/) 사용을 권장합니다.

### 시작

1. 이 저장소를 포크(fork)한 뒤에 클론(clone)해 주세요.
2. 프로젝트 경로로 이동한 다음 npm 패키지를 설치합니다.

```shell
npm install
```

3. 아래 명령어를 실행해 개발 환경을 구성합니다. 아래 명령어는, 소스코드 수정시 자동으로 수정사항이 반영되며 새롭게 빌드가 필요하지 않습니다.

```shell
npm run dev
```

4. 잠시 기다리시면 프로젝트 최상위 폴더에 `dist` 폴더가 생성됩니다.
5. 크롬 브라우저를 열고, [확장 프로그램 설정 페이지](chrome://extensions/)에 들어가, `압축해제된 확장 프로그램을 로드합니다.`를 클릭하세요.
6. dist 경로를 선택하시면, 개발중인 KLAS Helper Extension이 로드됩니다.
7. 이제 마음껏 개발하시면 됩니다!

## 라이선스

이 프로젝트는 [MIT 라이선스](https://github.com/kw-service/klas-helper-extension/blob/master/LICENSE)를 따릅니다. 코드를 제공할 경우 MIT 라이선스에 따라 라이선스가 부여되며 이에 동의한 것으로 간주됩니다.
