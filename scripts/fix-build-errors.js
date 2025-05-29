#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 빌드 오류가 발생하는 파일 경로
const boardsPagePath = path.join(process.cwd(), 'app/admin/boards/page.tsx');

// 파일이 존재하는지 확인
if (!fs.existsSync(boardsPagePath)) {
  console.error(`파일을 찾을 수 없습니다: ${boardsPagePath}`);
  process.exit(1);
}

// 파일 내용 읽기
let content = fs.readFileSync(boardsPagePath, 'utf8');

// 문제 1: 비동기 함수가 아닌 곳에서 await 사용 문제 해결
// 함수를 async로 변환하거나 Promise 체인으로 변경
content = content.replace(
  /await updateDoc\(boardRef, boardData\);/g,
  `updateDoc(boardRef, boardData).then(() => {
    setIsEditModalOpen(false);
    fetchBoards();
    alert('게시판이 성공적으로 수정되었습니다.');
  }).catch((error) => {
    console.error('게시판 수정 실패:', error);
    alert('게시판 수정에 실패했습니다. 다시 시도해주세요.');
  }).finally(() => {
    setIsLoading(false);
  });
  return;`
);

// 문제 2: JSX 구문 오류 해결
// 중복된 return 문 제거 및 JSX 구조 수정
const jsxFixRegex = /const isDarkMode = currentTheme\?\.name\?\.toLowerCase\(\)\.includes\('다크'\) \|\| \s*currentTheme\?\.name\?\.toLowerCase\(\)\.includes\('dark'\);\s*\n\s*return \(/;
content = content.replace(jsxFixRegex, `const isDarkMode = currentTheme?.name?.toLowerCase().includes('다크') || 
                  currentTheme?.name?.toLowerCase().includes('dark');

  // 최종 렌더링
  return (`);

// 수정된 내용을 파일에 쓰기
fs.writeFileSync(boardsPagePath, content, 'utf8');

console.log('빌드 오류 수정 완료: app/admin/boards/page.tsx');
