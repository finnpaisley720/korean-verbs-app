import React, { useState, useEffect, useMemo } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Grid, 
  List, 
  Award, 
  HelpCircle, 
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

// 45組精準提取自 Paisley 筆記的韓文動詞資料
const VERB_DATABASE = [
  { korean: "공부하다", conjugation: "공부해요", past: "공부했어요", chinese: "學習", example: "한국어를 공부해요. (學習韓語。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "만나다", conjugation: "만나요", past: "만났어요", chinese: "見面/遇見", example: "오늘 친구를 만나요. (今天和朋友見面。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "보다", conjugation: "봐요", past: "봤어요", chinese: "看", example: "같이 영화를 봐요. (一起看電影。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "가다", conjugation: "가요", past: "갔어요", chinese: "去", example: "도서관에 가요. (去圖書館。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "오다", conjugation: "와요", past: "왔어요", chinese: "來", example: "학교에 일찍 와요. (很早來學校。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "먹다", conjugation: "먹어요", past: "먹었어요", chinese: "吃", example: "빵을 먹어요. (吃麵包。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "마시다", conjugation: "마셔요", past: "마셨어요", chinese: "喝", example: "커피를 마셔요. (喝咖啡。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "읽다", conjugation: "읽어요", past: "읽었어요", chinese: "閱讀/讀", example: "신문을 읽어요. (讀報紙。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "듣다", conjugation: "들어요", past: "들었어요", chinese: "聽", example: "음악을 들어요. (聽音樂。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "사다", conjugation: "사요", past: "샀어요", chinese: "買", example: "옷을 사요. (買衣服。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "청소하다", conjugation: "청소해요", past: "청소했어요", chinese: "打掃", example: "기숙사를 청소해요. (打掃宿舍。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "노래하다", conjugation: "노래해요", past: "노래했어요", chinese: "唱歌", example: "노래를 해요. (唱歌。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  
  { korean: "주다", conjugation: "주요 / 주세요", past: "줬어요", chinese: "給", example: "콜라 한 병 주세요. (請給我一瓶可樂。)", lesson: "L3 購物" },
  
  { korean: "쉬다", conjugation: "쉬어요", past: "쉬었어요", chinese: "休息", example: "집에서 좀 쉬어요. (在休息一下。)", lesson: "L4 日常生活 II" },
  { korean: "일어나다", conjugation: "일어나요", past: "일어났어요", chinese: "起床", example: "여섯 시쯤 일어나요. (六點左右起床。)", lesson: "L4 日常生活 II" },
  { korean: "끝나다", conjugation: "끝나요", past: "끝났어요", chinese: "結束", example: "수업이 끝나요. (課結束了。)", lesson: "L4 日常生活 II" },
  { korean: "쓰다", conjugation: "써요", past: "썼어요", chinese: "寫/使用", example: "편지를 써요. (寫信。)", lesson: "L4 日常生活 II" },
  { korean: "일하다", conjugation: "일해요", past: "일했어요", chinese: "工作", example: "회사에서 일해요. (在公司工作。)", lesson: "L4 日常生活 II" },
  
  { korean: "알다", conjugation: "알아요", past: "알았어요", chinese: "知道/認識", example: "하나 극장을 알아요? (你知道哈那電影院嗎？)", lesson: "L5 位置" },
  { korean: "건너가다", conjugation: "건너가요", past: "건너갔어요", chinese: "渡過/過(馬路)", example: "앞에서 길을 건너가세요. (請在前面過馬路。)", lesson: "L5 位置" },
  
  { korean: "주문하다", conjugation: "주문해요", past: "주문했어요", chinese: "點餐", example: "주문하시겠어요? (要點餐嗎？)", lesson: "L6 飲食" },
  
  { korean: "산책하다", conjugation: "산책해요", past: "산책했어요", chinese: "散步", example: "공원에서 산책해요. (在公園散步。)", lesson: "L7 約定" },
  { korean: "만들다", conjugation: "만들어요", past: "만들었어요", chinese: "製作/做", example: "음식을 만들어요. (做食物。)", lesson: "L7 約定" },
  { korean: "운동하다", conjugation: "운동해요", past: "운동했어요", chinese: "運動", example: "아침에 운동을 해요. (早上做運動。)", lesson: "L7 約定" },
  
  { korean: "좋아하다", conjugation: "좋아해요", past: "좋아했어요", chinese: "喜歡", example: "저는 봄을 좋아해요. (我喜歡春天。)", lesson: "L8-L9 季節天氣 & 週末活動" },
  { korean: "싫어하다", conjugation: "싫어해요", past: "싫어했어요", chinese: "討厭/不喜歡", example: "겨울을 싫어해요. (討厭冬天。)", lesson: "L8-L9 季節天氣 & 週末活動" },
  { korean: "수영하다", conjugation: "수영해요", past: "수영했어요", chinese: "游泳", example: "바다에서 수영을 해요. (在海裡游泳。)", lesson: "L8-L9 季節天氣 & 週末活動" },
  { korean: "빨래하다", conjugation: "빨래해요", past: "빨래했어요", chinese: "洗衣服", example: "주말에 빨래를 해요. (週末洗衣服。)", lesson: "L8-L9 季節天氣 & 週末活動" },
  { korean: "구경하다", conjugation: "구경해요", past: "구경했어요", chinese: "觀賞/逛街", example: "인사동에 가서 구경해요. (去仁寺洞逛逛。)", lesson: "L8-L9 季節天氣 & 週末活動" },
  { korean: "놀다", conjugation: "놀아요", past: "놀았어요", chinese: "玩/玩樂", example: "친구 집에 가서 놀아요. (去朋友家玩。)", lesson: "L8-L9 季節天氣 & 週末活動" },
  
  { korean: "타다", conjugation: "타요", past: "탔어요", chinese: "搭乘/騎", example: "지하철을 타고 가세요. (請搭地鐵去。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "갈아타다", conjugation: "갈아타요", past: "갈아탔어요", chinese: "轉乘/換乘", example: "버스로 갈아타세요. (請轉乘公車。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "걸리다", conjugation: "걸려요", past: "걸렸어요", chinese: "花費(時間)", example: "30분 정도 걸려요. (大概花費30分鐘。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "걸어오다", conjugation: "걸어와요", past: "걸어왔어요", chinese: "走路過來", example: "가까워서 걸어와요. (很近所以走過來。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "전화하다", conjugation: "전화해요", past: "전화했어요", chinese: "打電話", example: "제가 나중에 다시 전화할게요. (我等一下再打電話。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "보내다", conjugation: "보내요", past: "보냈어요", chinese: "寄/傳送", example: "이메일을 보내요. (寄電子郵件。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "들어오다", conjugation: "들어와요", past: "들어왔어요", chinese: "進來/回家", example: "여섯 시쯤 들어올 거예요. (大約六點會進來。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "받다", conjugation: "받아요", past: "받았어요", chinese: "接(電話)/收到", example: "전화 받으세요. (請接電話。)", lesson: "L10-L11 交通 & 電話" },
  
  { korean: "찍다", conjugation: "찍어요", past: "찍었어요", chinese: "拍攝/照相", example: "사진을 찍으러 가요. (去拍照片。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "치다", conjugation: "쳐요", past: "쳤어요", chinese: "打(網球、球類)", example: "테니스를 쳐요. (打網球。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "등산하다", conjugation: "등산해요", past: "등산했어요", chinese: "爬山/登山", example: "등산하는 것을 좋아해요. (喜歡爬山。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "다니다", conjugation: "다녀요", past: "다녔어요", chinese: "通勤/就讀/上班", example: "회사에 다니세요. (在公司上班。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "살다", conjugation: "살아요", past: "살았어요", chinese: "居住", example: "우리 가족은 대전에 살아요. (我們家人住在대전。)", lesson: "L12-L13 興趣 & 家人敬語" },
  
  // 敬語動詞敬稱變化
  { korean: "계시다", conjugation: "계세요", past: "계셨어요", chinese: "在 (있다的敬語)", example: "부모님은 고향에 계세요. (父母在故鄉。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "주무시다", conjugation: "주무세요", past: "주무셨어요", chinese: "睡覺 (자다的敬語)", example: "할머니가 방에서 주무세요. (奶奶在房間睡覺。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "드시다", conjugation: "드세요", past: "드셨어요", chinese: "吃/喝 (먹다/마시다的敬語)", example: "많이 드세요. (請多吃一點。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "돌아가시다", conjugation: "돌아가세요", past: "돌아가셨어요", chinese: "去世 (죽다的敬語)", example: "할아버지는 3년 전에 돌아가셨어요. (爺爺三年前過世了。)", lesson: "L12-L13 興趣 & 家人敬語" }
];

const CATEGORIES = ["全部單字", ...Array.from(new Set(VERB_DATABASE.map(v => v.lesson)))];

export default function App() {
  const [currentTab, setCurrentTab] = useState('study'); // 'study' | 'quiz' | 'list'
  const [selectedCategory, setSelectedCategory] = useState('全部單字');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 單字卡狀態
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userStatus, setUserStatus] = useState({}); // { [korean]: 'learned' | 'review' }
  const [shuffledDeck, setShuffledDeck] = useState(VERB_DATABASE);
  const [isShuffled, setIsShuffled] = useState(false);

  // 測驗狀態
  const [quizList, setQuizList] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizType, setQuizType] = useState('ko_zh'); // 'ko_zh' | 'zh_ko'

  // 過濾後的單字
  const filteredVerbs = useMemo(() => {
    return VERB_DATABASE.filter(verb => {
      const matchCategory = selectedCategory === '全部單字' || verb.lesson === selectedCategory;
      const matchSearch = verb.korean.includes(searchQuery) || 
                          verb.chinese.includes(searchQuery) ||
                          verb.conjugation.includes(searchQuery);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // 當分類或搜尋改變時，重設單字卡索引
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    if (isShuffled) {
      setShuffledDeck([...filteredVerbs].sort(() => Math.random() - 0.5));
    } else {
      setShuffledDeck(filteredVerbs);
    }
  }, [selectedCategory, searchQuery, isShuffled, filteredVerbs]);

  // 發音功能
  const playSound = (text) => {
    if ('speechSynthesis' in window) {
      // 停止先前正在播放的聲音
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85; // 稍微放慢一點速度更清晰
      window.speechSynthesis.speak(utterance);
    } else {
      alert("您的瀏覽器不支援語音合成播放功能。");
    }
  };

  // 切換隨機排序
  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  // 單字卡進度控制
  const handleNext = () => {
    if (shuffledDeck.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledDeck.length);
    }, 150);
  };

  const handlePrev = () => {
    if (shuffledDeck.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + shuffledDeck.length) % shuffledDeck.length);
    }, 150);
  };

  const markWordStatus = (korean, status) => {
    setUserStatus(prev => ({
      ...prev,
      [korean]: status
    }));
    handleNext();
  };

  // 產生測驗問題
  const generateQuiz = () => {
    if (filteredVerbs.length < 4) {
      // 若過濾後不夠 4 個，用全部單字庫來產生
      const shuffledAll = [...VERB_DATABASE].sort(() => Math.random() - 0.5);
      setupQuizQuestions(shuffledAll.slice(0, 10));
    } else {
      const shuffledFiltered = [...filteredVerbs].sort(() => Math.random() - 0.5);
      setupQuizQuestions(shuffledFiltered.slice(0, 10));
    }
  };

  const setupQuizQuestions = (selectedVerbs) => {
    const questions = selectedVerbs.map((target) => {
      // 從總字庫中找出非目標字作為干擾項
      const distractors = VERB_DATABASE
        .filter(v => v.korean !== target.korean)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [target, ...distractors].sort(() => Math.random() - 0.5);
      return {
        target,
        options
      };
    });
    setQuizList(questions);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
  };

  // 當進入測驗分頁時自動產生測驗
  useEffect(() => {
    if (currentTab === 'quiz') {
      generateQuiz();
    }
  }, [currentTab, selectedCategory]);

  const handleQuizAnswer = (option) => {
    if (showAnswer) return;
    setSelectedAnswer(option);
    setShowAnswer(true);
    if (option.korean === quizList[quizIndex].target.korean) {
      setScore(prev => prev + 1);
    }
    // 自動播放韓文語音
    playSound(quizList[quizIndex].target.korean);
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setShowAnswer(false);
    setQuizIndex(prev => prev + 1);
  };

  // 計算掌握進度
  const stats = useMemo(() => {
    const total = VERB_DATABASE.length;
    const mastered = Object.values(userStatus).filter(s => s === 'learned').length;
    const reviewing = Object.values(userStatus).filter(s => s === 'review').length;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, reviewing, percentage };
  }, [userStatus]);

  const activeCard = shuffledDeck[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* 頂部 Header */}
      <header className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm border border-white/30">
              <Sparkles className="w-6 h-6 text-yellow-100 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
                Finn's 韓文動詞單字卡 🦊
              </h1>
              <p className="text-xs text-orange-50 font-medium">專為 Paisley 打造的 1-13 課精準動詞特訓</p>
            </div>
          </div>
          
          {/* 進度條 */}
          <div className="w-full sm:w-64 bg-black/15 px-4 py-2.5 rounded-2xl backdrop-blur-sm border border-white/10 text-xs">
            <div className="flex justify-between mb-1.5 font-semibold text-orange-50">
              <span>整體掌握進度: {stats.mastered}/{stats.total} 個</span>
              <span>{stats.percentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-yellow-300 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* 導覽功能列 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* 左側邊欄：控制面板 */}
          <div className="md:col-span-1 space-y-6">
            
            {/* 功能分頁切換 */}
            <div className="bg-white p-3.5 rounded-3xl shadow-sm border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-400 px-2 uppercase tracking-widest">學習模式</p>
              <button 
                onClick={() => setCurrentTab('study')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${currentTab === 'study' ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Grid className="w-5 h-5" />
                🗂️ 3D 單字卡模式
              </button>
              <button 
                onClick={() => setCurrentTab('quiz')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${currentTab === 'quiz' ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <HelpCircle className="w-5 h-5" />
                ✍️ 隨堂測驗模式
              </button>
              <button 
                onClick={() => setCurrentTab('list')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${currentTab === 'list' ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <List className="w-5 h-5" />
                🔍 全部動詞清單
              </button>
            </div>

            {/* 分類過濾 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  課堂範圍篩選
                </label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium text-slate-700"
                >
                  {CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 快速關鍵字搜尋 */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  關鍵字搜尋
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="text"
                    placeholder="搜尋韓文、現在式、中文..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
            </div>

            {/* 學習小語 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-3xl border border-orange-100">
              <h4 className="text-sm font-bold text-orange-800 flex items-center gap-1.5 mb-1.5">
                🦊 Finn 的學習悄悄話
              </h4>
              <p className="text-xs text-orange-700 leading-relaxed font-medium">
                Paisley，背動詞是征服韓文的關鍵！要特別注意<strong>原型</strong>（如 공부하다）與<strong>現在式口語變化</strong>（공부해요）的關聯。多用右邊的發音功能，聽聲音能讓你大腦記憶速度翻倍喔！
              </p>
            </div>

          </div>

          {/* 右側主學習區 */}
          <div className="md:col-span-3 space-y-6">

            {/* 1. 單字卡學習模式 */}
            {currentTab === 'study' && (
              <div className="flex flex-col items-center justify-center space-y-6">
                
                {/* 資訊列 */}
                <div className="w-full flex items-center justify-between px-2 text-sm text-slate-500 font-semibold">
                  <span className="bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-1.5 text-xs">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                    當前字卡數: <strong className="text-slate-800">{shuffledDeck.length}</strong> 個
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleShuffle}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${isShuffled ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      {isShuffled ? '已隨機打亂' : '依課堂順序'}
                    </button>
                  </div>
                </div>

                {shuffledDeck.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm w-full">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold mb-2">哎呀！沒有找到符合條件的動詞單字</p>
                    <p className="text-xs text-slate-400">可以調整左側的課堂範圍或清空搜尋字元再試試看！</p>
                  </div>
                ) : (
                  <>
                    {/* 3D 卡片主體 */}
                    <div 
                      className="perspective-1000 relative w-full max-w-lg h-96 cursor-pointer"
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      <div className={`w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                        
                        {/* 正面：韓文 */}
                        <div className="absolute w-full h-full backface-hidden bg-white border-2 border-slate-100 rounded-[32px] p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition-all">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100/50">
                              {activeCard.lesson}
                            </span>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                              {currentIndex + 1} / {shuffledDeck.length}
                            </span>
                          </div>
                          
                          <div className="text-center space-y-4">
                            <h2 className="text-5xl font-black text-slate-800 tracking-tight">
                              {activeCard.korean}
                            </h2>
                            <p className="text-sm font-semibold text-slate-400 flex items-center justify-center gap-1.5">
                              [動詞原型]
                            </p>
                          </div>

                          <div className="flex justify-between items-center">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                playSound(activeCard.korean);
                              }}
                              className="bg-orange-50 hover:bg-orange-100 text-orange-600 p-4 rounded-full transition-all border border-orange-100 group shadow-sm"
                              title="播放真人發音"
                            >
                              <Volume2 className="w-6 h-6 group-hover:scale-110 duration-200" />
                            </button>
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full animate-pulse">
                              💡 點擊卡片看中文 & 口語口法
                            </span>
                          </div>
                        </div>

                        {/* 背面：翻譯與口語變化 */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-[32px] p-8 flex flex-col justify-between shadow-md">
                          
                          {/* 背面頂部 */}
                          <div className="flex justify-between items-center border-b border-orange-100 pb-3">
                            <span className="text-xs font-bold text-orange-600 bg-white px-3 py-1 rounded-full border border-orange-100">
                              解釋與例句
                            </span>
                            <div className="flex gap-2">
                              {userStatus[activeCard.korean] === 'learned' && (
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> 已熟記
                                </span>
                              )}
                              {userStatus[activeCard.korean] === 'review' && (
                                <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 flex items-center gap-0.5">
                                  <X className="w-3 h-3" /> 待複習
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 背面中部：詳細字義與變化 */}
                          <div className="space-y-4 py-2">
                            <div className="text-center">
                              <p className="text-3xl font-black text-orange-900 tracking-wide">
                                {activeCard.chinese}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-3 rounded-2xl border border-orange-100/60 text-center shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">現在式口語</span>
                                <strong className="text-lg font-bold text-orange-600">{activeCard.conjugation}</strong>
                              </div>
                              <div className="bg-white p-3 rounded-2xl border border-orange-100/60 text-center shadow-xs">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">過去式</span>
                                <strong className="text-lg font-bold text-slate-500">{activeCard.past}</strong>
                              </div>
                            </div>

                            {/* 例句 */}
                            <div className="bg-white/80 p-3.5 rounded-2xl border border-orange-100 text-sm">
                              <p className="text-xs font-bold text-slate-400 mb-1">📝 課本經典例句：</p>
                              <p className="font-bold text-slate-800 leading-snug">{activeCard.example.split(' ')[0]} {activeCard.example.split(' ').slice(1).join(' ')}</p>
                            </div>
                          </div>

                          {/* 背面底部控制 */}
                          <div className="flex justify-between items-center pt-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                playSound(activeCard.conjugation);
                              }}
                              className="bg-white hover:bg-orange-100/50 text-orange-600 px-4 py-2 rounded-2xl transition-all border border-orange-100 text-xs font-bold flex items-center gap-1 shadow-xs"
                            >
                              <Volume2 className="w-4 h-4" /> 聽口語發音
                            </button>
                            <span className="text-xs text-slate-400 font-medium">
                              點擊卡片翻回正面
                            </span>
                          </div>

                        </div>

                      </div>
                    </div>

                    {/* 下方卡片操作按鈕 */}
                    <div className="flex items-center justify-between w-full max-w-lg gap-4 mt-2">
                      <button 
                        onClick={handlePrev}
                        className="bg-white hover:bg-slate-50 text-slate-600 p-3.5 rounded-full border border-slate-200 transition-all shadow-sm"
                        title="上一個單字"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      <div className="flex gap-3 flex-1 justify-center">
                        <button 
                          onClick={() => markWordStatus(activeCard.korean, 'review')}
                          className="flex-1 bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 font-bold text-sm px-4 py-3 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <X className="w-4 h-4" /> 稍後複習
                        </button>
                        <button 
                          onClick={() => markWordStatus(activeCard.korean, 'learned')}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm px-4 py-3 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> 我學會了
                        </button>
                      </div>

                      <button 
                        onClick={handleNext}
                        className="bg-white hover:bg-slate-50 text-slate-600 p-3.5 rounded-full border border-slate-200 transition-all shadow-sm"
                        title="下一個單字"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </>
                )}

              </div>
            )}

            {/* 2. 隨堂測驗模式 */}
            {currentTab === 'quiz' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                
                {/* 測驗進度 */}
                {quizList.length > 0 && quizIndex < quizList.length ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
                      <div>
                        <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                          韓文動詞實力考驗 🎯
                        </span>
                        <h3 className="text-lg font-black text-slate-800 mt-1">
                          第 {quizIndex + 1} 題 / 共 {quizList.length} 題
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-semibold text-slate-500">
                          答對數: <strong className="text-emerald-500 text-base">{score}</strong> 分
                        </div>
                        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button 
                            onClick={() => { setQuizType('ko_zh'); generateQuiz(); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${quizType === 'ko_zh' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            韓翻中
                          </button>
                          <button 
                            onClick={() => { setQuizType('zh_ko'); generateQuiz(); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${quizType === 'zh_ko' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            中翻韓
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 題目框 */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-8 rounded-2xl text-center space-y-3 border border-slate-200/50">
                      <p className="text-xs font-bold text-slate-400 block uppercase tracking-widest">
                        {quizType === 'ko_zh' ? '請選出最正確的中文意思' : '請選出相對應的韓文動詞'}
                      </p>
                      
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                        {quizType === 'ko_zh' ? quizList[quizIndex].target.korean : quizList[quizIndex].target.chinese}
                      </h2>
                      
                      {quizType === 'ko_zh' && (
                        <p className="text-xs font-semibold text-slate-400">
                          現在式變化為：{quizList[quizIndex].target.conjugation}
                        </p>
                      )}
                    </div>

                    {/* 選項清單 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {quizList[quizIndex].options.map((option, idx) => {
                        const isTarget = option.korean === quizList[quizIndex].target.korean;
                        const isSelected = selectedAnswer?.korean === option.korean;
                        
                        let optionStyle = "border-slate-200 hover:border-orange-400 hover:bg-orange-50/20";
                        if (showAnswer) {
                          if (isTarget) {
                            optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold shadow-sm";
                          } else if (isSelected) {
                            optionStyle = "bg-rose-50 border-rose-500 text-rose-800 shadow-sm";
                          } else {
                            optionStyle = "opacity-50 border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed";
                          }
                        }

                        return (
                          <button 
                            key={idx}
                            disabled={showAnswer}
                            onClick={() => handleQuizAnswer(option)}
                            className={`w-full p-5 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between gap-3 text-base font-semibold ${optionStyle}`}
                          >
                            <span>
                              {quizType === 'ko_zh' ? option.chinese : option.korean}
                            </span>
                            
                            {showAnswer && isTarget && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            )}
                            {showAnswer && isSelected && !isTarget && (
                              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* 答題後詳解 */}
                    {showAnswer && (
                      <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl space-y-2.5 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-orange-900 flex items-center gap-1.5">
                            <GraduationCap className="w-5 h-5 text-orange-600" />
                            單字隨堂解說
                          </h4>
                          <button 
                            onClick={() => playSound(quizList[quizIndex].target.korean)}
                            className="text-xs font-bold text-orange-700 bg-white border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1"
                          >
                            <Volume2 className="w-3.5 h-3.5" /> 聽發音
                          </button>
                        </div>
                        <p className="text-sm font-bold text-slate-800">
                          🎯 正確答案：<strong>{quizList[quizIndex].target.korean}</strong> ({quizList[quizIndex].target.chinese})
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          現在口語：<strong>{quizList[quizIndex].target.conjugation}</strong> ｜ 過去式：<strong>{quizList[quizIndex].target.past}</strong>
                          <br />
                          範例句子：{quizList[quizIndex].target.example}
                        </p>
                        
                        <div className="pt-2 text-right">
                          <button 
                            onClick={handleNextQuiz}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
                          >
                            下一題
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // 測驗結束畫面
                  <div className="text-center py-10 space-y-6">
                    <div className="inline-block bg-yellow-100 p-5 rounded-full text-yellow-600">
                      <Award className="w-14 h-14 animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-800">
                        恭喜 Paisley 順利完成本次測驗！🎉
                      </h2>
                      <p className="text-slate-500 font-medium">
                        你這次獲得了 <strong className="text-orange-500 text-xl">{score}</strong> / {quizList.length} 分！
                      </p>
                    </div>

                    <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-500 leading-relaxed font-semibold">
                      {score === quizList.length ? (
                        <p className="text-emerald-600">🦊 「太神啦！你簡直是韓文大師，這 45 個動詞完全考不倒你！讚啦！」</p>
                      ) : score >= 7 ? (
                        <p className="text-amber-600">🦊 「表現得超棒！錯幾題沒關係，動詞口語變化需要常常練習，多用幾次單字卡很快就全記熟囉！」</p>
                      ) : (
                        <p className="text-rose-500">🦊 「沒問題的 Paisley！這次先把不會的單字利用單字卡熟讀幾次，相信下次我們一定能拿滿分！」</p>
                      )}
                    </div>

                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={generateQuiz}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" /> 重新測驗一組
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 3. 全部單字清單 */}
            {currentTab === 'list' && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      韓文動詞完整對照資料庫
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">顯示符合過濾條件的動詞清單 (共 {filteredVerbs.length} 個)</p>
                  </div>
                  
                  <span className="text-xs font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                    第 1 - 13 課精準收錄
                  </span>
                </div>

                {filteredVerbs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold">
                    沒有找到符合搜尋條件的動詞單字。
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-4 px-6">動詞原型</th>
                          <th className="py-4 px-6">現在口語 (아/어/해요)</th>
                          <th className="py-4 px-6">過去式</th>
                          <th className="py-4 px-6">中文解釋</th>
                          <th className="py-4 px-6">經典例句</th>
                          <th className="py-4 px-6 text-center">發音</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredVerbs.map((verb, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all font-semibold">
                            <td className="py-4 px-6">
                              <span className="text-base font-extrabold text-slate-800">{verb.korean}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-orange-600 font-bold">{verb.conjugation}</span>
                            </td>
                            <td className="py-4 px-6 text-slate-400 font-medium">
                              {verb.past}
                            </td>
                            <td className="py-4 px-6 text-slate-800 font-bold">
                              {verb.chinese}
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-500 font-medium max-w-xs truncate" title={verb.example}>
                              {verb.example}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <button 
                                onClick={() => playSound(verb.korean)}
                                className="bg-orange-50 hover:bg-orange-100 text-orange-600 p-2.5 rounded-full transition-all border border-orange-100"
                                title="播放發音"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}