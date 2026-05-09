/**
 * AI 智能体问答 - 前端界面（jQuery 版）
 *
 * ============================================
 *  API 对接说明
 * ============================================
 *
 *  本项目默认使用 Mock 模式（模拟AI回复）。
 *  要对接真实 API，请修改下方 API_CONFIG 配置，
 *  并实现 sendMessageToAPI 函数。
 *
 *  支持两种对接模式：
 *
 *  1. 标准模式（非流式）：
 *     - API 返回完整的 JSON 响应
 *     - 格式：{ "reply": "AI的回复内容" }
 *
 *  2. 流式模式（SSE）：
 *     - API 返回 Server-Sent Events 流
 *     - 每行格式：data: {"content": "一段文本"}
 *     - 结束标记：data: [DONE]
 *
 * ============================================
 */

// ============================================
// API 配置（请根据实际情况修改）
// ============================================
var API_CONFIG = {
  // 是否使用 Mock 模式（设为 false 后将调用真实 API）
  useMock: true,

  // API 基础地址
  baseUrl: 'http://localhost:8080/api',

  // 请求路径
  chatEndpoint: '/chat',

  // 是否启用流式输出
  streaming: false,

  // 请求超时时间（毫秒）
  timeout: 30000,

  // 自定义请求头
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer YOUR_TOKEN',
  },
};

// ============================================
// Mock 数据
// ============================================
var MOCK_RESPONSES = [
  {
    keywords: ['你好', '嗨', 'hi', 'hello', '在吗'],
    reply: '你好！👋 很高兴见到你。我是你的 AI 智能体助手，有什么可以帮你的吗？',
  },
  {
    keywords: ['人工智能', 'AI', '什么是'],
    reply: '**人工智能（AI）** 是计算机科学的一个重要分支，致力于创建能够模拟人类智能行为的系统。\n\n' +
      '主要包含以下几个方向：\n\n' +
      '1. **机器学习** — 让计算机从数据中自动学习规律\n' +
      '2. **深度学习** — 基于神经网络的多层学习方法\n' +
      '3. **自然语言处理** — 让计算机理解和生成人类语言\n' +
      '4. **计算机视觉** — 让计算机"看懂"图像和视频\n' +
      '5. **强化学习** — 通过试错和奖励机制来学习最优策略\n\n' +
      '目前 AI 已经广泛应用于：\n' +
      '- 🗣️ 智能助手（如我！）\n' +
      '- 🚗 自动驾驶\n' +
      '- 🏥 医疗诊断\n' +
      '- 📝 内容创作\n' +
      '- 🔬 科学研究\n\n' +
      '你对哪个方向比较感兴趣？',
    sources: {
      docName: '人工智能基础教程.pdf',
      docUrl: 'https://example.com/docs/ai-intro.pdf',
      chunks: [
        '人工智能（Artificial Intelligence，简称AI）是计算机科学的一个分支，旨在开发能够模拟、延伸和扩展人类智能的理论、方法、技术及应用系统。',
        '机器学习是人工智能的核心子领域，通过算法让计算机从数据中学习模式，无需显式编程即可完成特定任务。常见方法包括监督学习、无监督学习和强化学习。',
        '深度学习是机器学习的一个分支，使用多层神经网络来学习数据的层次化表示。卷积神经网络（CNN）和循环神经网络（RNN）是两种常见的深度学习架构。'
      ]
    }
  },
  {
    keywords: ['快速排序', '排序', '算法', 'python', 'Python'],
    reply: '当然！这是一个经典的 **快速排序算法** 的 Python 实现：\n\n' +
      '```python\n' +
      'def quick_sort(arr):\n' +
      '    """快速排序算法"""\n' +
      '    if len(arr) <= 1:\n' +
      '        return arr\n\n' +
      '    pivot = arr[len(arr) // 2]\n' +
      '    left = [x for x in arr if x < pivot]\n' +
      '    middle = [x for x in arr if x == pivot]\n' +
      '    right = [x for x in arr if x > pivot]\n\n' +
      '    return quick_sort(left) + middle + quick_sort(right)\n\n' +
      '# 使用示例\n' +
      'data = [38, 27, 43, 3, 9, 82, 10]\n' +
      'sorted_data = quick_sort(data)\n' +
      'print(f"排序结果: {sorted_data}")\n' +
      '# 输出: 排序结果: [3, 9, 10, 27, 38, 43, 82]\n' +
      '```\n\n' +
      '**算法特点：**\n' +
      '- ⏱️ 平均时间复杂度：O(n log n)\n' +
      '- 📦 空间复杂度：O(n)\n' +
      '- 🔄 不稳定排序\n\n' +
      '需要我进一步解释算法原理或提供其他语言的实现吗？',
  },
  {
    keywords: ['推荐', '书', '阅读', '好书'],
    reply: '很高兴为你推荐一些好书！📚\n\n' +
      '**技术类：**\n' +
      '1. 《深入理解计算机系统》— CSAPP 经典之作\n' +
      '2. 《设计模式》— 软件工程必读\n' +
      '3. 《代码整洁之道》— 写出优雅代码的指南\n\n' +
      '**思维类：**\n' +
      '1. 《思考，快与慢》— 丹尼尔·卡尼曼\n' +
      '2. 《原则》— 瑞·达利欧\n' +
      '3. 《人类简史》— 尤瓦尔·赫拉利\n\n' +
      '**文学类：**\n' +
      '1. 《百年孤独》— 加西亚·马尔克斯\n' +
      '2. 《活着》— 余华\n' +
      '3. 《小王子》— 圣·埃克苏佩里\n\n' +
      '你比较偏好哪个类型？我可以给出更精准的推荐 😊',
  },
];

var DEFAULT_REPLY = '感谢你的提问！这是一个很好的问题。\n\n' +
  '作为一个 AI 助手，我可以帮你：\n' +
  '- 💡 回答各类知识问题\n' +
  '- 💻 编写和解释代码\n' +
  '- 📝 辅助写作和翻译\n' +
  '- 📊 分析和整理信息\n' +
  '- 🎯 提供建议和方案\n\n' +
  '请告诉我你具体需要什么帮助，我会尽力为你解答！\n\n' +
  '> 💡 提示：当前为 Mock 模式，如需对接真实 API，请修改 `API_CONFIG` 配置。';

// ============================================
// 应用状态
// ============================================
var state = {
  sessions: [],
  currentSessionId: null,
  isGenerating: false,
};

// ============================================
// 工具函数
// ============================================

/** 生成唯一ID */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 获取当前时间字符串 */
function getTimeString() {
  var now = new Date();
  return now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 简单的 Markdown 渲染 */
function renderMarkdown(text) {
  var html = text
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, function(_, lang, code) {
      return '<pre><code>' + escapeHtml($.trim(code)) + '</code></pre>';
    })
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 粗体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 引用
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // 无序列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 有序列表
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // 段落（双换行）
    .replace(/\n\n/g, '</p><p>')
    // 单换行
    .replace(/\n/g, '<br>');

  // 包裹列表项
  html = html.replace(/((?:<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>');
  // 包裹段落
  html = '<p>' + html + '</p>';
  // 清理空段落
  html = html.replace(/<p>\s*<\/p>/g, '');
  // 清理 pre 内的 p 标签
  html = html.replace(/<p>\s*(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1');

  return html;
}

/** HTML 转义 */
function escapeHtml(text) {
  var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, function(c) { return map[c]; });
}

/** 自动调整 textarea 高度 */
function autoResize($textarea) {
  $textarea.css('height', 'auto');
  $textarea.css('height', Math.min($textarea[0].scrollHeight, 150) + 'px');
}

/** 滚动到底部 */
function scrollToBottom() {
  var $chatMessages = $('#chatMessages');
  $chatMessages.scrollTop($chatMessages[0].scrollHeight);
}

// ============================================
// 会话管理
// ============================================

/** 创建新会话 */
function createSession() {
  var session = {
    id: generateId(),
    title: '新对话',
    messages: [],
    createdAt: Date.now(),
  };
  state.sessions.unshift(session);
  state.currentSessionId = session.id;
  renderMessages();
  $('#chatInput').focus();
  saveSessions();
}

/** 获取当前会话 */
function getCurrentSession() {
  for (var i = 0; i < state.sessions.length; i++) {
    if (state.sessions[i].id === state.currentSessionId) {
      return state.sessions[i];
    }
  }
  return undefined;
}

/** 切换会话 */
function switchSession(sessionId) {
  state.currentSessionId = sessionId;
  renderMessages();
}

/** 删除会话 */
function deleteSession(sessionId) {
  state.sessions = $.grep(state.sessions, function(s) {
    return s.id !== sessionId;
  });
  if (state.currentSessionId === sessionId) {
    if (state.sessions.length > 0) {
      switchSession(state.sessions[0].id);
    } else {
      createSession();
    }
  }
  saveSessions();
}

/** 更新会话标题 */
function updateSessionTitle(session) {
  // 无侧边栏，无需更新标题显示
}

// ============================================
// 渲染函数
// ============================================

/** 渲染消息列表 */
function renderMessages() {
  var session = getCurrentSession();
  if (!session || session.messages.length === 0) {
    $('#welcomeScreen').removeClass('hidden');
    // 只保留欢迎界面
    $('#chatMessages').find('.message').remove();
    return;
  }

  $('#welcomeScreen').addClass('hidden');

  // 清空现有消息
  $('#chatMessages').find('.message').remove();

  // 渲染所有消息
  $.each(session.messages, function(i, msg) {
    appendMessageDOM(msg, false);
  });

  scrollToBottom();
}

/** 添加消息DOM元素 */
function appendMessageDOM(msg, animate) {
  if (animate === undefined) animate = true;

  var div = $('<div>').addClass('message ' + msg.role);
  if (!animate) div.css('animation', 'none');

  var avatar = msg.role === 'user' ? '👤' : '🤖';
  var timeStr = msg.time || getTimeString();

  var bubbleContent = '';
  if (msg.role === 'user') {
    bubbleContent = escapeHtml(msg.content).replace(/\n/g, '<br>');
  } else {
    bubbleContent = renderMarkdown(msg.content);
  }

  // 构建溯源信息 HTML
  var sourceHtml = '';
  if (msg.sources && msg.sources.docName) {
    var s = msg.sources;
    var chunkNums = '';
    for (var i = 0; i < s.chunks.length; i++) {
      chunkNums += '<span class="source-chunk-num" data-chunk-index="' + i + '">' + (i + 1) + '</span>';
      if (i < s.chunks.length - 1) chunkNums += ',';
    }
    sourceHtml = '<div class="message-sources">' +
      '<a class="source-doc-link" href="' + escapeHtml(s.docUrl) + '" target="_blank" rel="noopener">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
        escapeHtml(s.docName) +
      '</a>' +
      '<span class="source-divider">|</span>' +
      '<span class="source-chunks">' + chunkNums + '</span>' +
    '</div>';

    // 存储知识块数据到 DOM
    div.attr('data-chunks', JSON.stringify(s.chunks));
  }

  div.html(
    '<div class="message-avatar">' + avatar + '</div>' +
    '<div class="message-content">' +
      '<div class="message-bubble">' + bubbleContent + '</div>' +
      sourceHtml +
      '<div class="message-time">' + timeStr + '</div>' +
    '</div>'
  );

  $('#chatMessages').append(div);
  return div;
}

/** 添加正在输入指示器 */
function showTypingIndicator() {
  var div = $('<div>').addClass('message assistant').attr('id', 'typingIndicator');
  div.html(
    '<div class="message-avatar">🤖</div>' +
    '<div class="message-content">' +
      '<div class="message-bubble">' +
        '<div class="typing-indicator">' +
          '<span></span><span></span><span></span>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
  $('#chatMessages').append(div);
  scrollToBottom();
}

/** 移除正在输入指示器 */
function removeTypingIndicator() {
  $('#typingIndicator').remove();
}

// ============================================
// 消息发送与 API 调用
// ============================================

/** 发送消息 */
function sendMessage(content) {
  if (!$.trim(content) || state.isGenerating) return;

  var session = getCurrentSession();
  if (!session) return;

  // 隐藏欢迎界面
  $('#welcomeScreen').addClass('hidden');

  // 添加用户消息
  var userMsg = {
    id: generateId(),
    role: 'user',
    content: $.trim(content),
    time: getTimeString(),
  };
  session.messages.push(userMsg);
  appendMessageDOM(userMsg);
  scrollToBottom();

  // 清空输入框
  $('#chatInput').val('');
  $('#chatInput').css('height', 'auto');
  $('#btnSend').prop('disabled', true);

  // 更新会话标题
  updateSessionTitle(session);

  // 显示AI正在输入
  state.isGenerating = true;
  showTypingIndicator();

  var promise;
  if (API_CONFIG.useMock) {
    promise = getMockResponse(content);
  } else if (API_CONFIG.streaming) {
    promise = streamResponse(content);
  } else {
    promise = sendMessageToAPI(content);
  }

  promise.then(function(result) {
    removeTypingIndicator();

    // result 可以是字符串或对象
    var reply = typeof result === 'string' ? result : (result.reply || '');
    var sources = typeof result === 'object' && result.sources ? result.sources : null;

    // 添加AI回复
    var aiMsg = {
      id: generateId(),
      role: 'assistant',
      content: reply,
      time: getTimeString(),
    };
    if (sources) aiMsg.sources = sources;
    session.messages.push(aiMsg);
    appendMessageDOM(aiMsg);
    scrollToBottom();
  }).fail(function(error) {
    removeTypingIndicator();

    // 显示错误消息
    var errorMsg = {
      id: generateId(),
      role: 'error',
      content: '❌ 请求失败：' + error.message,
      time: getTimeString(),
    };
    session.messages.push(errorMsg);
    appendMessageDOM(errorMsg);
    scrollToBottom();
  }).always(function() {
    state.isGenerating = false;
    $('#chatInput').focus();
    saveSessions();
  });
}

/** Mock 模式 - 获取模拟回复 */
function getMockResponse(userMessage) {
  var deferred = $.Deferred();

  // 查找匹配的回复
  var matched = null;
  for (var i = 0; i < MOCK_RESPONSES.length; i++) {
    var r = MOCK_RESPONSES[i];
    var found = false;
    for (var j = 0; j < r.keywords.length; j++) {
      if (userMessage.toLowerCase().indexOf(r.keywords[j].toLowerCase()) !== -1) {
        found = true;
        break;
      }
    }
    if (found) {
      matched = r;
      break;
    }
  }
  var reply = matched ? matched.reply : DEFAULT_REPLY;
  var sources = matched && matched.sources ? matched.sources : null;

  // 模拟网络延迟
  var delay = 800 + Math.random() * 1200;
  setTimeout(function() {
    if (sources) {
      deferred.resolve({ reply: reply, sources: sources });
    } else {
      deferred.resolve(reply);
    }
  }, delay);

  return deferred.promise();
}

/**
 * 标准模式 - 发送消息到 API
 *
 * 请求格式：
 * POST {baseUrl}{chatEndpoint}
 * Body: { "message": "用户消息", "session_id": "会话ID", "history": [...] }
 *
 * 响应格式：
 * { "reply": "AI回复内容" }
 */
function sendMessageToAPI(content) {
  var deferred = $.Deferred();
  var session = getCurrentSession();

  var history = $.map(session.messages, function(m) {
    return { role: m.role, content: m.content };
  });

  $.ajax({
    url: API_CONFIG.baseUrl + API_CONFIG.chatEndpoint,
    method: 'POST',
    headers: API_CONFIG.headers,
    data: JSON.stringify({
      message: content,
      session_id: session.id,
      history: history
    }),
    timeout: API_CONFIG.timeout,
    dataType: 'json',
    success: function(data) {
      deferred.resolve(data.reply || data.content || data.message || '（未收到有效回复）');
    },
    error: function(jqXHR) {
      if (jqXHR.statusText === 'timeout') {
        deferred.reject({ message: '请求超时，请稍后重试' });
      } else {
        deferred.reject({ message: 'HTTP ' + jqXHR.status + ': ' + jqXHR.statusText });
      }
    }
  });

  return deferred.promise();
}

/**
 * 流式模式 - SSE 流式接收
 *
 * 请求格式同标准模式，但响应为 SSE 流：
 * data: {"content": "一段文本"}
 * data: {"content": "继续"}
 * data: [DONE]
 */
function streamResponse(content) {
  var deferred = $.Deferred();
  var session = getCurrentSession();
  removeTypingIndicator();

  // 创建流式消息气泡
  var div = $('<div>').addClass('message assistant');
  div.html(
    '<div class="message-avatar">🤖</div>' +
    '<div class="message-content">' +
      '<div class="message-bubble streaming-cursor"></div>' +
      '<div class="message-time">' + getTimeString() + '</div>' +
    '</div>'
  );
  $('#chatMessages').append(div);
  var bubble = div.find('.message-bubble');

  var history = $.map(session.messages, function(m) {
    return { role: m.role, content: m.content };
  });

  var xhr = new XMLHttpRequest();
  var timeoutId = setTimeout(function() { xhr.abort(); }, API_CONFIG.timeout);

  xhr.open('POST', API_CONFIG.baseUrl + API_CONFIG.chatEndpoint, true);
  $.each(API_CONFIG.headers, function(key, value) {
    xhr.setRequestHeader(key, value);
  });

  var fullContent = '';
  var lastIndex = 0;

  xhr.onprogress = function() {
    var newData = xhr.responseText.substring(lastIndex);
    lastIndex = xhr.responseText.length;

    var lines = newData.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.indexOf('data: ') === 0) {
        var data = line.slice(6);
        data = $.trim(data);
        if (data === '[DONE]') break;

        try {
          var parsed = JSON.parse(data);
          fullContent += parsed.content || parsed.delta || '';
          bubble.html(renderMarkdown(fullContent));
          scrollToBottom();
        } catch(e) {
          // 忽略解析错误
        }
      }
    }
  };

  xhr.onload = function() {
    clearTimeout(timeoutId);
    if (xhr.status >= 200 && xhr.status < 300) {
      bubble.removeClass('streaming-cursor');
      deferred.resolve(fullContent);
    } else {
      div.remove();
      deferred.reject({ message: 'HTTP ' + xhr.status + ': ' + xhr.statusText });
    }
  };

  xhr.onerror = function() {
    clearTimeout(timeoutId);
    div.remove();
    deferred.reject({ message: '请求失败' });
  };

  xhr.onabort = function() {
    clearTimeout(timeoutId);
    div.remove();
    deferred.reject({ message: '请求超时，请稍后重试' });
  };

  xhr.send(JSON.stringify({
    message: content,
    session_id: session.id,
    history: history,
    stream: true
  }));

  return deferred.promise();
}

// ============================================
// 本地存储
// ============================================

function saveSessions() {
  try {
    localStorage.setItem('ai-chat-sessions', JSON.stringify(state.sessions));
    localStorage.setItem('ai-chat-current', state.currentSessionId);
  } catch(e) {
    // 存储满了或不可用，静默处理
  }
}

function loadSessions() {
  try {
    var saved = localStorage.getItem('ai-chat-sessions');
    var currentId = localStorage.getItem('ai-chat-current');
    if (saved) {
      state.sessions = JSON.parse(saved);
      state.currentSessionId = currentId || (state.sessions[0] && state.sessions[0].id);
    }
  } catch(e) {
    // 静默处理
  }
}

// ============================================
// 主题管理
// ============================================

function initTheme() {
  var saved = localStorage.getItem('ai-chat-theme');
  if (saved) {
    $('html').attr('data-theme', saved);
  } else {
    // 跟随系统偏好
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    $('html').attr('data-theme', prefersDark ? 'dark' : 'light');
  }
}

function toggleTheme() {
  var current = $('html').attr('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  $('html').attr('data-theme', next);
  localStorage.setItem('ai-chat-theme', next);
}

// ============================================
// 事件绑定
// ============================================

function bindEvents() {
  // 发送按钮
  $('#btnSend').on('click', function() {
    sendMessage($('#chatInput').val());
  });

  // 输入框
  $('#chatInput').on('input', function() {
    autoResize($('#chatInput'));
    $('#btnSend').prop('disabled', !$.trim($('#chatInput').val()));
  });

  $('#chatInput').on('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage($('#chatInput').val());
    }
  });

  // 清空当前对话
  $('#btnClear').on('click', function() {
    var session = getCurrentSession();
    if (session && session.messages.length > 0) {
      session.messages = [];
      renderMessages();
      saveSessions();
    }
  });

  // 主题切换
  $('#btnThemeToggle').on('click', toggleTheme);

  // 知识块悬停弹框（事件委托）
  var $tooltip = null;
  var tooltipTimer = null;

  $(document).on('mouseenter', '.source-chunk-num', function(e) {
    clearTimeout(tooltipTimer);
    var $num = $(this);
    var $msg = $num.closest('.message');
    var chunksData = $msg.attr('data-chunks');

    if (!chunksData) return;

    try {
      var chunks = JSON.parse(chunksData);
      var idx = parseInt($num.attr('data-chunk-index'), 10);
      if (isNaN(idx) || idx < 0 || idx >= chunks.length) return;

      var content = chunks[idx];

      // 创建或复用弹框
      if (!$tooltip) {
        $tooltip = $('<div class="chunk-tooltip"></div>');
        $('body').append($tooltip);
      }

      $tooltip.html('<div class="chunk-tooltip-header">知识块 ' + (idx + 1) + '</div><div class="chunk-tooltip-content">' + escapeHtml(content) + '</div>');

      // 定位弹框
      var rect = $num[0].getBoundingClientRect();
      var tooltipTop = rect.bottom + 6;
      var tooltipLeft = rect.left;

      // 防止超出右侧
      $tooltip.css({ display: 'block', visibility: 'hidden' });
      var tooltipWidth = $tooltip.outerWidth();
      if (tooltipLeft + tooltipWidth > window.innerWidth - 10) {
        tooltipLeft = window.innerWidth - tooltipWidth - 10;
      }
      // 防止超出底部
      var tooltipHeight = $tooltip.outerHeight();
      if (tooltipTop + tooltipHeight > window.innerHeight - 10) {
        tooltipTop = rect.top - tooltipHeight - 6;
      }

      $tooltip.css({
        top: tooltipTop + 'px',
        left: tooltipLeft + 'px',
        display: 'block',
        visibility: 'visible'
      });
    } catch(err) {
      // 解析失败忽略
    }
  });

  $(document).on('mouseleave', '.source-chunk-num', function() {
    tooltipTimer = setTimeout(function() {
      if ($tooltip) $tooltip.hide();
    }, 100);
  });

  // 弹框本身悬停时不消失
  $(document).on('mouseenter', '.chunk-tooltip', function() {
    clearTimeout(tooltipTimer);
  });

  $(document).on('mouseleave', '.chunk-tooltip', function() {
    tooltipTimer = setTimeout(function() {
      if ($tooltip) $tooltip.hide();
    }, 100);
  });
}

// ============================================
// 初始化
// ============================================

function init() {
  initTheme();
  loadSessions();
  bindEvents();

  if (state.sessions.length === 0) {
    createSession();
  } else {
    renderMessages();
  }

  $('#chatInput').focus();
}

// 启动应用
$(document).ready(init);
