/**
 * 翻译服务模块
 * 封装百度翻译API调用、MD5签名、语言映射、错误处理
 */

// 语言映射（从CopyPlusPlus参考项目提取）
export const LANGUAGES = [
  { code: 'auto', label: '检测语言' },
  { code: 'zh', label: '中文' },
  { code: 'en', label: '英语' },
  { code: 'jp', label: '日语' },
  { code: 'kor', label: '韩语' },
  { code: 'fra', label: '法语' },
  { code: 'de', label: '德语' },
  { code: 'ru', label: '俄语' },
  { code: 'cht', label: '繁体中文' },
  { code: 'spa', label: '西班牙语' },
  { code: 'pt', label: '葡萄牙语' },
  { code: 'it', label: '意大利语' },
  { code: 'vie', label: '越南语' },
  { code: 'th', label: '泰语' }
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

// 百度翻译API配置
interface BaiduTranslateConfig {
  appId: string;
  secretKey: string;
}

// 翻译请求参数
interface TranslateRequest {
  q: string;
  from: LanguageCode;
  to: LanguageCode;
  appid: string;
  salt: string;
  sign: string;
}

// 翻译响应
interface TranslateResponse {
  from: string;
  to: string;
  trans_result: Array<{ src: string; dst: string }>;
  error_code?: string;
  error_msg?: string;
}

// 翻译结果
export interface TranslateResult {
  text: string;
  from: string;
  to: string;
  duration: number; // 翻译耗时（毫秒）
}

// 速率限制：上次请求时间
let lastRequestTime = 0;

/**
 * 纯JS MD5实现（RFC 1321标准）
 * 避免引入第三方依赖
 */
function md5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function md51(s: string) {
    const n = s.length;
    let state = [1732584193, -271733879, -1732584194, 271733878];
    let i: number;

    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }

    s = s.substring(i - 64);
    const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    }

    tail[i >> 2] |= 0x80 << ((i % 4) << 3);

    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }

    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function md5blk(s: string) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  const hex_chr = '0123456789abcdef'.split('');

  function rhex(n: number) {
    let s = '';
    for (let j = 0; j < 4; j++) {
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
    }
    return s;
  }

  function hex(x: number[]) {
    return rhex(x[0]) + rhex(x[1]) + rhex(x[2]) + rhex(x[3]);
  }

  function add32(a: number, b: number) {
    return (a + b) & 0xFFFFFFFF;
  }

  return hex(md51(string));
}

/**
 * 生成随机盐值
 */
function generateSalt(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * 速率限制：确保请求间隔至少1秒
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;

  if (elapsed < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
  }

  lastRequestTime = Date.now();
}

/**
 * 百度翻译API错误码映射
 */
const ERROR_MESSAGES: Record<string, string> = {
  '52001': '请求超时，请重试',
  '52002': '系统错误，请稍后重试',
  '52003': '未授权用户，请检查API Key',
  '54000': '必填参数为空',
  '54001': '签名错误，请检查Secret Key',
  '54003': '访问频率受限，请稍后重试',
  '54004': '账户余额不足',
  '54005': '长query请求频繁，请缩短文本长度'
};

/**
 * 获取API端点（开发环境使用代理）
 */
function getApiUrl(): string {
  return import.meta.env.DEV
    ? '/api/baidu-translate'
    : 'https://fanyi-api.baidu.com/api/trans/vip/translate';
}

/**
 * 调用百度翻译API
 */
export async function translate(
  text: string,
  from: LanguageCode,
  to: LanguageCode,
  config: BaiduTranslateConfig
): Promise<TranslateResult> {
  const startTime = Date.now();

  // 验证配置
  if (!config.appId || !config.secretKey) {
    throw new Error('请先在设置页面配置百度翻译API Key');
  }

  // 验证文本
  if (!text.trim()) {
    throw new Error('请输入要翻译的文本');
  }

  // 速率限制
  await waitForRateLimit();

  // 生成签名参数
  const salt = generateSalt();
  const signStr = config.appId + text + salt + config.secretKey;
  const sign = md5(signStr);

  // 构建请求参数
  const params: TranslateRequest = {
    q: text,
    from,
    to,
    appid: config.appId,
    salt,
    sign
  };

  // 发起请求
  try {
    const url = getApiUrl();
    const queryString = new URLSearchParams(params as any).toString();

    const response = await fetch(`${url}?${queryString}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      signal: AbortSignal.timeout(5000) // 5秒超时
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const data: TranslateResponse = await response.json();

    // 检查API错误
    if (data.error_code) {
      const errorMsg = ERROR_MESSAGES[data.error_code] || `未知错误: ${data.error_code}`;
      throw new Error(errorMsg);
    }

    // 检查翻译结果
    if (!data.trans_result || data.trans_result.length === 0) {
      throw new Error('翻译结果为空');
    }

    // 拼接翻译结果
    const translatedText = data.trans_result.map(item => item.dst).join('\n');
    const duration = Date.now() - startTime;

    return {
      text: translatedText,
      from: data.from,
      to: data.to,
      duration
    };
  } catch (error: any) {
    // 处理特定错误类型
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接');
    }

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('跨域请求被阻止，请确认开发服务器代理已配置');
    }

    throw error;
  }
}

/**
 * 获取语言标签
 */
export function getLanguageLabel(code: LanguageCode): string {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang ? lang.label : code;
}

/**
 * 拆分长文本（百度API限制6000字节）
 */
export function splitText(text: string, maxLength: number = 2000): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      parts.push(remaining);
      break;
    }

    // 尝试在标点符号处拆分
    let splitIndex = -1;
    const punctuation = ['。', '！', '？', '\n', '.', '!', '?', '；', ';', '，', ','];

    for (const p of punctuation) {
      const index = remaining.lastIndexOf(p, maxLength);
      if (index > 0) {
        splitIndex = index + 1;
        break;
      }
    }

    // 如果找不到合适的拆分点，强制在最大长度处拆分
    if (splitIndex === -1) {
      splitIndex = maxLength;
    }

    parts.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex);
  }

  return parts;
}
