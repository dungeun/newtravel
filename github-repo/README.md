# GitHub 저장소 생성 및 연결 방법

## 1. GitHub 웹사이트에서 새 저장소 생성하기
1. GitHub 계정으로 로그인합니다 (https://github.com/)
2. 오른쪽 상단의 "+" 버튼을 클릭하고 "New repository"를 선택합니다
3. 저장소 이름(Repository name)을 입력합니다
4. 공개(Public) 또는 비공개(Private) 옵션을 선택합니다
5. "Create repository" 버튼을 클릭합니다

## 2. 로컬 저장소와 GitHub 연결하기
```bash
# 이미 로컬에서 git init한 경우
git remote add origin https://github.com/사용자이름/저장소이름.git

# 원격 저장소에 푸시하기
git push -u origin main
```

## 3. 원격 저장소 확인하기
```bash
git remote -v
```
