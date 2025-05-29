#!/usr/bin/env node

/**
 * 이 스크립트는 Task Master의 영어 메시지를 한글로 변경합니다.
 */

const fs = require('fs');
const path = require('path');

// 전역 패키지 경로
const GLOBAL_PACKAGE_PATH = '/opt/homebrew/lib/node_modules/task-master-ai';

// 메시지 변경할 파일 목록
const FILES_TO_MODIFY = [
  // MCP 서버 파일
  'mcp-server/src/tools/next-task.js',
  'mcp-server/src/core/direct-functions/next-task.js',
  'mcp-server/src/tools/update-subtask.js',
  'mcp-server/src/tools/set-task-status.js',
  'mcp-server/src/tools/generate.js',

  // 스크립트 파일
  'scripts/init.js',
  'scripts/modules/task-manager/expand-task.js',
  'scripts/modules/task-manager/add-task.js',
  'scripts/modules/task-manager/parse-prd.js',
];

// 영어 -> 한글 메시지 매핑
const MESSAGE_TRANSLATIONS = {
  // 특정 문장 메시지 (더 긴 문장부터 처리하여 부분 일치 문제 방지)
  'Successfully found next task': '다음 작업을 성공적으로 찾았습니다',
  'Successfully updated task': '작업이 성공적으로 업데이트되었습니다',
  'Successfully updated subtask': '하위 작업이 성공적으로 업데이트되었습니다',
  'Successfully generated task files': '작업 파일이 성공적으로 생성되었습니다',
  'Successfully parsed PRD': 'PRD가 성공적으로 분석되었습니다',
  'Task complexity analysis complete': '작업 복잡도 분석이 완료되었습니다',
  'Analyzing task complexity': '작업 복잡도 분석 중',
  'Expanding task': '작업 확장 중',
  'No available tasks': '이용 가능한 작업이 없습니다',
  'Getting Started': '시작하기',
  'Suggested Next Steps': '제안된 다음 단계',
  'Set up the basic Taskmaster file structure': '기본 Taskmaster 파일 구조 설정',
  'Project initialized successfully': '프로젝트가 성공적으로 초기화되었습니다',
};

// 변환 시 제외할 문자열 패턴 (파일 이름, 함수 이름 등)
const EXCLUDED_PATTERNS = [
  'generate-task-files',
  'task-master',
  'task.js',
  'task.mjs',
  'tasks.json',
  'expand-task',
  'add-task',
  'update-task',
  'show-task',
  'next-task',
  'remove-task',
  'task-by-id',
  'add-subtask',
  'clear-subtasks',
  'task-manager',
  'update-subtask',
  'subtask-by-id',
  'task/subtask',
  'project-structure',
  'task_id',
  'task_status',
  'task_title',
  'nextTask',
  'setTask',
  'updateTask',
  'TaskMaster',
];

// 파일 내용 변경 함수
function modifyFile(filePath) {
  const fullPath = path.join(GLOBAL_PACKAGE_PATH, filePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`파일을 찾을 수 없습니다: ${fullPath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    // 제외할 패턴을 임시 마커로 대체
    let excludedMatches = [];
    EXCLUDED_PATTERNS.forEach((pattern, index) => {
      const marker = `__EXCLUDED_PATTERN_${index}__`;
      const regex = new RegExp(pattern, 'g');

      content = content.replace(regex, match => {
        excludedMatches.push({ marker, original: match });
        return marker;
      });
    });

    // 모든 변환 규칙 적용
    for (const [english, korean] of Object.entries(MESSAGE_TRANSLATIONS)) {
      const regex = new RegExp(`\\b${english}\\b`, 'g'); // 단어 경계 추가
      if (regex.test(content)) {
        content = content.replace(regex, korean);
        changed = true;
      }
    }

    // 제외된 패턴 복원
    excludedMatches.forEach(({ marker, original }) => {
      content = content.replace(new RegExp(marker, 'g'), original);
    });

    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`수정됨: ${filePath}`);
      return true;
    } else {
      console.log(`변경 사항 없음: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`파일 수정 오류 (${filePath}): ${error.message}`);
    return false;
  }
}

// 이전에 수정한 파일 복원
function restoreOriginalFiles() {
  console.log('이전에 수정한 파일을 원래대로 복원합니다...');

  // 원본 파일 백업이 있으면 복원
  for (const filePath of FILES_TO_MODIFY) {
    try {
      const fullPath = path.join(GLOBAL_PACKAGE_PATH, filePath);
      const backupPath = `${fullPath}.bak`;

      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, fullPath);
        console.log(`복원됨: ${filePath}`);
      }
    } catch (error) {
      console.error(`파일 복원 오류 (${filePath}): ${error.message}`);
    }
  }
}

// 파일 백업
function backupFile(filePath) {
  const fullPath = path.join(GLOBAL_PACKAGE_PATH, filePath);
  const backupPath = `${fullPath}.bak`;

  try {
    // 이미 백업이 있는지 확인
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(fullPath, backupPath);
    }
    return true;
  } catch (error) {
    console.error(`파일 백업 오류 (${filePath}): ${error.message}`);
    return false;
  }
}

// 메인 함수
function main() {
  // 먼저 이전에 수정한 파일을 원래대로 복원
  restoreOriginalFiles();

  console.log('Task Master 메시지를 한글로 변경합니다...');

  let successCount = 0;
  let errorCount = 0;

  // 모든 파일 백업
  for (const filePath of FILES_TO_MODIFY) {
    backupFile(filePath);
  }

  // 파일 수정
  for (const filePath of FILES_TO_MODIFY) {
    const success = modifyFile(filePath);
    success ? successCount++ : errorCount++;
  }

  console.log('\n변경 요약:');
  console.log(`총 파일: ${FILES_TO_MODIFY.length}`);
  console.log(`성공: ${successCount}`);
  console.log(`실패: ${errorCount}`);

  if (successCount > 0) {
    console.log('\n성공적으로 메시지가 한글로 변경되었습니다!');
    console.log('이제 task-master를 사용할 때 한글 메시지가 표시됩니다.');
  }
}

// 스크립트 실행
main();
