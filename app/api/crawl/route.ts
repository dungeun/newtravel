import { NextResponse } from 'next/server';
import axios from 'axios';

interface SearchResult {
  title: string;
  content: string;
  author: string;
  source: 'naver' | 'tistory';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const source = searchParams.get('source');

  console.log('크롤링 API 호출:', { keyword, source });

  if (!keyword || !source) {
    console.error('필수 파라미터 누락:', { keyword, source });
    return NextResponse.json({ error: '키워드와 소스를 입력해주세요.' }, { status: 400 });
  }

  try {
    let results: SearchResult[] = [];

    if (source === 'naver') {
      console.log('네이버 블로그 크롤링 시작');
      const response = await axios.get(
        `https://search.naver.com/search.naver?where=blog&sm=tab_jum&query=${encodeURIComponent(keyword)}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        }
      );

      console.log('네이버 블로그 응답 수신');
      const html = response.data;

      // 디버깅을 위한 HTML 구조 출력
      console.log('네이버 블로그 HTML 구조:', html.substring(0, 1000));

      // 정규식으로 데이터 추출
      const titleRegex = /<a class="title_link[^>]*>([^<]+)<\/a>/g;
      const contentRegex = /<div class="dsc_txt">([^<]+)<\/div>/g;
      const authorRegex = /<a class="sub_txt[^>]*>([^<]+)<\/a>/g;

      const titles = [...html.matchAll(titleRegex)].map(match => match[1]);
      const contents = [...html.matchAll(contentRegex)].map(match => match[1]);
      const authors = [...html.matchAll(authorRegex)].map(match => match[1]);

      console.log('추출된 데이터:', {
        titles: titles.length,
        contents: contents.length,
        authors: authors.length,
      });

      results = titles.map((title, index) => ({
        title: title.trim(),
        content: contents[index]?.trim() || '',
        author: authors[index]?.trim() || '네이버 블로거',
        source: 'naver' as const,
      }));

      console.log('네이버 블로그 결과:', results.length);
    } else if (source === 'tistory') {
      console.log('티스토리 크롤링 시작');
      try {
        const response = await axios.get(
          `https://www.tistory.com/search/post?query=${encodeURIComponent(keyword)}`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
              Referer: 'https://www.tistory.com/',
            },
          }
        );

        console.log('티스토리 응답 수신:', response.status);
        const html = response.data;

        // 디버깅을 위한 HTML 구조 출력
        console.log('티스토리 HTML 구조:', html.substring(0, 1000));

        // 정규식으로 데이터 추출
        const titleRegex = /<a class="link_post[^>]*>([^<]+)<\/a>/g;
        const contentRegex = /<p class="desc">([^<]+)<\/p>/g;
        const authorRegex = /<span class="author">([^<]+)<\/span>/g;

        const titles = [...html.matchAll(titleRegex)].map(match => match[1]);
        const contents = [...html.matchAll(contentRegex)].map(match => match[1]);
        const authors = [...html.matchAll(authorRegex)].map(match => match[1]);

        console.log('추출된 데이터:', {
          titles: titles.length,
          contents: contents.length,
          authors: authors.length,
        });

        results = titles.map((title, index) => ({
          title: title.trim(),
          content: contents[index]?.trim() || '',
          author: authors[index]?.trim() || '티스토리 블로거',
          source: 'tistory' as const,
        }));

        console.log('티스토리 결과:', results.length);
      } catch (error) {
        console.error('티스토리 크롤링 오류:', error);
        if (error instanceof Error) {
          console.error('에러 상세:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
        }
        return NextResponse.json([]);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('크롤링 오류:', error);
    if (error instanceof Error) {
      console.error('에러 상세:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return NextResponse.json({ error: '크롤링 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
