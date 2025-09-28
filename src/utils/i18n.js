// Language localization configuration
export const SUPPORTED_LANGUAGES = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English"
  },
  "zh-CN": {
    code: "zh-CN",
    name: "Chinese (Simplified)",
    nativeName: "简体中文"
  },
  "zh-TW": {
    code: "zh-TW",
    name: "Chinese (Traditional)",
    nativeName: "繁體中文"
  }
};

// Default language is English
const DEFAULT_LANGUAGE = "en";

// Translation data
export const translations = {
  en: {
    // General
    "app.title": "Caris Kuji",
    "app.loading": "Loading...",
    "app.save": "Save",
    "app.cancel": "Cancel",
    "app.clear": "Clear",
    "app.close": "Close",
    "app.export": "Export",
    "app.import": "Import",
    "app.delete": "Delete",
    "app.search": "Search",
    "app.filter": "Filter",
    "app.sort": "Sort",
    "app.success": "Success",
    "app.error": "Error",
    
    // Home page
    "home.description": "Gacha prize drawing application for Carol x Iris merchandise",
    "home.startDrawing": "Start Drawing",
    "home.adminArea": "Admin Area",
    
    // Draw screen
    "draw.title": "Draw Session",
    "draw.description": "Confirm offline payments, choose draw presets, and reveal prizes with delightful animations.",
    "draw.startDraw": "Start Draw",
    "draw.drawing": "Drawing...",
    "draw.clearResults": "Clear Results",
    "draw.history": "History",
    "draw.customDraws": "Custom draws",
    "draw.fanName": "Fan name",
    "draw.sessionNumber": "Session #",
    "draw.queueNumber": "Queue (optional)",
    "draw.noDraws": "No draws recorded yet.",
    "draw.drawResults": "Draw results will appear here once you start a session.",
    "draw.noStock": "No stock",
    "draw.stock": "Stock",
    "draw.pulls": "pulls",
    "draw.tier": "Tier",
    "draw.prize": "Prize",
    "draw.sku": "SKU",
    "draw.weight": "Weight",
    "draw.quantity": "Remaining Qty",
    "draw.notes": "Notes",
    "draw.noNotes": "No additional notes",
    "draw.draw": "Draw",
    "draw.unknownPrize": "Unknown prize",
    
    // History
    "history.title": "Draw History",
    "history.subtitle": "Chronological log of completed draw sessions.",
    "history.searchPlaceholder": "Search history...",
    "history.entriesFound": "entries found",
    "history.entryFound": "entry found",
    "history.noEntries": "No matching draw history found.",
    "history.session": "Session",
    "history.unknownFan": "Unknown fan",
    "history.queue": "Queue",
    "history.custom": "Custom",
    "history.openInNewTab": "Open in new tab",
    "history.filterAll": "All Fields",
    "history.filterFan": "Fan Name",
    "history.filterTier": "Tier",
    "history.filterPrize": "Prize",
    "history.filterQueue": "Queue #",
    "history.draws": "Draws",
    
    // Settings
    "settings.title": "General Settings",
    "settings.currency": "Currency",
    "settings.nextSessionNumber": "Next Session Number",
    "settings.country": "Country",
    "settings.selectCountry": "Select a country",
    "settings.language": "Language",
    "settings.weightMode": "Weight Calculation Mode",
    "settings.basic": "Basic (Sum of weights)",
    "settings.advanced": "Advanced (Weight × Quantity, 100% probability)",
    "settings.basicDesc": "Basic: Each prize's weight is used directly without considering quantity",
    "settings.advancedDesc": "Advanced: Total probability is calculated as weight × quantity for each prize",
    "settings.tierColors": "Tier Color Settings",
    "settings.tierColorsDesc": "Customize the color scheme for each prize tier.",
    "settings.resetWarning": "This will reset all application data. Do you want to export your data first?",
    "settings.resetConfirm": "Yes, reset everything",
    "settings.exportFirst": "Export data first",
    "settings.resetCancel": "Cancel",
    "settings.resetAll": "Reset All Data",
    "settings.saved": "Settings saved successfully.",
    "settings.resetSuccess": "All data reset successfully.",
    
    // Prize pool
    "prizes.title": "Prize Pool Manager",
    "prizes.import": "Import Prizes CSV",
    "prizes.loadSample": "Load Sample Data",
    "prizes.addRow": "Add Row",
    "prizes.exportCsv": "Export CSV",
    "prizes.noPrizes": "No prize data yet. Import a CSV, load sample data, or add rows manually.",
    
    // Admin
    "admin.title": "Admin Console",
    "admin.description": "Manage prize pools, configure pricing presets, and control session settings.",
    "admin.prizes": "Prize Pool",
    "admin.pricing": "Pricing & Bonus",
    "admin.settings": "Settings",
    
    // Errors
    "error.fanNameRequired": "Fan name is required before drawing.",
    "error.validDrawCount": "Enter a valid draw count.",
    "error.noPrizes": "No prizes available. Load prize pool in admin first.",
    "error.stockExhausted": "All prize stock is exhausted."
  },
  "zh-CN": {
    // General
    "app.title": "Caris 抽奖",
    "app.loading": "加载中...",
    "app.save": "保存",
    "app.cancel": "取消",
    "app.clear": "清除",
    "app.close": "关闭",
    "app.export": "导出",
    "app.import": "导入",
    "app.delete": "删除",
    "app.search": "搜索",
    "app.filter": "筛选",
    "app.sort": "排序",
    "app.success": "成功",
    "app.error": "错误",
    
    // Home page
    "home.description": "Carol x Iris周边抽奖应用",
    "home.startDrawing": "开始抽奖",
    "home.adminArea": "管理区域",
    
    // Draw screen
    "draw.title": "抽奖会话",
    "draw.description": "确认线下支付，选择抽奖预设，并通过精美动画展示奖品。",
    "draw.startDraw": "开始抽奖",
    "draw.drawing": "抽奖中...",
    "draw.clearResults": "清除结果",
    "draw.history": "历史记录",
    "draw.customDraws": "自定义抽奖",
    "draw.fanName": "粉丝姓名",
    "draw.sessionNumber": "场次 #",
    "draw.queueNumber": "队列号（可选）",
    "draw.noDraws": "尚无抽奖记录。",
    "draw.drawResults": "开始抽奖后，结果将显示在此处。",
    "draw.noStock": "无库存",
    "draw.stock": "库存",
    "draw.pulls": "次抽奖",
    "draw.tier": "等级",
    "draw.prize": "奖品",
    "draw.sku": "SKU",
    "draw.weight": "权重",
    "draw.quantity": "剩余数量",
    "draw.notes": "备注",
    "draw.noNotes": "无额外备注",
    "draw.draw": "抽奖",
    "draw.unknownPrize": "未知奖品",
    
    // History
    "history.title": "抽奖历史",
    "history.subtitle": "已完成抽奖场次的时间顺序记录。",
    "history.searchPlaceholder": "搜索历史记录...",
    "history.entriesFound": "条记录",
    "history.entryFound": "条记录",
    "history.noEntries": "未找到匹配的抽奖历史记录。",
    "history.session": "场次",
    "history.unknownFan": "未知粉丝",
    "history.queue": "队列",
    "history.custom": "自定义",
    "history.openInNewTab": "在新标签页中打开",
    "history.filterAll": "所有字段",
    "history.filterFan": "粉丝姓名",
    "history.filterTier": "等级",
    "history.filterPrize": "奖品",
    "history.filterQueue": "队列号",
    "history.draws": "抽奖",
    
    // Settings
    "settings.title": "常规设置",
    "settings.currency": "货币",
    "settings.nextSessionNumber": "下一场次编号",
    "settings.country": "国家",
    "settings.selectCountry": "选择国家",
    "settings.language": "语言",
    "settings.weightMode": "权重计算模式",
    "settings.basic": "基础（权重总和）",
    "settings.advanced": "高级（权重 × 数量，100% 概率）",
    "settings.basicDesc": "基础：直接使用每个奖品的权重，不考虑数量",
    "settings.advancedDesc": "高级：每个奖品的总概率计算为权重 × 数量",
    "settings.tierColors": "等级颜色设置",
    "settings.tierColorsDesc": "自定义每个奖品等级的颜色方案。",
    "settings.resetWarning": "这将重置所有应用程序数据。是否要先导出数据？",
    "settings.resetConfirm": "是的，重置所有内容",
    "settings.exportFirst": "先导出数据",
    "settings.resetCancel": "取消",
    "settings.resetAll": "重置所有数据",
    "settings.saved": "设置保存成功。",
    "settings.resetSuccess": "所有数据重置成功。",
    
    // Prize pool
    "prizes.title": "奖品池管理",
    "prizes.import": "导入奖品CSV",
    "prizes.loadSample": "加载示例数据",
    "prizes.addRow": "添加行",
    "prizes.exportCsv": "导出CSV",
    "prizes.noPrizes": "尚无奖品数据。导入CSV，加载示例数据，或手动添加行。",
    
    // Admin
    "admin.title": "管理控制台",
    "admin.description": "管理奖品池，配置价格预设，以及控制会话设置。",
    "admin.prizes": "奖品池",
    "admin.pricing": "价格与奖励",
    "admin.settings": "设置",
    
    // Errors
    "error.fanNameRequired": "抽奖前需要填写粉丝姓名。",
    "error.validDrawCount": "请输入有效的抽奖次数。",
    "error.noPrizes": "没有可用的奖品。请先在管理员页面加载奖品池。",
    "error.stockExhausted": "所有奖品库存已耗尽。"
  },
  "zh-TW": {
    // General
    "app.title": "Caris 抽獎",
    "app.loading": "載入中...",
    "app.save": "儲存",
    "app.cancel": "取消",
    "app.clear": "清除",
    "app.close": "關閉",
    "app.export": "匯出",
    "app.import": "匯入",
    "app.delete": "刪除",
    "app.search": "搜尋",
    "app.filter": "篩選",
    "app.sort": "排序",
    "app.success": "成功",
    "app.error": "錯誤",
    
    // Home page
    "home.description": "Carol x Iris周邊抽獎應用",
    "home.startDrawing": "開始抽獎",
    "home.adminArea": "管理區域",
    
    // Draw screen
    "draw.title": "抽獎會話",
    "draw.description": "確認線下支付，選擇抽獎預設，並透過精美動畫展示獎品。",
    "draw.startDraw": "開始抽獎",
    "draw.drawing": "抽獎中...",
    "draw.clearResults": "清除結果",
    "draw.history": "歷史記錄",
    "draw.customDraws": "自訂抽獎",
    "draw.fanName": "粉絲姓名",
    "draw.sessionNumber": "場次 #",
    "draw.queueNumber": "隊列號（可選）",
    "draw.noDraws": "尚無抽獎記錄。",
    "draw.drawResults": "開始抽獎後，結果將顯示在此處。",
    "draw.noStock": "無庫存",
    "draw.stock": "庫存",
    "draw.pulls": "次抽獎",
    "draw.tier": "等級",
    "draw.prize": "獎品",
    "draw.sku": "SKU",
    "draw.weight": "權重",
    "draw.quantity": "剩餘數量",
    "draw.notes": "備註",
    "draw.noNotes": "無額外備註",
    "draw.draw": "抽獎",
    "draw.unknownPrize": "未知獎品",
    
    // History
    "history.title": "抽獎歷史",
    "history.subtitle": "已完成抽獎場次的時間順序記錄。",
    "history.searchPlaceholder": "搜尋歷史記錄...",
    "history.entriesFound": "條記錄",
    "history.entryFound": "條記錄",
    "history.noEntries": "未找到匹配的抽獎歷史記錄。",
    "history.session": "場次",
    "history.unknownFan": "未知粉絲",
    "history.queue": "隊列",
    "history.custom": "自訂",
    "history.openInNewTab": "在新標籤頁中開啟",
    "history.filterAll": "所有欄位",
    "history.filterFan": "粉絲姓名",
    "history.filterTier": "等級",
    "history.filterPrize": "獎品",
    "history.filterQueue": "隊列號",
    "history.draws": "抽獎",
    
    // Settings
    "settings.title": "一般設定",
    "settings.currency": "貨幣",
    "settings.nextSessionNumber": "下一場次編號",
    "settings.country": "國家",
    "settings.selectCountry": "選擇國家",
    "settings.language": "語言",
    "settings.weightMode": "權重計算模式",
    "settings.basic": "基礎（權重總和）",
    "settings.advanced": "進階（權重 × 數量，100% 概率）",
    "settings.basicDesc": "基礎：直接使用每個獎品的權重，不考慮數量",
    "settings.advancedDesc": "進階：每個獎品的總概率計算為權重 × 數量",
    "settings.tierColors": "等級顏色設定",
    "settings.tierColorsDesc": "自訂每個獎品等級的顏色方案。",
    "settings.resetWarning": "這將重置所有應用程式數據。是否要先匯出數據？",
    "settings.resetConfirm": "是的，重置所有內容",
    "settings.exportFirst": "先匯出數據",
    "settings.resetCancel": "取消",
    "settings.resetAll": "重置所有數據",
    "settings.saved": "設定儲存成功。",
    "settings.resetSuccess": "所有數據重置成功。",
    
    // Prize pool
    "prizes.title": "獎品池管理",
    "prizes.import": "匯入獎品CSV",
    "prizes.loadSample": "載入範例數據",
    "prizes.addRow": "新增行",
    "prizes.exportCsv": "匯出CSV",
    "prizes.noPrizes": "尚無獎品數據。匯入CSV，載入範例數據，或手動新增行。",
    
    // Admin
    "admin.title": "管理控制台",
    "admin.description": "管理獎品池，配置價格預設，以及控制會話設定。",
    "admin.prizes": "獎品池",
    "admin.pricing": "價格與獎勵",
    "admin.settings": "設定",
    
    // Errors
    "error.fanNameRequired": "抽獎前需要填寫粉絲姓名。",
    "error.validDrawCount": "請輸入有效的抽獎次數。",
    "error.noPrizes": "沒有可用的獎品。請先在管理員頁面載入獎品池。",
    "error.stockExhausted": "所有獎品庫存已耗盡。"
  }
};

// Get browser language or default to English
export function getBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || DEFAULT_LANGUAGE;
  
  // Check if we have an exact match
  if (translations[browserLang]) {
    return browserLang;
  }
  
  // Check if we have a match for the language part (e.g., "en" from "en-US")
  const langPart = browserLang.split('-')[0];
  if (translations[langPart]) {
    return langPart;
  }
  
  // For Chinese, map to either Simplified or Traditional based on region
  if (langPart === 'zh') {
    const region = browserLang.split('-')[1]?.toUpperCase();
    if (region === 'CN' || region === 'SG') {
      return 'zh-CN'; // Simplified Chinese
    } else if (region === 'TW' || region === 'HK' || region === 'MO') {
      return 'zh-TW'; // Traditional Chinese
    }
    // Default to Simplified Chinese if region is not specified
    return 'zh-CN';
  }
  
  // Default to English if no match
  return DEFAULT_LANGUAGE;
}

// Translation function
export function translate(key, lang = null) {
  const language = lang || localStorage.getItem('language') || getBrowserLanguage();
  const langData = translations[language] || translations[DEFAULT_LANGUAGE];
  
  return langData[key] || translations[DEFAULT_LANGUAGE][key] || key;
}

// Initialize language
export function initLanguage() {
  if (!localStorage.getItem('language')) {
    localStorage.setItem('language', getBrowserLanguage());
  }
  return localStorage.getItem('language');
}

// Set language
export function setLanguage(lang) {
  if (translations[lang]) {
    localStorage.setItem('language', lang);
    return true;
  }
  return false;
}