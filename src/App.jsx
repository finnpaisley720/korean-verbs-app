import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  GraduationCap,
  Cloud,
  CloudLightning,
  RefreshCw,
  User,
  Trash2
} from 'lucide-react';

// 引入 Firebase SDK 用於雲端儲存
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- Firebase 初始化設定 ---
let app, auth, db, appId;
let isFirebaseAvailable = false;

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    isFirebaseAvailable = true;
  }
} catch (e) {
  console.error("Firebase 初始化失敗，將啟用本地 LocalStorage 備用方案", e);
}

// 主題分類 (一個單字可透過 topics 同時出現在多個主題)
const T = {
  가구: "主題：가구 家具",
  가족: "主題：가족 家人",
  값: "主題：값 價格",
  계절: "主題：계절 季節",
  고향: "主題：고향 故鄉",
  과일: "主題：과일 水果",
  교통: "主題：교통 交通",
  나라: "主題：나라 國家",
  기분: "主題：기분 心情",
  나이: "主題：나이 年齡",
  날씨: "主題：날씨 天氣",
  날짜: "主題：날짜 日期",
  몸: "主題：몸 身體",
  사진: "主題：사진 照片",
  생일: "主題：생일 生日",
  쇼핑: "主題：쇼핑 購物",
  식사: "主題：식사 用餐",
  여행: "主題：여행 旅行",
  영화: "主題：영화 電影",
  옷: "主題：옷 衣服",
  음식: "主題：음식 飲食",
  직업: "主題：직업 職業",
  집: "主題：집 家",
  취미: "主題：취미 興趣",
  학교: "主題：학교 學校"
};

// 精準提取自 Paisley 筆記的韓文單字資料 (type: 預設為動詞；adj 形容詞；noun 名詞無動詞變化)
const VERB_DATABASE = [
  { korean: "공부하다", conjugation: "공부해요", past: "공부했어요", chinese: "學習", example: "한국어를 공부해요. (學習韓語。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "만나다", conjugation: "만나요", past: "만났어요", chinese: "見面/遇見", example: "오늘 친구를 만나요. (今天和朋友見面。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "보다", topics: [T.영화], conjugation: "봐요", past: "봤어요", chinese: "看", example: "같이 영화를 봐요. (一起看電影。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "가다", conjugation: "가요", past: "갔어요", chinese: "去", example: "도서관에 가요. (去圖書館。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "오다", conjugation: "와요", past: "왔어요", chinese: "來", example: "학교에 일찍 와요. (很早來學校。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "먹다", topics: [T.식사, T.음식], conjugation: "먹어요", past: "먹었어요", chinese: "吃", example: "빵을 먹어요. (吃麵包。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "마시다", conjugation: "마셔요", past: "마셨어요", chinese: "喝", example: "커피를 마셔요. (喝咖啡。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "읽다", conjugation: "읽어요", past: "읽었어요", chinese: "閱讀/讀", example: "신문을 읽어요. (讀報紙。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "듣다", conjugation: "들어요", past: "들었어요", chinese: "聽", example: "음악을 들어요. (聽音樂。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "사다", topics: [T.쇼핑], conjugation: "사요", past: "샀어요", chinese: "買", example: "옷을 사요. (買衣服。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "청소하다", conjugation: "청소해요", past: "청소했어요", chinese: "打掃", example: "기숙사를 청소해요. (打掃宿舍。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "노래하다", topics: [T.취미], conjugation: "노래해요", past: "노래했어요", chinese: "唱歌", example: "노래를 해요. (唱歌。)", lesson: "L1-L2 自我介紹 & 日常生活 I" },
  { korean: "주다", topics: [T.생일], conjugation: "주요 / 주세요", past: "줬어요", chinese: "給", example: "콜라 한 병 주세요. (請給我一瓶可樂。)", lesson: "L3 購物" },
  { korean: "쉬다", conjugation: "쉬어요", past: "쉬었어요", chinese: "休息", example: "집에서 좀 쉬어요. (在休息一下。)", lesson: "L4 日常生活 II" },
  { korean: "일어나다", conjugation: "일어나요", past: "일어났어요", chinese: "起床", example: "여섯 시쯤 일어나요. (六點左右起床。)", lesson: "L4 日常生活 II" },
  { korean: "끝나다", conjugation: "끝나요", past: "끝났어요", chinese: "結束", example: "수업이 끝나요. (課結束了。)", lesson: "L4 日常生活 II" },
  { korean: "쓰다", topics: [T.음식], conjugation: "써요", past: "썼어요", chinese: "寫/使用/(味道)苦", example: "편지를 써요. (寫信。)", lesson: "L4 日常生活 II" },
  { korean: "일하다", topics: [T.직업], conjugation: "일해요", past: "일했어요", chinese: "工作", example: "회사에서 일해요. (在公司工作。)", lesson: "L4 日常生活 II" },
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
  { korean: "타다", topics: [T.교통], conjugation: "타요", past: "탔어요", chinese: "搭乘/騎", example: "지하철을 타고 가세요. (請搭地鐵去。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "갈아타다", topics: [T.교통], conjugation: "갈아타요", past: "갈아탔어요", chinese: "轉乘/換乘", example: "버스로 갈아타세요. (請轉乘公車。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "걸리다", conjugation: "걸려요", past: "걸렸어요", chinese: "花費(時間)", example: "30분 정도 걸려요. (大概花費30分鐘。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "걸어오다", conjugation: "걸어와요", past: "걸어왔어요", chinese: "走路過來", example: "가까워서 걸어와요. (很近所以走過來。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "전화하다", conjugation: "전화해요", past: "전화했어요", chinese: "打電話", example: "제가 나중에 다시 전화할게요. (我等一下再打電話。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "보내다", conjugation: "보내요", past: "보냈어요", chinese: "寄/傳送", example: "이메일을 보내요. (寄電子郵件。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "들어오다", conjugation: "들어와요", past: "들어왔어요", chinese: "進來/回家", example: "여섯 시쯤 들어올 거예요. (大約六點會進來。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "받다", topics: [T.생일], conjugation: "받아요", past: "받았어요", chinese: "接(電話)/收到", example: "전화 받으세요. (請接電話。)", lesson: "L10-L11 交通 & 電話" },
  { korean: "찍다", topics: [T.사진], conjugation: "찍어요", past: "찍었어요", chinese: "拍攝/照相", example: "사진을 찍으러 가요. (去拍照片。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "치다", conjugation: "쳐요", past: "쳤어요", chinese: "打(網球、球類)", example: "테니스를 쳐요. (打網球。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "등산하다", conjugation: "등산해요", past: "등산했어요", chinese: "爬山/登山", example: "등산하는 것을 좋아해요. (喜歡爬山。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "다니다", conjugation: "다녀요", past: "다녔어요", chinese: "通勤/就讀/上班", example: "회사에 다니세요. (在公司上班。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "살다", topics: [T.집], conjugation: "살아요", past: "살았어요", chinese: "居住", example: "우리 가족은 대전에 살아요. (我們家人住在대전。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "계시다", conjugation: "계세요", past: "계셨어요", chinese: "在 (있다的敬語)", example: "부모님은 고향에 계세요. (父母在故鄉。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "주무시다", conjugation: "주무세요", past: "주무셨어요", chinese: "睡覺 (자다的敬語)", example: "할머니가 방에서 주무세요. (奶奶在房間睡覺。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "드시다", topics: [T.식사], conjugation: "드세요", past: "드셨어요", chinese: "吃/喝 (먹다/마시다的敬語)", example: "많이 드세요. (請多吃一點。)", lesson: "L12-L13 興趣 & 家人敬語" },
  { korean: "돌아가시다", conjugation: "돌아가세요", past: "돌아가셨어요", chinese: "去世 (죽다的敬語)", example: "할아버지는 3년 전에 돌아가셨어요. (爺爺三年前過世了。)", lesson: "L12-L13 興趣 & 家人敬語" },

  // 主題：가구 家具
  { korean: "가구", type: "noun", chinese: "家具", example: "새 가구를 샀어요. (買了新家具。)", lesson: T.가구 },
  { korean: "책상", type: "noun", chinese: "書桌", example: "책상 위에 책이 있어요. (書桌上有書。)", lesson: T.가구 },
  { korean: "의자", type: "noun", chinese: "椅子", example: "의자에 앉으세요. (請坐在椅子上。)", lesson: T.가구 },
  { korean: "침대", type: "noun", chinese: "床", example: "침대에서 자요. (在床上睡覺。)", lesson: T.가구 },
  { korean: "옷장", type: "noun", chinese: "衣櫃", example: "옷장에 옷이 많아요. (衣櫃裡衣服很多。)", lesson: T.가구 },
  { korean: "책장", type: "noun", chinese: "書櫃", example: "책장에 책을 넣어요. (把書放進書櫃。)", lesson: T.가구 },

  // 主題：가족 家人
  { korean: "가족", type: "noun", chinese: "家人", example: "우리 가족은 네 명이에요. (我們家有四個人。)", lesson: T.가족 },
  { korean: "부모", type: "noun", chinese: "父母", example: "부모님은 고향에 계세요. (父母在故鄉。)", lesson: T.가족 },
  { korean: "아버지", type: "noun", chinese: "爸爸", example: "아버지는 회사원이세요. (爸爸是上班族。)", lesson: T.가족 },
  { korean: "어머니", type: "noun", chinese: "媽媽", example: "어머니는 요리를 잘하세요. (媽媽很會做菜。)", lesson: T.가족 },
  { korean: "형", type: "noun", chinese: "哥哥 (男生稱呼)", example: "형은 회사에 다녀요. (哥哥在公司上班。)", lesson: T.가족 },
  { korean: "오빠", type: "noun", chinese: "哥哥 (女生稱呼)", example: "오빠는 대학생이에요. (哥哥是大學生。)", lesson: T.가족 },
  { korean: "누나", type: "noun", chinese: "姐姐 (男生稱呼)", example: "누나는 은행원이에요. (姐姐是銀行行員。)", lesson: T.가족 },
  { korean: "언니", type: "noun", chinese: "姐姐 (女生稱呼)", example: "언니하고 쇼핑해요. (和姐姐去購物。)", lesson: T.가족 },
  { korean: "동생", type: "noun", chinese: "弟弟/妹妹", example: "동생은 고등학생이에요. (弟弟/妹妹是高中生。)", lesson: T.가족 },

  // 主題：값 價格
  { korean: "값", type: "noun", chinese: "價格/價錢", example: "값이 얼마예요? (價錢是多少？)", lesson: T.값 },
  { korean: "가격", type: "noun", chinese: "價格", example: "가격이 좀 비싸요. (價格有點貴。)", lesson: T.값 },
  { korean: "원", type: "noun", chinese: "韓元 (貨幣單位)", example: "이 사과는 천 원이에요. (這個蘋果一千韓元。)", lesson: T.값 },
  { korean: "얼마", type: "q", chinese: "多少 (錢)", example: "이거 얼마예요? (這個多少錢？)", lesson: T.값 },
  { korean: "싸다", type: "adj", conjugation: "싸요", past: "쌌어요", chinese: "便宜的", example: "이 가게는 사과가 싸요. (這家店的蘋果很便宜。)", lesson: T.값, topics: [T.쇼핑] },
  { korean: "비싸다", type: "adj", conjugation: "비싸요", past: "비쌌어요", chinese: "昂貴的", example: "이 모자는 너무 비싸요. (這頂帽子太貴了。)", lesson: T.값, topics: [T.쇼핑] },
  { korean: "깎다", conjugation: "깎아요", past: "깎았어요", chinese: "殺價/打折", example: "좀 깎아 주세요. (請算便宜一點。)", lesson: T.값, topics: [T.쇼핑] },

  // 主題：계절 季節
  { korean: "계절", type: "noun", chinese: "季節", example: "어느 계절을 좋아해요? (你喜歡哪個季節？)", lesson: T.계절 },
  { korean: "봄", type: "noun", chinese: "春", example: "봄에 꽃이 많아요. (春天花很多。)", lesson: T.계절 },
  { korean: "여름", type: "noun", chinese: "夏", example: "여름에 수영해요. (夏天游泳。)", lesson: T.계절 },
  { korean: "가을", type: "noun", chinese: "秋", example: "가을 날씨가 좋아요. (秋天天氣很好。)", lesson: T.계절 },
  { korean: "겨울", type: "noun", chinese: "冬", example: "겨울은 추워요. (冬天很冷。)", lesson: T.계절 },

  // 主題：고향 故鄉
  { korean: "고향", type: "noun", chinese: "故鄉", example: "고향이 어디예요? (你的故鄉是哪裡？)", lesson: T.고향 },
  { korean: "태어나다", conjugation: "태어나요", past: "태어났어요", chinese: "出生", example: "저는 타이베이에서 태어났어요. (我在台北出生。)", lesson: T.고향, topics: [T.생일] },
  { korean: "어디", type: "q", chinese: "哪裡", example: "집이 어디예요? (你家在哪裡？)", lesson: T.고향 },

  // 主題：과일 水果
  { korean: "과일", type: "noun", chinese: "水果", example: "과일을 좋아해요. (喜歡水果。)", lesson: T.과일 },
  { korean: "사과", type: "noun", chinese: "蘋果", example: "사과가 얼마예요? (蘋果多少錢？)", lesson: T.과일 },
  { korean: "바나나", type: "noun", chinese: "香蕉", example: "아침에 바나나를 먹어요. (早上吃香蕉。)", lesson: T.과일 },
  { korean: "수박", type: "noun", chinese: "西瓜", example: "여름에 수박을 먹어요. (夏天吃西瓜。)", lesson: T.과일 },
  { korean: "포도", type: "noun", chinese: "葡萄", example: "포도를 먹어요. (吃葡萄。)", lesson: T.과일 },
  { korean: "딸기", type: "noun", chinese: "草莓", example: "딸기가 달아요. (草莓很甜。)", lesson: T.과일 },
  { korean: "배", type: "noun", chinese: "梨 / 肚子", example: "배가 달아요. (梨子很甜。) / 배가 아파요. (肚子痛。)", lesson: T.과일, topics: [T.몸] },
  { korean: "토마토", type: "noun", chinese: "番茄", example: "토마토 주스를 마셔요. (喝番茄汁。)", lesson: T.과일 },

  // 主題：교통 交通
  { korean: "교통", type: "noun", chinese: "交通", example: "서울은 교통이 편해요. (首爾交通很方便。)", lesson: T.교통 },
  { korean: "버스", type: "noun", chinese: "公車", example: "버스를 타고 학교에 가요. (搭公車去學校。)", lesson: T.교통 },
  { korean: "지하철", type: "noun", chinese: "地鐵", example: "지하철을 타고 가세요. (請搭地鐵去。)", lesson: T.교통 },
  { korean: "자동차", type: "noun", chinese: "汽車", example: "아버지는 자동차로 출근해요. (爸爸開車上班。)", lesson: T.교통 },
  { korean: "택시", type: "noun", chinese: "計程車", example: "택시를 타요. (搭計程車。)", lesson: T.교통 },
  { korean: "기차", type: "noun", chinese: "火車", example: "기차로 부산에 가요. (搭火車去釜山。)", lesson: T.교통 },
  { korean: "비행기", type: "noun", chinese: "飛機", example: "비행기를 타고 일본에 가요. (搭飛機去日本。)", lesson: T.교통 },
  { korean: "내리다", conjugation: "내려요", past: "내렸어요", chinese: "下(車)", example: "다음 역에서 내리세요. (請在下一站下車。)", lesson: T.교통 },

  // 主題：나라 國家
  { korean: "나라", type: "noun", chinese: "國家", example: "어느 나라 사람이에요? (你是哪國人？)", lesson: T.나라 },
  { korean: "한국", type: "noun", chinese: "韓國", example: "한국 사람이에요. (是韓國人。)", lesson: T.나라 },
  { korean: "중국", type: "noun", chinese: "中國", example: "중국에서 왔어요. (從中國來的。)", lesson: T.나라 },
  { korean: "일본", type: "noun", chinese: "日本", example: "일본 음식을 좋아해요. (喜歡日本料理。)", lesson: T.나라 },
  { korean: "프랑스", type: "noun", chinese: "法國", example: "프랑스에 여행 가요. (去法國旅行。)", lesson: T.나라 },
  { korean: "미국", type: "noun", chinese: "美國", example: "미국 친구가 있어요. (有美國朋友。)", lesson: T.나라 },
  { korean: "사람", type: "noun", chinese: "人", example: "저는 대만 사람이에요. (我是台灣人。)", lesson: T.나라 },

  // 主題：기분 心情
  { korean: "기분", type: "noun", chinese: "心情", example: "오늘 기분이 어때요? (今天心情怎麼樣？)", lesson: T.기분 },
  { korean: "좋다", type: "adj", conjugation: "좋아요", past: "좋았어요", chinese: "好", example: "오늘 기분이 좋아요. (今天心情很好。)", lesson: T.기분 },
  { korean: "나쁘다", type: "adj", conjugation: "나빠요", past: "나빴어요", chinese: "壞/不好", example: "기분이 좀 나빠요. (心情有點不好。)", lesson: T.기분 },
  { korean: "기쁘다", type: "adj", conjugation: "기뻐요", past: "기뻤어요", chinese: "高興", example: "선물을 받아서 기뻐요. (收到禮物很高興。)", lesson: T.기분 },
  { korean: "슬프다", type: "adj", conjugation: "슬퍼요", past: "슬펐어요", chinese: "悲傷", example: "그 영화는 너무 슬퍼요. (那部電影太悲傷了。)", lesson: T.기분, topics: [T.영화] },
  { korean: "즐겁다", type: "adj", conjugation: "즐거워요", past: "즐거웠어요", chinese: "愉快", example: "여행이 정말 즐거웠어요. (旅行真的很愉快。)", lesson: T.기분 },
  { korean: "행복하다", type: "adj", conjugation: "행복해요", past: "행복했어요", chinese: "幸福", example: "가족과 함께 있어서 행복해요. (和家人在一起很幸福。)", lesson: T.기분 },
  { korean: "화가 나다", conjugation: "화가 나요", past: "화가 났어요", chinese: "生氣", example: "친구가 늦게 와서 화가 났어요. (朋友遲到所以生氣了。)", lesson: T.기분 },
  { korean: "아프다", type: "adj", conjugation: "아파요", past: "아팠어요", chinese: "痛/生病", example: "머리가 아파요. (頭痛。)", lesson: T.기분, topics: [T.몸] },

  // 主題：나이 年齡
  { korean: "나이", type: "noun", chinese: "年齡", example: "나이가 어떻게 되세요? (請問您幾歲？)", lesson: T.나이 },
  { korean: "살", type: "noun", chinese: "歲", example: "몇 살이에요? (你幾歲？)", lesson: T.나이 },
  { korean: "열", type: "noun", chinese: "十 (固有數字)", example: "동생은 열 살이에요. (弟弟十歲。)", lesson: T.나이 },
  { korean: "스물", type: "noun", chinese: "二十 (固有數字)", example: "저는 스물 살이에요. (我二十歲。)", lesson: T.나이 },
  { korean: "스물한 살", type: "noun", chinese: "二十一歲", example: "저는 스물한 살이에요. (我二十一歲。)", lesson: T.나이 },
  { korean: "스물세 살", type: "noun", chinese: "二十三歲", example: "언니는 스물세 살이에요. (姐姐二十三歲。)", lesson: T.나이 },
  { korean: "서른", type: "noun", chinese: "三十 (固有數字)", example: "형은 서른 살이에요. (哥哥三十歲。)", lesson: T.나이 },
  { korean: "마흔", type: "noun", chinese: "四十 (固有數字)", example: "선생님은 마흔 살이에요. (老師四十歲。)", lesson: T.나이 },
  { korean: "쉰", type: "noun", chinese: "五十 (固有數字)", example: "아버지는 쉰 살이세요. (爸爸五十歲。)", lesson: T.나이 },

  // 主題：날씨 天氣
  { korean: "날씨", type: "noun", chinese: "天氣", example: "오늘 날씨가 어때요? (今天天氣怎麼樣？)", lesson: T.날씨 },
  { korean: "덥다", type: "adj", conjugation: "더워요", past: "더웠어요", chinese: "熱", example: "여름은 너무 더워요. (夏天太熱了。)", lesson: T.날씨 },
  { korean: "춥다", type: "adj", conjugation: "추워요", past: "추웠어요", chinese: "冷", example: "겨울은 추워요. (冬天很冷。)", lesson: T.날씨 },
  { korean: "따뜻하다", type: "adj", conjugation: "따뜻해요", past: "따뜻했어요", chinese: "溫暖", example: "봄 날씨가 따뜻해요. (春天天氣很溫暖。)", lesson: T.날씨 },
  { korean: "시원하다", type: "adj", conjugation: "시원해요", past: "시원했어요", chinese: "涼爽", example: "가을은 시원해요. (秋天很涼爽。)", lesson: T.날씨 },
  { korean: "맑다", type: "adj", conjugation: "맑아요", past: "맑았어요", chinese: "晴朗", example: "오늘은 날씨가 맑아요. (今天天氣晴朗。)", lesson: T.날씨 },
  { korean: "흐리다", type: "adj", conjugation: "흐려요", past: "흐렸어요", chinese: "陰天", example: "하늘이 흐려요. (天空陰陰的。)", lesson: T.날씨 },
  { korean: "비가 오다", conjugation: "비가 와요", past: "비가 왔어요", chinese: "下雨", example: "밖에 비가 와요. (外面在下雨。)", lesson: T.날씨 },
  { korean: "눈이 오다", conjugation: "눈이 와요", past: "눈이 왔어요", chinese: "下雪", example: "겨울에 눈이 와요. (冬天會下雪。)", lesson: T.날씨 },
  { korean: "바람이 불다", conjugation: "바람이 불어요", past: "바람이 불었어요", chinese: "颳風", example: "오늘은 바람이 많이 불어요. (今天風很大。)", lesson: T.날씨 },

  // 主題：날짜 日期
  { korean: "날짜", type: "noun", chinese: "日期", example: "오늘 날짜가 며칠이에요? (今天是幾號？)", lesson: T.날짜 },
  { korean: "달력", type: "noun", chinese: "月曆", example: "달력에 약속을 써요. (把約會寫在月曆上。)", lesson: T.날짜 },
  { korean: "몇 월 며칠", type: "q", chinese: "幾月幾號", example: "생일이 몇 월 며칠이에요? (生日是幾月幾號？)", lesson: T.날짜, topics: [T.생일] },
  { korean: "언제", type: "q", chinese: "什麼時候", example: "생일이 언제예요? (生日是什麼時候？)", lesson: T.날짜, topics: [T.생일] },
  { korean: "날", type: "noun", chinese: "日子/天", example: "오늘은 좋은 날이에요. (今天是好日子。)", lesson: T.날짜 },
  { korean: "어제", type: "noun", chinese: "昨天", example: "어제 친구를 만났어요. (昨天見了朋友。)", lesson: T.날짜 },
  { korean: "오늘", type: "noun", chinese: "今天", example: "오늘은 월요일이에요. (今天是星期一。)", lesson: T.날짜 },
  { korean: "내일", type: "noun", chinese: "明天", example: "내일 만나요. (明天見。)", lesson: T.날짜 },
  { korean: "시간", type: "noun", chinese: "時間", example: "지금 시간 있어요? (現在有時間嗎？)", lesson: T.날짜 },
  { korean: "약속", type: "noun", chinese: "約會", example: "토요일에 약속이 있어요. (星期六有約。)", lesson: T.날짜 },
  { korean: "월요일", type: "noun", chinese: "星期一", example: "월요일에 수업이 있어요. (星期一有課。)", lesson: T.날짜 },
  { korean: "화요일", type: "noun", chinese: "星期二", example: "화요일에 친구를 만나요. (星期二和朋友見面。)", lesson: T.날짜 },
  { korean: "수요일", type: "noun", chinese: "星期三", example: "수요일에 운동해요. (星期三運動。)", lesson: T.날짜 },
  { korean: "목요일", type: "noun", chinese: "星期四", example: "목요일에 한국어를 공부해요. (星期四學韓文。)", lesson: T.날짜 },
  { korean: "금요일", type: "noun", chinese: "星期五", example: "금요일에 영화를 봐요. (星期五看電影。)", lesson: T.날짜 },
  { korean: "토요일", type: "noun", chinese: "星期六", example: "토요일에 약속이 있어요. (星期六有約。)", lesson: T.날짜 },
  { korean: "일요일", type: "noun", chinese: "星期日", example: "일요일에 쉬어요. (星期日休息。)", lesson: T.날짜 },
  { korean: "주말", type: "noun", chinese: "週末", example: "주말에 뭐 해요? (週末做什麼？)", lesson: T.날짜 },
  { korean: "휴일", type: "noun", chinese: "假日", example: "휴일에 집에서 쉬어요. (假日在家休息。)", lesson: T.날짜 },

  // 主題：몸 身體
  { korean: "몸", type: "noun", chinese: "身體", example: "몸이 좀 안 좋아요. (身體有點不舒服。)", lesson: T.몸 },
  { korean: "건강", type: "noun", chinese: "健康", example: "건강이 제일 중요해요. (健康最重要。)", lesson: T.몸 },
  { korean: "얼굴", type: "noun", chinese: "臉", example: "얼굴이 작아요. (臉很小。)", lesson: T.몸 },
  { korean: "눈", type: "noun", chinese: "眼睛", example: "눈이 커요. (眼睛很大。)", lesson: T.몸 },
  { korean: "코", type: "noun", chinese: "鼻子", example: "코가 높아요. (鼻子很挺。)", lesson: T.몸 },
  { korean: "입", type: "noun", chinese: "嘴巴", example: "입이 작아요. (嘴巴很小。)", lesson: T.몸 },
  { korean: "귀", type: "noun", chinese: "耳朵", example: "귀가 아파요. (耳朵痛。)", lesson: T.몸 },
  { korean: "머리", type: "noun", chinese: "頭/頭髮", example: "머리가 아파요. (頭痛。)", lesson: T.몸 },
  { korean: "가슴", type: "noun", chinese: "胸", example: "가슴이 아파요. (胸口痛。)", lesson: T.몸 },
  { korean: "허리", type: "noun", chinese: "腰", example: "허리가 아파요. (腰痛。)", lesson: T.몸 },
  { korean: "팔", type: "noun", chinese: "手臂", example: "팔이 길어요. (手臂很長。)", lesson: T.몸 },
  { korean: "다리", type: "noun", chinese: "腿", example: "많이 걸어서 다리가 아파요. (走太多路腿很痠。)", lesson: T.몸 },

  // 主題：사진 照片
  { korean: "사진", type: "noun", chinese: "照片", example: "사진을 찍어요. (拍照片。)", lesson: T.사진 },
  { korean: "카메라", type: "noun", chinese: "相機", example: "새 카메라를 샀어요. (買了新相機。)", lesson: T.사진, topics: [T.여행] },
  { korean: "사진기", type: "noun", chinese: "相機 (카메라的另一說法)", example: "사진기로 사진을 찍어요. (用相機拍照。)", lesson: T.사진 },

  // 主題：생일 生日
  { korean: "생일", type: "noun", chinese: "生日", example: "생일 축하해요! (生日快樂！)", lesson: T.생일 },
  { korean: "선물", type: "noun", chinese: "禮物", example: "생일 선물을 받았어요. (收到了生日禮物。)", lesson: T.생일 },
  { korean: "케이크", type: "noun", chinese: "蛋糕", example: "생일 케이크를 사요. (買生日蛋糕。)", lesson: T.생일 },
  { korean: "꽃", type: "noun", chinese: "花", example: "꽃 한 송이 주세요. (請給我一朵花。)", lesson: T.생일 },

  // 主題：쇼핑 購物
  { korean: "쇼핑", type: "noun", chinese: "購物", example: "주말에 쇼핑해요. (週末去購物。)", lesson: T.쇼핑 },
  { korean: "가게", type: "noun", chinese: "店鋪", example: "가게에서 옷을 사요. (在店裡買衣服。)", lesson: T.쇼핑 },
  { korean: "시장", type: "noun", chinese: "市場", example: "시장에서 과일을 사요. (在市場買水果。)", lesson: T.쇼핑 },
  { korean: "백화점", type: "noun", chinese: "百貨公司", example: "백화점에서 옷을 샀어요. (在百貨公司買了衣服。)", lesson: T.쇼핑 },
  { korean: "팔다", conjugation: "팔아요", past: "팔았어요", chinese: "賣", example: "이 가게에서 신발을 팔아요. (這家店有賣鞋子。)", lesson: T.쇼핑 },

  // 主題：식사 用餐
  { korean: "식사", type: "noun", chinese: "用餐", example: "식사하셨어요? (您用過餐了嗎？)", lesson: T.식사 },
  { korean: "아침", type: "noun", chinese: "早上/早餐", example: "아침을 먹었어요? (吃早餐了嗎？)", lesson: T.식사 },
  { korean: "점심", type: "noun", chinese: "中午/午餐", example: "같이 점심 먹어요. (一起吃午餐吧。)", lesson: T.식사 },
  { korean: "저녁", type: "noun", chinese: "晚上/晚餐", example: "저녁에 뭐 먹어요? (晚餐吃什麼？)", lesson: T.식사 },

  // 主題：여행 旅行
  { korean: "여행", type: "noun", chinese: "旅行", example: "여행을 좋아해요. (喜歡旅行。)", lesson: T.여행, topics: [T.취미] },
  { korean: "가방", type: "noun", chinese: "包包", example: "가방이 무거워요. (包包很重。)", lesson: T.여행 },
  { korean: "여권", type: "noun", chinese: "護照", example: "여권을 꼭 가져가세요. (請一定要帶護照。)", lesson: T.여행 },
  { korean: "출발하다", conjugation: "출발해요", past: "출발했어요", chinese: "出發", example: "아홉 시에 출발해요. (九點出發。)", lesson: T.여행 },
  { korean: "도착하다", conjugation: "도착해요", past: "도착했어요", chinese: "抵達", example: "서울에 도착했어요. (抵達首爾了。)", lesson: T.여행 },
  { korean: "다녀오다", conjugation: "다녀와요", past: "다녀왔어요", chinese: "去一趟回來", example: "제주도에 다녀왔어요. (去了一趟濟州島回來。)", lesson: T.여행 },

  // 主題：영화 電影
  { korean: "영화", type: "noun", chinese: "電影", example: "같이 영화를 봐요. (一起看電影吧。)", lesson: T.영화, topics: [T.취미] },
  { korean: "영화관", type: "noun", chinese: "電影院", example: "영화관에서 만나요. (在電影院見。)", lesson: T.영화 },
  { korean: "극장", type: "noun", chinese: "劇場/電影院", example: "극장 앞에서 기다려요. (在電影院前面等。)", lesson: T.영화 },
  { korean: "재미있다", type: "adj", conjugation: "재미있어요", past: "재미있었어요", chinese: "有趣", example: "이 영화는 재미있어요. (這部電影很有趣。)", lesson: T.영화 },
  { korean: "재미없다", type: "adj", conjugation: "재미없어요", past: "재미없었어요", chinese: "無趣", example: "그 영화는 재미없었어요. (那部電影很無聊。)", lesson: T.영화 },

  // 主題：옷 衣服
  { korean: "옷", type: "noun", chinese: "衣服", example: "새 옷을 입어요. (穿新衣服。)", lesson: T.옷 },
  { korean: "바지", type: "noun", chinese: "褲子", example: "바지가 좀 커요. (褲子有點大。)", lesson: T.옷 },
  { korean: "치마", type: "noun", chinese: "裙子", example: "치마가 예뻐요. (裙子很漂亮。)", lesson: T.옷 },
  { korean: "양복", type: "noun", chinese: "西裝", example: "아버지는 양복을 입으세요. (爸爸穿西裝。)", lesson: T.옷 },
  { korean: "신발", type: "noun", chinese: "鞋子", example: "신발 가게에 가요. (去鞋店。)", lesson: T.옷, topics: [T.쇼핑] },
  { korean: "모자", type: "noun", chinese: "帽子", example: "모자를 써요. (戴帽子。)", lesson: T.옷, topics: [T.쇼핑] },
  { korean: "안경", type: "noun", chinese: "眼鏡", example: "안경을 써요. (戴眼鏡。)", lesson: T.옷, topics: [T.쇼핑] },
  { korean: "입다", conjugation: "입어요", past: "입었어요", chinese: "穿", example: "오늘 치마를 입어요. (今天穿裙子。)", lesson: T.옷 },
  { korean: "벗다", conjugation: "벗어요", past: "벗었어요", chinese: "脫", example: "여기서 신발을 벗으세요. (請在這裡脫鞋。)", lesson: T.옷 },
  { korean: "예쁘다", type: "adj", conjugation: "예뻐요", past: "예뻤어요", chinese: "漂亮", example: "그 치마가 예뻐요. (那件裙子很漂亮。)", lesson: T.옷 },
  { korean: "멋있다", type: "adj", conjugation: "멋있어요", past: "멋있었어요", chinese: "帥氣/好看", example: "양복이 멋있어요. (西裝很帥氣。)", lesson: T.옷 },
  { korean: "어울리다", conjugation: "어울려요", past: "어울렸어요", chinese: "適合/相配", example: "이 옷이 잘 어울려요. (這件衣服很適合你。)", lesson: T.옷 },
  { korean: "잘 맞다", conjugation: "잘 맞아요", past: "잘 맞았어요", chinese: "合身", example: "바지가 잘 맞아요. (褲子很合身。)", lesson: T.옷 },

  // 主題：음식 飲食
  { korean: "음식", type: "noun", chinese: "飲食/食物", example: "한국 음식을 좋아해요. (喜歡韓國料理。)", lesson: T.음식 },
  { korean: "불고기", type: "noun", chinese: "烤肉", example: "불고기가 맛있어요. (烤肉很好吃。)", lesson: T.음식 },
  { korean: "김치", type: "noun", chinese: "泡菜", example: "김치가 좀 매워요. (泡菜有點辣。)", lesson: T.음식 },
  { korean: "비빔밥", type: "noun", chinese: "拌飯", example: "비빔밥 하나 주세요. (請給我一份拌飯。)", lesson: T.음식 },
  { korean: "냉면", type: "noun", chinese: "冷麵", example: "여름에 냉면을 먹어요. (夏天吃冷麵。)", lesson: T.음식 },
  { korean: "맛있다", type: "adj", conjugation: "맛있어요", past: "맛있었어요", chinese: "好吃", example: "불고기가 정말 맛있어요. (烤肉真好吃。)", lesson: T.음식 },
  { korean: "맛없다", type: "adj", conjugation: "맛없어요", past: "맛없었어요", chinese: "不好吃", example: "이 냉면은 맛없어요. (這碗冷麵不好吃。)", lesson: T.음식 },
  { korean: "맛", type: "noun", chinese: "味道", example: "맛이 어때요? (味道怎麼樣？)", lesson: T.음식 },
  { korean: "달다", type: "adj", conjugation: "달아요", past: "달았어요", chinese: "甜", example: "케이크가 너무 달아요. (蛋糕太甜了。)", lesson: T.음식 },
  { korean: "짜다", type: "adj", conjugation: "짜요", past: "짰어요", chinese: "鹹", example: "국이 좀 짜요. (湯有點鹹。)", lesson: T.음식 },
  { korean: "맵다", type: "adj", conjugation: "매워요", past: "매웠어요", chinese: "辣", example: "김치가 매워요. (泡菜很辣。)", lesson: T.음식 },
  { korean: "시다", type: "adj", conjugation: "셔요", past: "셨어요", chinese: "酸", example: "레몬이 너무 셔요. (檸檬太酸了。)", lesson: T.음식 },

  // 主題：직업 職業
  { korean: "직업", type: "noun", chinese: "職業", example: "직업이 뭐예요? (你的職業是什麼？)", lesson: T.직업 },
  { korean: "선생님", type: "noun", chinese: "老師", example: "선생님, 안녕하세요? (老師好！)", lesson: T.직업, topics: [T.학교] },
  { korean: "회사원", type: "noun", chinese: "上班族", example: "아버지는 회사원이에요. (爸爸是上班族。)", lesson: T.직업 },
  { korean: "의사", type: "noun", chinese: "醫生", example: "형은 의사예요. (哥哥是醫生。)", lesson: T.직업 },
  { korean: "간호사", type: "noun", chinese: "護理師", example: "누나는 병원에서 일하는 간호사예요. (姐姐是在醫院工作的護理師。)", lesson: T.직업 },
  { korean: "요리사", type: "noun", chinese: "廚師", example: "요리사가 음식을 만들어요. (廚師做菜。)", lesson: T.직업 },
  { korean: "은행원", type: "noun", chinese: "行員", example: "어머니는 은행원이세요. (媽媽是銀行行員。)", lesson: T.직업 },

  // 主題：집 家
  { korean: "집", type: "noun", chinese: "家/房子", example: "집에서 쉬어요. (在家休息。)", lesson: T.집 },
  { korean: "아파트", type: "noun", chinese: "公寓", example: "아파트에 살아요. (住在公寓。)", lesson: T.집 },
  { korean: "거실", type: "noun", chinese: "客廳", example: "거실에서 텔레비전을 봐요. (在客廳看電視。)", lesson: T.집 },
  { korean: "방", type: "noun", chinese: "房間", example: "제 방은 작아요. (我的房間很小。)", lesson: T.집 },
  { korean: "화장실", type: "noun", chinese: "廁所", example: "화장실이 어디예요? (廁所在哪裡？)", lesson: T.집 },
  { korean: "부엌", type: "noun", chinese: "廚房", example: "어머니가 부엌에서 요리하세요. (媽媽在廚房做菜。)", lesson: T.집 },
  { korean: "넓다", type: "adj", conjugation: "넓어요", past: "넓었어요", chinese: "寬敞", example: "거실이 넓어요. (客廳很寬敞。)", lesson: T.집 },
  { korean: "좁다", type: "adj", conjugation: "좁아요", past: "좁았어요", chinese: "狹窄", example: "방이 좀 좁아요. (房間有點窄。)", lesson: T.집 },

  // 主題：취미 興趣
  { korean: "취미", type: "noun", chinese: "興趣", example: "취미가 뭐예요? (你的興趣是什麼？)", lesson: T.취미 },
  { korean: "독서", type: "noun", chinese: "閱讀", example: "제 취미는 독서예요. (我的興趣是閱讀。)", lesson: T.취미 },
  { korean: "요리", type: "noun", chinese: "料理/做菜", example: "요리를 좋아해요. (喜歡做菜。)", lesson: T.취미 },
  { korean: "노래", type: "noun", chinese: "歌/唱歌", example: "노래를 잘해요. (很會唱歌。)", lesson: T.취미 },
  { korean: "운동", type: "noun", chinese: "運動", example: "무슨 운동을 좋아해요? (喜歡什麼運動？)", lesson: T.취미 },
  { korean: "수영", type: "noun", chinese: "游泳", example: "수영을 배워요. (學游泳。)", lesson: T.취미 },
  { korean: "농구", type: "noun", chinese: "籃球", example: "친구하고 농구를 해요. (和朋友打籃球。)", lesson: T.취미 },
  { korean: "축구", type: "noun", chinese: "足球", example: "주말에 축구를 해요. (週末踢足球。)", lesson: T.취미 },
  { korean: "야구", type: "noun", chinese: "棒球", example: "야구 경기를 봐요. (看棒球比賽。)", lesson: T.취미 },
  { korean: "테니스", type: "noun", chinese: "網球", example: "테니스를 쳐요. (打網球。)", lesson: T.취미 },
  { korean: "배드민턴", type: "noun", chinese: "羽毛球", example: "공원에서 배드민턴을 쳐요. (在公園打羽毛球。)", lesson: T.취미 },
  { korean: "자주", type: "adv", chinese: "經常", example: "주말에 자주 등산해요. (週末經常爬山。)", lesson: T.취미 },
  { korean: "주로", type: "adv", chinese: "主要/通常", example: "주말에 주로 집에서 쉬어요. (週末通常在家休息。)", lesson: T.취미 },

  // 主題：학교 學校
  { korean: "학교", type: "noun", chinese: "學校", example: "학교에 가요. (去學校。)", lesson: T.학교 },
  { korean: "교실", type: "noun", chinese: "教室", example: "교실에 학생이 많아요. (教室裡學生很多。)", lesson: T.학교 },
  { korean: "수업", type: "noun", chinese: "上課/課程", example: "수업이 끝났어요. (下課了。)", lesson: T.학교 },
  { korean: "공부", type: "noun", chinese: "讀書/學習", example: "공부가 재미있어요. (讀書很有趣。)", lesson: T.학교 },
  { korean: "숙제", type: "noun", chinese: "作業", example: "숙제를 해요. (寫作業。)", lesson: T.학교 },
  { korean: "학생", type: "noun", chinese: "學生", example: "저는 학생이에요. (我是學生。)", lesson: T.학교 },
  { korean: "방학", type: "noun", chinese: "放假", example: "방학에 여행을 가요. (放假時去旅行。)", lesson: T.학교 },

  // 補充單字 (不在主題表內)
  { korean: "말하다", conjugation: "말해요", past: "말했어요", chinese: "說話", example: "천천히 말해 주세요. (請慢慢說。)", lesson: "補充單字" },
  { korean: "대답하다", conjugation: "대답해요", past: "대답했어요", chinese: "回答", example: "선생님 질문에 대답해요. (回答老師的問題。)", lesson: "補充單字" },
  { korean: "있다", conjugation: "있어요", past: "있었어요", chinese: "有/在", example: "시간이 있어요? (有時間嗎？)", lesson: "補充單字" },
  { korean: "없다", conjugation: "없어요", past: "없었어요", chinese: "沒有/不在", example: "오늘은 수업이 없어요. (今天沒有課。)", lesson: "補充單字" },
  { korean: "크다", type: "adj", conjugation: "커요", past: "컸어요", chinese: "大", example: "이 옷은 좀 커요. (這件衣服有點大。)", lesson: "補充單字", topics: [T.집] },
  { korean: "작다", type: "adj", conjugation: "작아요", past: "작았어요", chinese: "小", example: "신발이 너무 작아요. (鞋子太小了。)", lesson: "補充單字" },
  { korean: "친구", type: "noun", chinese: "朋友", example: "친구를 만나요. (和朋友見面。)", lesson: "補充單字" },
  { korean: "이름", type: "noun", chinese: "名字", example: "이름이 뭐예요? (你叫什麼名字？)", lesson: "補充單字" },
  { korean: "장소", type: "noun", chinese: "場所", example: "약속 장소가 어디예요? (約定的地點在哪？)", lesson: "補充單字" },
  { korean: "동물", type: "noun", chinese: "動物", example: "동물을 좋아해요. (喜歡動物。)", lesson: "補充單字" },
  { korean: "색깔", type: "noun", chinese: "顏色", example: "무슨 색깔을 좋아해요? (喜歡什麼顏色？)", lesson: "補充單字" }
];

const TYPE_LABELS = { verb: "動詞原型", adj: "形容詞原型", noun: "名詞", q: "疑問詞", adv: "副詞" };

const CATEGORIES = ["全部單字", ...Array.from(new Set([...VERB_DATABASE.map(v => v.lesson), ...Object.values(T)]))];

export default function App() {
  // 基礎導覽狀態
  const [currentTab, setCurrentTab] = useState('study'); // 'study' | 'quiz' | 'list'
  const [selectedCategory, setSelectedCategory] = useState('全部單字');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 雲端帳號及同步狀態
  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('offline'); // 'syncing' | 'saved' | 'error' | 'offline'
  
  // 單字卡狀態
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userStatus, setUserStatus] = useState({}); // { [korean]: 'learned' | 'review' }
  // 最新進度的參照：牌組只在切換篩選條件時重建，標記單字時不重建，避免跳回第一張
  const userStatusRef = useRef({});
  useEffect(() => {
    userStatusRef.current = userStatus;
  }, [userStatus]);
  const [shuffledDeck, setShuffledDeck] = useState(VERB_DATABASE);
  const [isShuffled, setIsShuffled] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'hideLearned' | 'review' | 'new'
  const [deckVersion, setDeckVersion] = useState(0); // 雲端進度載入後重建一次牌組

  // 防呆對話框狀態
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // 測驗狀態
  const [quizList, setQuizList] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizType, setQuizType] = useState('ko_zh'); // 'ko_zh' | 'zh_ko'

  // --- (1) 雲端身份登入 & 初始化監聽器 ---
  useEffect(() => {
    if (!isFirebaseAvailable) {
      // 備用方案：如果不是在特定雲端環境下，使用 localStorage 暫存進度
      setSyncStatus('saved');
      const localData = localStorage.getItem('korean_verbs_userStatus');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          userStatusRef.current = parsed;
          setUserStatus(parsed);
          setDeckVersion(v => v + 1);
        } catch (e) {
          console.error(e);
        }
      }
      return;
    }

    const initAuth = async () => {
      try {
        setSyncStatus('syncing');
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("雲端自動登入失敗:", e);
        setSyncStatus('error');
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // --- (2) 監聽並加載雲端資料 ---
  const cloudLoadedRef = useRef(false);
  useEffect(() => {
    if (!isFirebaseAvailable) return;
    if (!user) return;

    setSyncStatus('syncing');
    const statusDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'progress', 'userStatus');
    
    const unsubscribe = onSnapshot(statusDocRef, (docSnap) => {
      const statuses = docSnap.exists() ? (docSnap.data().statuses || {}) : {};
      const isFirstLoad = !cloudLoadedRef.current;
      cloudLoadedRef.current = true;
      userStatusRef.current = statuses;
      setUserStatus(statuses);
      if (isFirstLoad) setDeckVersion(v => v + 1);
      setSyncStatus('saved');
    }, (error) => {
      console.error("載入雲端儲存失敗:", error);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, [user]);

  // 單字清單篩選
  const filteredVerbs = useMemo(() => {
    return VERB_DATABASE.filter(verb => {
      const matchCategory = selectedCategory === '全部單字' || verb.lesson === selectedCategory || (verb.topics || []).includes(selectedCategory);
      const matchSearch = verb.korean.includes(searchQuery) || 
                          verb.chinese.includes(searchQuery) ||
                          (verb.conjugation || '').includes(searchQuery);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // 依學習狀態篩選 (全部 / 隱藏已熟記 / 只看待複習 / 只看未學過)
  const matchStatus = (verb, statuses) => {
    const s = statuses[verb.korean];
    if (statusFilter === 'hideLearned') return s !== 'learned';
    if (statusFilter === 'review') return s === 'review';
    if (statusFilter === 'new') return !s;
    return true;
  };

  // 當分類或篩選變更時，自動校正索引
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    const deck = filteredVerbs.filter(v => matchStatus(v, userStatusRef.current));
    if (isShuffled) {
      setShuffledDeck([...deck].sort(() => Math.random() - 0.5));
    } else {
      setShuffledDeck(deck);
    }
  }, [selectedCategory, searchQuery, isShuffled, filteredVerbs, statusFilter, deckVersion]);

  // 語音播放
  const playSound = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      showToast("您的瀏覽器暫不支援自動語音朗讀。");
    }
  };

  // 自訂 Toast 訊息提示
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

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

  // --- (3) 更新標籤 & 雲端同步儲存 ---
  const saveWordStatus = async (korean, status) => {
    const updatedStatus = {
      ...userStatusRef.current,
      [korean]: status
    };
    userStatusRef.current = updatedStatus;
    
    // 即時樂觀更新 UI，防止網路延遲造成卡頓
    setUserStatus(updatedStatus);

    if (isFirebaseAvailable && user) {
      try {
        setSyncStatus('syncing');
        const statusDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'progress', 'userStatus');
        await setDoc(statusDocRef, { statuses: updatedStatus }, { merge: true });
        setSyncStatus('saved');
      } catch (e) {
        console.error("雲端存檔失敗:", e);
        setSyncStatus('error');
      }
    } else {
      // 離線本地存檔
      localStorage.setItem('korean_verbs_userStatus', JSON.stringify(updatedStatus));
      setSyncStatus('saved');
    }
  };

  const markWordStatus = (korean, status) => {
    saveWordStatus(korean, status);
    handleNext();
  };

  // --- (4) 一鍵重設進度 ---
  const resetAllProgress = async () => {
    setUserStatus({});
    setShowResetModal(false);
    
    if (isFirebaseAvailable && user) {
      try {
        setSyncStatus('syncing');
        const statusDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'progress', 'userStatus');
        await setDoc(statusDocRef, { statuses: {} });
        setSyncStatus('saved');
        showToast("已成功清空雲端儲存，可以重新挑戰囉！🦊");
      } catch (e) {
        console.error("清空失敗:", e);
        setSyncStatus('error');
      }
    } else {
      localStorage.removeItem('korean_verbs_userStatus');
      setSyncStatus('saved');
      showToast("本地進度已重新洗牌！🦊");
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // 隨堂測驗初始化
  const generateQuiz = () => {
    const pool = filteredVerbs.filter(v => matchStatus(v, userStatusRef.current));
    if (pool.length < 4) {
      const shuffledAll = [...VERB_DATABASE].sort(() => Math.random() - 0.5);
      setupQuizQuestions(shuffledAll.slice(0, 10));
    } else {
      const shuffledFiltered = [...pool].sort(() => Math.random() - 0.5);
      setupQuizQuestions(shuffledFiltered.slice(0, 10));
    }
  };

  const setupQuizQuestions = (selectedVerbs) => {
    const questions = selectedVerbs.map((target) => {
      const distractors = VERB_DATABASE
        .filter(v => v.korean !== target.korean)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [target, ...distractors].sort(() => Math.random() - 0.5);
      return { target, options };
    });
    setQuizList(questions);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
  };

  useEffect(() => {
    if (currentTab === 'quiz') {
      generateQuiz();
    }
  }, [currentTab, selectedCategory, statusFilter]);

  const handleQuizAnswer = (option) => {
    if (showAnswer) return;
    setSelectedAnswer(option);
    setShowAnswer(true);
    const target = quizList[quizIndex].target;
    if (option.korean === target.korean) {
      setScore(prev => prev + 1);
    } else if (userStatusRef.current[target.korean] !== 'review') {
      // 答錯自動加入待複習
      saveWordStatus(target.korean, 'review');
      showToast(`「${target.korean}」已加入待複習 📌`);
    }
    playSound(quizList[quizIndex].target.korean);
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setShowAnswer(false);
    setQuizIndex(prev => prev + 1);
  };

  const stats = useMemo(() => {
    const total = VERB_DATABASE.length;
    const mastered = Object.values(userStatus).filter(s => s === 'learned').length;
    const reviewing = Object.values(userStatus).filter(s => s === 'review').length;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, reviewing, percentage };
  }, [userStatus]);

  const activeCard = shuffledDeck[currentIndex];
  const listVerbs = filteredVerbs.filter(v => matchStatus(v, userStatus));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* 提示訊息 Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-xl border border-white/10 animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {toastMessage}
        </div>
      )}

      {/* 防呆安全確認彈窗 */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="bg-rose-50 p-3 rounded-2xl w-fit text-rose-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">確定要重設所有學習進度嗎？</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                這會將你目前在雲端與本地端儲存的所有「已學會」與「稍後複習」標籤全數歸零，此動作無法復原喔！
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                取消
              </button>
              <button 
                onClick={resetAllProgress}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all"
              >
                沒錯，重新開始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 頂部 Header */}
      <header className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm border border-white/30">
              <Sparkles className="w-6 h-6 text-yellow-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-wide">Finn's 韓文動詞單字卡 🦊</h1>
                {/* 雲端同步狀態標籤 */}
                {syncStatus === 'syncing' && (
                  <span className="bg-amber-400/20 text-yellow-100 text-[10px] px-2 py-0.5 rounded-full border border-amber-300/30 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> 同步中
                  </span>
                )}
                {syncStatus === 'saved' && (
                  <span className="bg-emerald-500/20 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <Cloud className="w-3 h-3" /> 已儲存
                  </span>
                )}
                {syncStatus === 'error' && (
                  <span className="bg-rose-500/20 text-rose-100 text-[10px] px-2 py-0.5 rounded-full border border-rose-400/30 flex items-center gap-1 animate-pulse">
                    <CloudLightning className="w-3 h-3" /> 連線問題
                  </span>
                )}
              </div>
              <p className="text-xs text-orange-50 font-medium">專為 Paisley 打造的 1-13 課精準動詞特訓</p>
            </div>
          </div>
          
          {/* 進度條 */}
          <div className="w-full md:w-72 bg-black/15 px-4 py-2.5 rounded-2xl backdrop-blur-sm border border-white/10 text-xs">
            <div className="flex justify-between mb-1.5 font-semibold text-orange-50">
              <span>掌握度: {stats.mastered}/{stats.total} 個</span>
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

      {/* 導覽功能區 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* 左側邊欄：控制面板 */}
          <div className="md:col-span-1 space-y-6">
            
            {/* 功能切換 */}
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
                🔍 全部單字清單
              </button>
            </div>

            {/* 分類與過濾 */}
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

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  學習狀態篩選
                </label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium text-slate-700"
                >
                  <option value="all">全部單字</option>
                  <option value="hideLearned">隱藏已熟記</option>
                  <option value="review">只看待複習</option>
                  <option value="new">只看未學過</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  關鍵字搜尋
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input 
                    type="text"
                    placeholder="搜尋韓文、解釋或語法..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
            </div>

            {/* 一鍵重置進度與使用者 ID */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-3">
              {user && (
                <div className="bg-slate-50 px-3 py-2 rounded-2xl flex items-center gap-2 text-[10px] text-slate-500 font-semibold border border-slate-100">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span className="truncate" title={user.uid}>
                    個人 ID: {user.uid}
                  </span>
                </div>
              )}
              
              <button 
                onClick={() => setShowResetModal(true)}
                className="w-full py-2.5 rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-500 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                重設所有標記進度
              </button>
            </div>

            {/* 學習悄悄話 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-3xl border border-orange-100">
              <h4 className="text-sm font-bold text-orange-800 flex items-center gap-1.5 mb-1.5">
                🦊 Finn 的學習悄悄話
              </h4>
              <p className="text-xs text-orange-700 leading-relaxed font-medium">
                現在有了雲端儲存，Paisley 隨手一滑就能幫你記錄下哪些字最難背囉！累積幾天後，點左側過濾看那些標記紅色的字，多練幾次就會徹底變成你大腦的直覺反應了！
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
                    <p className="text-slate-500 font-bold mb-2">哎呀！沒有找到符合條件的單字</p>
                    <p className="text-xs text-slate-400">可以調整左側的課堂範圍或清空搜尋字元再試試看！</p>
                  </div>
                ) : (
                  <>
                    {/* 3D 卡片 */}
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
                              [{TYPE_LABELS[activeCard.type || 'verb']}]
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
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full">
                              💡 點擊卡片看中文 & 口語口法
                            </span>
                          </div>
                        </div>

                        {/* 背面：翻譯與變化 */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-[32px] p-8 flex flex-col justify-between shadow-md">
                          
                          <div className="flex justify-between items-center border-b border-orange-100 pb-3">
                            <span className="text-xs font-bold text-orange-600 bg-white px-3 py-1 rounded-full border border-orange-100">
                              解釋與例句
                            </span>
                            <div className="flex gap-2">
                              {userStatus[activeCard.korean] === 'learned' && (
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-0.5 animate-pulse">
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

                          <div className="space-y-4 py-2">
                            <div className="text-center">
                              <p className="text-3xl font-black text-orange-900 tracking-wide">
                                {activeCard.chinese}
                              </p>
                            </div>

                            {activeCard.conjugation && (
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
                            )}

                            <div className="bg-white/80 p-3.5 rounded-2xl border border-orange-100 text-sm">
                              <p className="text-xs font-bold text-slate-400 mb-1">📝 課本經典例句：</p>
                              <p className="font-bold text-slate-800 leading-snug">{activeCard.example}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                playSound(activeCard.conjugation || activeCard.korean);
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

                    {/* 下方控制 */}
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

                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-8 rounded-2xl text-center space-y-3 border border-slate-200/50">
                      <p className="text-xs font-bold text-slate-400 block uppercase tracking-widest">
                        {quizType === 'ko_zh' ? '請選出最正確的中文意思' : '請選出相對應的韓文動詞'}
                      </p>
                      
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                        {quizType === 'ko_zh' ? quizList[quizIndex].target.korean : quizList[quizIndex].target.chinese}
                      </h2>
                    </div>

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
                          {quizList[quizIndex].target.conjugation && (
                            <>
                              現在口語：<strong>{quizList[quizIndex].target.conjugation}</strong> ｜ 過去式：<strong>{quizList[quizIndex].target.past}</strong>
                              <br />
                            </>
                          )}
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
                    <p className="text-xs text-slate-400 mt-0.5">顯示符合過濾條件的單字清單 (共 {listVerbs.length} 個)</p>
                  </div>
                  
                  <span className="text-xs font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                    第 1 - 13 課精準收錄
                  </span>
                </div>

                {listVerbs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold">
                    沒有找到符合搜尋條件的單字。
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-4 px-6">單字原型</th>
                          <th className="py-4 px-6">現在口語 (아/어/해요)</th>
                          <th className="py-4 px-6">過去式</th>
                          <th className="py-4 px-6">中文解釋</th>
                          <th className="py-4 px-6">學習進度</th>
                          <th className="py-4 px-6 text-center">發音</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {listVerbs.map((verb, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all font-semibold">
                            <td className="py-4 px-6">
                              <span className="text-base font-extrabold text-slate-800">{verb.korean}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-orange-600 font-bold">{verb.conjugation || '—'}</span>
                            </td>
                            <td className="py-4 px-6 text-slate-400 font-medium">
                              {verb.past || '—'}
                            </td>
                            <td className="py-4 px-6 text-slate-800 font-bold">
                              {verb.chinese}
                            </td>
                            <td className="py-4 px-6">
                              {userStatus[verb.korean] === 'learned' && (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                  已熟記
                                </span>
                              )}
                              {userStatus[verb.korean] === 'review' && (
                                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                                  待複習
                                </span>
                              )}
                              {!userStatus[verb.korean] && (
                                <span className="text-xs font-bold text-slate-400">
                                  未標記
                                </span>
                              )}
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