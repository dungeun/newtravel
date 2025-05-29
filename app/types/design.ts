export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  hover: string;
  headerBg: string;
  headerText: string;
  footerBg: string;
  footerText: string;
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  borderStyles: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    rounded: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
  fonts: {
    body: string;
    heading: string;
  };
  boxShadow: string;
}

export const defaultTheme: ThemeConfig = {
  name: '기본 테마 (블랙)',
  colors: {
    primary: '#38B2AC', // teal-500
    secondary: '#4A5568', // gray-700
    accent: '#ED8936', // orange-500
    background: '#F7FAFC', // gray-100
    text: '#1A202C', // gray-900
    border: 'border-gray-200',
    hover: 'hover:bg-gray-800',
    headerBg: '#2D3748', // gray-800
    headerText: '#FFFFFF', // white
    footerBg: '#2D3748', // gray-800
    footerText: '#E2E8F0', // gray-200
  },
  borderStyles: {
    none: 'border-none',
    sm: 'border border-gray-200',
    md: 'border border-gray-200',
    lg: 'border border-gray-200',
    xl: 'border border-gray-200',
    rounded: 'rounded',
  },
  spacing: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  },
  fonts: {
    body: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
    heading:
      "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
  },
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // shadow-md
};

export const blueTheme: ThemeConfig = {
  name: '블루 테마',
  colors: {
    primary: '#4299E1', // blue-500
    secondary: '#2B6CB0', // blue-700
    accent: '#F6AD55', // orange-400
    background: '#EBF8FF', // blue-100
    text: '#2A4365', // blue-900
    border: 'border-blue-200',
    hover: 'hover:bg-blue-700',
    headerBg: '#2C5282', // blue-800
    headerText: '#FFFFFF', // white
    footerBg: '#2C5282', // blue-800
    footerText: '#EBF8FF', // blue-100
  },
  borderStyles: {
    none: 'border-none',
    sm: 'border border-blue-200',
    md: 'border border-blue-200',
    lg: 'border border-blue-200',
    xl: 'border border-blue-200',
    rounded: 'rounded',
  },
  spacing: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  },
  fonts: {
    body: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
    heading:
      "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
  },
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-lg
};

export const greenTheme: ThemeConfig = {
  name: '그린 테마',
  colors: {
    primary: '#48BB78', // green-500
    secondary: '#2F855A', // green-700
    accent: '#F6AD55', // orange-400
    background: '#F0FFF4', // green-100
    text: '#22543D', // green-900
    border: 'border-green-200',
    hover: 'hover:bg-green-700',
    headerBg: '#276749', // green-800
    headerText: '#FFFFFF', // white
    footerBg: '#276749', // green-800
    footerText: '#F0FFF4', // green-100
  },
  borderStyles: {
    none: 'border-none',
    sm: 'border border-green-200',
    md: 'border border-green-200',
    lg: 'border border-green-200',
    xl: 'border border-green-200',
    rounded: 'rounded',
  },
  spacing: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  },
  fonts: {
    body: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
    heading:
      "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
  },
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-lg
};
