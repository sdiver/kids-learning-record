/**
 * Q版周公瑾 — 互动陪学助手
 * 用法：页面引入此文件后自动挂载，通过 ZhouYu.praise() / ZhouYu.encourage() / ZhouYu.greet() 触发
 */
(function() {
    const MESSAGES = {
        praise: [
            '妙哉！答得漂亮！',
            '此题不难，主公英明！',
            '连中三元，势如破竹！',
            '好！再接再厉！',
            '真棒！瑜为你喝彩！',
            '聪慧过人，孺子可教！',
        ],
        encourage: [
            '无妨，胜败乃兵家常事！',
            '再来一局，必能取胜！',
            '此题略有刁钻，不急！',
            '失之毫厘，继续加油！',
            '莫灰心，重整旗鼓！',
            '瑜当年也曾走过弯路。',
        ],
        greet: [
            '主公，今日可要操练？',
            '瑜在此候命，随时出发！',
            '学海无涯，一起加油！',
            '勤学似春起之苗，加油！',
        ],
        reading_correct: [
            '此字读得真准！',
            '字正腔圆，甚佳！',
            '朗朗上口，好！',
        ],
        reading_wrong: [
            '此字需多练习！',
            '不急，再读一遍！',
            '多读几遍，必能记住！',
        ],
    };

    const SVG = `
<svg width="90" height="110" viewBox="0 0 90 110" xmlns="http://www.w3.org/2000/svg">
  <!-- 身体 -->
  <ellipse cx="45" cy="88" rx="22" ry="18" fill="#3a5f8a"/>
  <!-- 战袍纹饰 -->
  <ellipse cx="45" cy="88" rx="13" ry="14" fill="#4a78b0" opacity="0.6"/>
  <!-- 腰带 -->
  <rect x="28" y="90" width="34" height="5" rx="2.5" fill="#d4a017"/>
  <!-- 头 -->
  <ellipse cx="45" cy="55" rx="24" ry="26" fill="#f5c9a0"/>
  <!-- 发冠底座 -->
  <rect x="33" y="29" width="24" height="8" rx="4" fill="#1a2e4a"/>
  <!-- 发冠顶 -->
  <polygon points="45,14 39,29 51,29" fill="#1a2e4a"/>
  <rect x="41" y="14" width="8" height="5" rx="2" fill="#d4a017"/>
  <!-- 耳 -->
  <ellipse cx="21" cy="55" rx="5" ry="7" fill="#f5c9a0"/>
  <ellipse cx="69" cy="55" rx="5" ry="7" fill="#f5c9a0"/>
  <!-- 眉 -->
  <path d="M33 46 Q38 43 43 46" stroke="#5a3a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M47 46 Q52 43 57 46" stroke="#5a3a1a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- 眼睛 -->
  <ellipse cx="38" cy="51" rx="5" ry="5.5" fill="white"/>
  <ellipse cx="52" cy="51" rx="5" ry="5.5" fill="white"/>
  <circle class="zy-pupil-l" cx="39" cy="52" r="3" fill="#2c1a0a"/>
  <circle class="zy-pupil-r" cx="53" cy="52" r="3" fill="#2c1a0a"/>
  <circle cx="40.5" cy="50.5" r="1" fill="white"/>
  <circle cx="54.5" cy="50.5" r="1" fill="white"/>
  <!-- 嘴 -->
  <path class="zy-mouth" d="M39 65 Q45 70 51 65" stroke="#c0785a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- 腮红 -->
  <ellipse cx="30" cy="62" rx="6" ry="4" fill="#f4a0a0" opacity="0.45"/>
  <ellipse cx="60" cy="62" rx="6" ry="4" fill="#f4a0a0" opacity="0.45"/>
  <!-- 羽扇 -->
  <ellipse cx="72" cy="78" rx="10" ry="16" fill="#e8f4e8" opacity="0.9" transform="rotate(-20 72 78)"/>
  <path d="M65 82 Q72 68 78 72" stroke="#9bc49b" stroke-width="1.5" fill="none"/>
  <path d="M63 78 Q70 66 76 70" stroke="#9bc49b" stroke-width="1.2" fill="none" opacity="0.7"/>
  <path d="M67 86 Q74 72 80 76" stroke="#9bc49b" stroke-width="1.2" fill="none" opacity="0.7"/>
  <line x1="70" y1="88" x2="72" y2="100" stroke="#8b6914" stroke-width="2.5" stroke-linecap="round"/>
  <!-- 手 -->
  <ellipse cx="67" cy="88" rx="6" ry="5" fill="#f5c9a0"/>
  <!-- 左臂 -->
  <path d="M28 85 Q18 90 16 100" stroke="#3a5f8a" stroke-width="8" stroke-linecap="round" fill="none"/>
  <ellipse cx="16" cy="101" rx="5" ry="4" fill="#f5c9a0"/>
</svg>`;

    // 创建DOM
    function mount() {
        if (document.getElementById('zy-widget')) return;

        const style = document.createElement('style');
        style.textContent = `
            #zy-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 6px;
                pointer-events: none;
                user-select: none;
            }
            #zy-bubble {
                background: white;
                border: 2.5px solid #667eea;
                border-radius: 18px 18px 4px 18px;
                padding: 10px 14px;
                font-size: 0.88rem;
                color: #333;
                max-width: 160px;
                line-height: 1.5;
                box-shadow: 0 4px 16px rgba(102,126,234,0.18);
                opacity: 0;
                transform: translateY(8px) scale(0.92);
                transition: opacity 0.25s ease, transform 0.25s ease;
                font-family: 'Microsoft YaHei', sans-serif;
                pointer-events: none;
            }
            #zy-bubble.show {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            #zy-char {
                width: 90px;
                height: 110px;
                cursor: pointer;
                pointer-events: all;
                animation: zy-float 3s ease-in-out infinite;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
                transition: transform 0.15s;
            }
            #zy-char:hover { transform: scale(1.05); }
            #zy-char.zy-happy {
                animation: zy-bounce 0.4s ease-in-out 2, zy-float 3s ease-in-out infinite 0.8s;
            }
            #zy-char.zy-sad {
                animation: zy-shake 0.5s ease-in-out, zy-float 3s ease-in-out infinite 0.5s;
            }
            @keyframes zy-float {
                0%,100% { transform: translateY(0); }
                50%      { transform: translateY(-8px); }
            }
            @keyframes zy-bounce {
                0%,100% { transform: translateY(0) scale(1); }
                40%     { transform: translateY(-14px) scale(1.08); }
                70%     { transform: translateY(-4px) scale(0.97); }
            }
            @keyframes zy-shake {
                0%,100% { transform: rotate(0deg); }
                20%     { transform: rotate(-6deg); }
                40%     { transform: rotate(6deg); }
                60%     { transform: rotate(-4deg); }
                80%     { transform: rotate(4deg); }
            }
            @keyframes zy-mouth-open {
                0%,100% { d: path("M39 65 Q45 70 51 65"); }
                50%     { d: path("M39 65 Q45 72 51 65"); }
            }
            @media (max-width: 480px) {
                #zy-widget { bottom: 12px; right: 10px; }
                #zy-char { width: 70px; height: 85px; }
                #zy-bubble { font-size: 0.8rem; max-width: 130px; }
            }
        `;
        document.head.appendChild(style);

        const widget = document.createElement('div');
        widget.id = 'zy-widget';
        widget.innerHTML = `
            <div id="zy-bubble"></div>
            <div id="zy-char" title="周公瑾">${SVG}</div>
        `;
        document.body.appendChild(widget);

        document.getElementById('zy-char').addEventListener('click', () => {
            ZhouYu.speak(pick(MESSAGES.greet));
        });
    }

    let bubbleTimer = null;

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function showBubble(text, duration = 3000) {
        const bubble = document.getElementById('zy-bubble');
        if (!bubble) return;
        clearTimeout(bubbleTimer);
        bubble.textContent = text;
        bubble.classList.add('show');
        bubbleTimer = setTimeout(() => bubble.classList.remove('show'), duration);
    }

    function animate(type) {
        const char = document.getElementById('zy-char');
        if (!char) return;
        char.classList.remove('zy-happy', 'zy-sad');
        void char.offsetWidth; // reflow
        char.classList.add(type);
    }

    const ZhouYu = {
        speak(text, duration) { showBubble(text, duration); },
        praise()   { animate('zy-happy'); showBubble(pick(MESSAGES.praise), 3000); },
        encourage(){ animate('zy-sad');   showBubble(pick(MESSAGES.encourage), 3500); },
        greet()    { showBubble(pick(MESSAGES.greet), 4000); },
        readingCorrect() { animate('zy-happy'); showBubble(pick(MESSAGES.reading_correct), 2500); },
        readingWrong()   { animate('zy-sad');   showBubble(pick(MESSAGES.reading_wrong), 3000); },
    };

    window.ZhouYu = ZhouYu;

    // 挂载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { mount(); setTimeout(() => ZhouYu.greet(), 800); });
    } else {
        mount();
        setTimeout(() => ZhouYu.greet(), 800);
    }
})();
