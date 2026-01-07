import { MapData, MajorRealm, ElementType, Enemy, EnemyRank } from '../types';
import { BESTIARY, BOSS_MAPPING } from './enemies';
import { REALM_NAMES } from '../constants';

// Merged Data from V60 Specification
const RAW_MAPS_V60 = [
  // --- Block 1: 0-19 ---
  {
    "id": 0, "name": "青雲仙宗", "realm": "凡人", "size": [40, 40], "pos": [0, 0], "theme": "Center",
    "description": "仙門巍峨，紫氣東來。千年護宗大陣流轉不息，隱隱傳來大道梵音，令人心神嚮往。",
    "portals": [
      { "target_id": 1, "dir": "North", "pos": [20, 0] },
      { "target_id": 2, "dir": "South", "pos": [20, 40] },
      { "target_id": 3, "dir": "East", "pos": [40, 20] },
      { "target_id": 4, "dir": "West", "pos": [0, 20] }
    ],
    "boss": null
  },
  {
    "id": 1, "name": "宗門後山", "realm": "凡人", "size": [60, 60], "pos": [0, 1], "theme": "North",
    "description": "林深徑幽，靈藥遍地。這裡是弟子們初識草木、吞吐朝霞的靜謐之地。",
    "portals": [
      { "target_id": 0, "dir": "South", "pos": [30, 60] },
      { "target_id": 5, "dir": "North", "pos": [30, 0] },
      { "target_id": 3, "dir": "SouthEast", "pos": [60, 60] }
    ],
    "boss": null
  },
  {
    "id": 2, "name": "仙緣鎮", "realm": "凡人", "size": [60, 60], "pos": [0, -1], "theme": "South",
    "description": "紅塵滾滾，人聲鼎沸。凡人在此處仰望仙門，只求那一絲渺茫的仙緣。",
    "portals": [
      { "target_id": 0, "dir": "North", "pos": [30, 0] },
      { "target_id": 6, "dir": "South", "pos": [30, 60] },
      { "target_id": 4, "dir": "NorthWest", "pos": [0, 0] }
    ],
    "boss": null
  },
  {
    "id": 3, "name": "靈湖草甸", "realm": "凡人", "size": [60, 60], "pos": [1, 0], "theme": "East",
    "description": "煙波浩渺，碧草連天。微風拂過，靈湖泛起層層漣漪，似有靈鯉躍出水面。",
    "portals": [
      { "target_id": 0, "dir": "West", "pos": [0, 30] },
      { "target_id": 1, "dir": "NorthWest", "pos": [0, 0] },
      { "target_id": 2, "dir": "SouthWest", "pos": [0, 60] },
      { "target_id": 7, "dir": "South", "pos": [30, 60] }
    ],
    "boss": null
  },
  {
    "id": 4, "name": "外門試煉場", "realm": "凡人", "size": [60, 60], "pos": [-1, 0], "theme": "West",
    "description": "黃沙漫天，殺聲震野。石柱林立間，依稀可見無數弟子揮灑的汗水與熱血。",
    "portals": [
      { "target_id": 0, "dir": "East", "pos": [60, 30] },
      { "target_id": 2, "dir": "SouthEast", "pos": [60, 60] },
      { "target_id": 8, "dir": "West", "pos": [0, 30] }
    ],
    "boss": null
  },
  {
    "id": 5, "name": "北郊碎石坡", "realm": "凡人", "size": [60, 60], "pos": [1, 1], "theme": "North",
    "description": "怪石嶙峋，荊棘叢生。此處山勢陡峭，常有猛獸出沒於亂石之間。",
    "portals": [
      { "target_id": 1, "dir": "West", "pos": [0, 30] },
      { "target_id": 9, "dir": "North", "pos": [30, 0] }
    ],
    "boss": null
  },
  {
    "id": 6, "name": "南郊蘆葦蕩", "realm": "凡人", "size": [60, 60], "pos": [-1, -1], "theme": "South",
    "description": "蘆花飛雪，水澤迷離。看似平靜的盪漾深處，隱藏著致命的殺機。",
    "portals": [
      { "target_id": 2, "dir": "East", "pos": [60, 30] },
      { "target_id": 12, "dir": "South", "pos": [30, 60] }
    ],
    "boss": null
  },
  {
    "id": 7, "name": "東郊荒塚", "realm": "凡人", "size": [60, 60], "pos": [1, -1], "theme": "East",
    "description": "斷碑殘垣，鬼火森森。昔日的戰場已被歲月掩埋，只餘下無盡的淒涼與怨念。",
    "portals": [
      { "target_id": 3, "dir": "North", "pos": [30, 0] },
      { "target_id": 15, "dir": "East", "pos": [60, 30] }
    ],
    "boss": { "name": "守塚老屍", "realm": "凡人巔峰", "element": "陰", "pos": [30, 30] }
  },
  {
    "id": 8, "name": "萬獸林入口", "realm": "練氣", "size": [100, 100], "pos": [-2, 0], "theme": "West",
    "description": "古木參天，遮雲蔽日。深處傳來的陣陣獸吼，彷彿在警告著所有踏入者。",
    "portals": [
      { "target_id": 4, "dir": "East", "pos": [100, 50] },
      { "target_id": 18, "dir": "South", "pos": [50, 100] }
    ],
    "boss": { "name": "裂風狼王", "realm": "練氣初期", "element": "風", "pos": [20, 50] }
  },
  {
    "id": 9, "name": "猿鳴雪峰底", "realm": "練氣", "size": [100, 100], "pos": [0, 2], "theme": "North",
    "description": "寒氣逼人，雪峰入雲。淒厲的猿聲迴盪在空谷之中，更添幾分肅殺。",
    "portals": [
      { "target_id": 5, "dir": "South", "pos": [50, 100] },
      { "target_id": 10, "dir": "West", "pos": [0, 50] }
    ],
    "boss": null
  },
  {
    "id": 10, "name": "雲海棧道", "realm": "練氣", "size": [100, 100], "pos": [-1, 2], "theme": "North",
    "description": "懸空棧道，步步驚心。腳下是萬丈深淵，身周是翻湧雲海。",
    "portals": [
      { "target_id": 9, "dir": "East", "pos": [100, 50] },
      { "target_id": 11, "dir": "North", "pos": [50, 0] }
    ],
    "boss": null
  },
  {
    "id": 11, "name": "北天門關", "realm": "練氣", "size": [100, 100], "pos": [-1, 3], "theme": "North",
    "description": "極北門戶，風雪交加。巨大的關隘聳立在風雪中，守護著通往極寒之地的道路。",
    "portals": [
      { "target_id": 10, "dir": "South", "pos": [50, 100] },
      { "target_id": 20, "dir": "North", "pos": [50, 0] }
    ],
    "boss": { "name": "寒霜白猿", "realm": "練氣圓滿", "element": "冰", "pos": [50, 20] }
  },
  {
    "id": 12, "name": "蘆葦腐澤區", "realm": "練氣", "size": [100, 100], "pos": [0, -2], "theme": "South",
    "description": "淤泥遍地，毒瘴瀰漫。腐爛的氣息令人作嘔，每一步都可能驚動潛伏的毒蟲。",
    "portals": [
      { "target_id": 6, "dir": "North", "pos": [50, 0] },
      { "target_id": 13, "dir": "East", "pos": [100, 50] }
    ],
    "boss": null
  },
  {
    "id": 13, "name": "陰風谷口", "realm": "練氣", "size": [100, 100], "pos": [1, -2], "theme": "South",
    "description": "陰風呼嘯，直刺神魂。谷口彷彿一張吞噬光明的巨口，令人不寒而慄。",
    "portals": [
      { "target_id": 12, "dir": "West", "pos": [0, 50] },
      { "target_id": 14, "dir": "South", "pos": [50, 100] }
    ],
    "boss": null
  },
  {
    "id": 14, "name": "寒潭入口", "realm": "練氣", "size": [100, 100], "pos": [0, -3], "theme": "South",
    "description": "潭水幽黑，深不可測。刺骨的寒氣撲面而來，傳說潭底有巨獸潛伏。",
    "portals": [
      { "target_id": 13, "dir": "North", "pos": [50, 0] },
      { "target_id": 27, "dir": "West", "pos": [0, 50] }
    ],
    "boss": { "name": "墨色水怪", "realm": "練氣圓滿", "element": "水/毒", "pos": [50, 80] }
  },
  {
    "id": 15, "name": "東郊廢墟", "realm": "練氣", "size": [100, 100], "pos": [2, 0], "theme": "East",
    "description": "殘桓斷壁，荒草淒淒。昔日的繁華已隨風而逝，只剩下死一般的寂靜。",
    "portals": [
      { "target_id": 7, "dir": "West", "pos": [0, 50] },
      { "target_id": 16, "dir": "North", "pos": [50, 0] }
    ],
    "boss": null
  },
  {
    "id": 16, "name": "雷暴荒原", "realm": "練氣", "size": [100, 100], "pos": [2, 1], "theme": "East",
    "description": "烏雲壓頂，雷蛇狂舞。狂暴的雷屬性靈氣充斥著每一寸空間，寸草不生。",
    "portals": [
      { "target_id": 15, "dir": "South", "pos": [50, 100] },
      { "target_id": 17, "dir": "East", "pos": [100, 50] }
    ],
    "boss": null
  },
  {
    "id": 17, "name": "寂滅雷澤口", "realm": "練氣", "size": [100, 100], "pos": [3, 1], "theme": "East",
    "description": "雷鳴電閃，步步驚心。這裡是雷修的修煉聖地，也是凡人的死亡禁區。",
    "portals": [
      { "target_id": 16, "dir": "West", "pos": [0, 50] },
      { "target_id": 30, "dir": "North", "pos": [50, 0] }
    ],
    "boss": { "name": "雷翼大隼", "realm": "練氣圓滿", "element": "雷", "pos": [80, 50] }
  },
  {
    "id": 18, "name": "迷影叢林", "realm": "練氣", "size": [100, 100], "pos": [-2, -1], "theme": "West",
    "description": "樹影婆娑，迷霧重重。光線在這裡被扭曲，極易讓人迷失方向。",
    "portals": [
      { "target_id": 8, "dir": "North", "pos": [50, 0] },
      { "target_id": 19, "dir": "West", "pos": [0, 50] }
    ],
    "boss": null
  },
  {
    "id": 19, "name": "萬獸林外圍", "realm": "練氣", "size": [100, 100], "pos": [-3, -1], "theme": "West",
    "description": "妖氣瀰漫，危機四伏。強大的妖獸在此徘徊，宣誓著它們的領地主權。",
    "portals": [
      { "target_id": 18, "dir": "East", "pos": [100, 50] },
      { "target_id": 33, "dir": "South", "pos": [50, 100] }
    ],
    "boss": { "name": "金睛虎王", "realm": "練氣圓滿", "element": "物理", "pos": [20, 50] }
  },

  // --- Block 2: 20-34 ---
  {
    "id": 20, "name": "雪線古道", "realm": "築基", "size": [180, 180], "pos": [0, 4], "theme": "North",
    "description": "風雪漫卷，古道蒼茫。這裡是分割凡俗與極寒禁區的界線，每一步都踏在歷史的塵埃之上。",
    "portals": [
      { "target_id": 11, "dir": "South", "pos": [90, 180] },
      { "target_id": 21, "dir": "East", "pos": [180, 90] }
    ],
    "boss": null
  },
  {
    "id": 21, "name": "冰封峽谷", "realm": "築基", "size": [180, 180], "pos": [1, 4], "theme": "North",
    "description": "兩側冰壁如刀劈斧削，晶瑩剔透中封印著遠古的生靈。寒氣透骨，似要凍結闖入者的靈魂。",
    "portals": [
      { "target_id": 20, "dir": "West", "pos": [0, 90] },
      { "target_id": 22, "dir": "North", "pos": [90, 0] }
    ],
    "boss": null
  },
  {
    "id": 22, "name": "落雷懸崖", "realm": "築基", "size": [180, 180], "pos": [1, 5], "theme": "North",
    "description": "崖頂常年雷雲低垂，銀蛇狂舞。雷鳴與雪崩之聲交織，奏響一曲毀滅的樂章。",
    "portals": [
      { "target_id": 21, "dir": "South", "pos": [90, 180] },
      { "target_id": 35, "dir": "North", "pos": [90, 0] }
    ],
    "boss": { "name": "極地劍靈", "realm": "築基圓滿", "element": "冰", "pos": [90, 40] }
  },
  {
    "id": 23, "name": "烈焰荒原", "realm": "築基", "size": [180, 180], "pos": [0, -4], "theme": "South",
    "description": "熱浪扭曲了空間，大地龜裂如網。硫磺氣息撲面而來，這裡是火修的天堂，凡人的煉獄。",
    "portals": [
      { "target_id": 14, "dir": "North", "pos": [90, 0] },
      { "target_id": 24, "dir": "East", "pos": [180, 90] },
      { "target_id": 27, "dir": "West", "pos": [0, 90] }
    ],
    "boss": null
  },
  {
    "id": 24, "name": "熔岩流道", "realm": "築基", "size": [180, 180], "pos": [1, -4], "theme": "South",
    "description": "赤紅的岩漿如火龍般蜿蜒流淌，將黑暗地底映照得如同白晝。稍有踏錯，便會屍骨無存。",
    "portals": [
      { "target_id": 23, "dir": "West", "pos": [0, 90] },
      { "target_id": 25, "dir": "South", "pos": [90, 180] }
    ],
    "boss": null
  },
  {
    "id": 25, "name": "地底暗河", "realm": "築基", "size": [180, 180], "pos": [1, -5], "theme": "South",
    "description": "河水漆黑如墨，寂靜無聲。不知流向何方的暗流中，似乎隱藏著來自地心的窺視。",
    "portals": [
      { "target_id": 24, "dir": "North", "pos": [90, 0] },
      { "target_id": 26, "dir": "West", "pos": [0, 90] }
    ],
    "boss": null
  },
  {
    "id": 26, "name": "赤紅裂谷", "realm": "築基", "size": [180, 180], "pos": [0, -5], "theme": "South",
    "description": "大地裂開的傷口，噴湧著來自地心的怒火。高溫讓周圍的岩石都化作了琉璃般的結晶。",
    "portals": [
      { "target_id": 25, "dir": "East", "pos": [180, 90] },
      { "target_id": 38, "dir": "South", "pos": [90, 180] }
    ],
    "boss": { "name": "烈焰妖王", "realm": "築基圓滿", "element": "火", "pos": [90, 140] }
  },
  {
    "id": 27, "name": "焦土小徑", "realm": "築基", "size": [180, 180], "pos": [-1, -4], "theme": "South",
    "description": "曾被天火肆虐之地，寸草不生。只有炭黑的枯木如鬼爪般伸向天空，訴說著昔日的絕望。",
    "portals": [
      { "target_id": 14, "dir": "East", "pos": [180, 90] },
      { "target_id": 23, "dir": "South", "pos": [90, 180] }
    ],
    "boss": null
  },
  {
    "id": 28, "name": "古戰場遺跡", "realm": "築基", "size": [180, 180], "pos": [4, 1], "theme": "East",
    "description": "殘戟斷劍，埋於黃沙。千萬年前的喊殺聲似乎仍在風中迴盪，經久不散的殺氣令人心驚。",
    "portals": [
      { "target_id": 17, "dir": "West", "pos": [0, 90] },
      { "target_id": 29, "dir": "North", "pos": [90, 0] }
    ],
    "boss": null
  },
  {
    "id": 29, "name": "沉沒石塔", "realm": "築基", "size": [180, 180], "pos": [4, 2], "theme": "East",
    "description": "半截塔身斜插大地，爬滿了歲月的青苔。塔內隱隱透出的神秘氣息，引誘著貪婪的探險者。",
    "portals": [
      { "target_id": 28, "dir": "South", "pos": [90, 180] },
      { "target_id": 41, "dir": "North", "pos": [90, 0] },
      { "target_id": 30, "dir": "West", "pos": [0, 90] }
    ],
    "boss": { "name": "雷澤領主", "realm": "築基圓滿", "element": "雷", "pos": [140, 90] }
  },
  {
    "id": 30, "name": "陰風窟深處", "realm": "築基", "size": [180, 180], "pos": [3, 2], "theme": "East",
    "description": "風聲呼嘯，如萬鬼齊哭。這裡的光線都被吞噬，唯有靈魂的微光在黑暗中搖曳。",
    "portals": [
      { "target_id": 17, "dir": "South", "pos": [90, 180] },
      { "target_id": 29, "dir": "East", "pos": [180, 90] }
    ],
    "boss": null
  },
  {
    "id": 31, "name": "幽暗密林", "realm": "築基", "size": [180, 180], "pos": [-4, -1], "theme": "West",
    "description": "古木參天，枝葉交織成網，終年不見天日。腐葉下潛伏著劇毒與陰影。",
    "portals": [
      { "target_id": 19, "dir": "East", "pos": [180, 90] },
      { "target_id": 32, "dir": "South", "pos": [90, 180] }
    ],
    "boss": null
  },
  {
    "id": 32, "name": "盤龍岩窟", "realm": "築基", "size": [180, 180], "pos": [-4, -2], "theme": "West",
    "description": "岩洞千折百轉，宛如盤龍蟄伏。錯綜複雜的通道中，風聲嗚咽，似在訴說古老的秘密。",
    "portals": [
      { "target_id": 31, "dir": "North", "pos": [90, 0] },
      { "target_id": 34, "dir": "West", "pos": [0, 90] },
      { "target_id": 33, "dir": "East", "pos": [180, 90] }
    ],
    "boss": null
  },
  {
    "id": 33, "name": "虎嘯深林", "realm": "築基", "size": [180, 180], "pos": [-3, -2], "theme": "West",
    "description": "山林震顫，百獸噤聲。這裡是王者的領地，每一縷空氣都瀰漫著殘暴的威壓。",
    "portals": [
      { "target_id": 19, "dir": "North", "pos": [90, 0] },
      { "target_id": 32, "dir": "West", "pos": [0, 90] }
    ],
    "boss": null
  },
  {
    "id": 34, "name": "狂獸巢穴", "realm": "築基", "size": [180, 180], "pos": [-5, -2], "theme": "West",
    "description": "遍地白骨，腥氣沖天。森林的最深處，只有強者才能在無盡的殺戮中生存。",
    "portals": [
      { "target_id": 32, "dir": "East", "pos": [180, 90] },
      { "target_id": 42, "dir": "West", "pos": [0, 90] }
    ],
    "boss": { "name": "萬獸獸王", "realm": "築基圓滿", "element": "物理", "pos": [40, 90] }
  },

  // --- Block 3: 35-42 ---
  {
    "id": 35, "name": "迷霧幻海", "realm": "金丹", "size": [150, 150], "pos": [0, 6], "theme": "North",
    "description": "波光瀲灩，雲遮霧繞。天地一色間，分不清是海市蜃樓，還是真實的人間仙境。",
    "portals": [
      { "target_id": 22, "dir": "North", "pos": [75, 0] },
      { "target_id": 36, "dir": "West", "pos": [0, 75] }
    ],
    "boss": null
  },
  {
    "id": 36, "name": "千幻石林", "realm": "金丹", "size": [150, 150], "pos": [-1, 6], "theme": "North",
    "description": "石柱擎天，陣紋密布。每一根石柱都演化著一重幻境，道心不堅者必將永墮沉淪。",
    "portals": [
      { "target_id": 35, "dir": "East", "pos": [150, 75] },
      { "target_id": 43, "dir": "South", "pos": [75, 150] },
      { "target_id": 37, "dir": "South", "pos": [30, 150] }
    ],
    "boss": null
  },
  {
    "id": 37, "name": "幻夢神海", "realm": "金丹", "size": [150, 150], "pos": [0, 7], "theme": "North",
    "description": "彼岸花開，如夢似幻。這是金丹修士的問心之地，唯有斬斷恐懼，方能得見真我。",
    "portals": [
      { "target_id": 36, "dir": "NorthWest", "pos": [0, 0] },
      { "target_id": 43, "dir": "South", "pos": [75, 150] }
    ],
    "boss": { "name": "蜃樓主", "realm": "金丹圓滿", "element": "幻/水", "pos": [75, 30], "desc": "製造分身。" }
  },
  {
    "id": 38, "name": "腐蝕灘塗", "realm": "金丹", "size": [150, 150], "pos": [0, -6], "theme": "South",
    "description": "黑水拍岸，酸霧蝕骨。每一朵浪花都帶著銷魂蝕骨的劇毒，生機在此斷絕。",
    "portals": [
      { "target_id": 26, "dir": "North", "pos": [75, 0] },
      { "target_id": 39, "dir": "West", "pos": [0, 75] },
      { "target_id": 40, "dir": "East", "pos": [150, 75] }
    ],
    "boss": null
  },
  {
    "id": 39, "name": "沉沒古城", "realm": "金丹", "size": [150, 150], "pos": [-1, -6], "theme": "South",
    "description": "深海孤城，輝煌不再。斑駁的城牆靜臥海底，無言地訴說著遠古的滄桑與威嚴。",
    "portals": [
      { "target_id": 38, "dir": "East", "pos": [150, 75] },
      { "target_id": 45, "dir": "South", "pos": [75, 150] }
    ],
    "boss": null
  },
  {
    "id": 40, "name": "幽冥地宮", "realm": "金丹", "size": [150, 150], "pos": [1, -6], "theme": "South",
    "description": "黃泉路近，生人迴避。地宮深處的陰毒機關，專為貪婪的靈魂準備。",
    "portals": [
      { "target_id": 38, "dir": "West", "pos": [0, 75] },
      { "target_id": 45, "dir": "SouthWest", "pos": [0, 150] }
    ],
    "boss": null
  },
  {
    "id": 41, "name": "古禁制廢墟", "realm": "金丹", "size": [150, 150], "pos": [5, 2], "theme": "East",
    "description": "法則崩壞，虛空割裂。殘存的禁制如無形的利刃，稍有不慎便會身首異處。",
    "portals": [
      { "target_id": 29, "dir": "West", "pos": [0, 75] },
      { "target_id": 48, "dir": "East", "pos": [150, 75] }
    ],
    "boss": null
  },
  {
    "id": 42, "name": "萬妖石窟", "realm": "金丹", "size": [150, 150], "pos": [-6, -2], "theme": "West",
    "description": "妖氣沖天，群魔亂舞。這裡是西方妖域的屏障，也是無數修士的葬身之地。",
    "portals": [
      { "target_id": 34, "dir": "East", "pos": [150, 75] },
      { "target_id": 50, "dir": "West", "pos": [0, 75] }
    ],
    "boss": { "name": "百眼蛛母", "realm": "金丹圓滿", "element": "暗/毒", "pos": [20, 75] }
  },

  // --- Block 4: 43-54 ---
  {
    "id": 43, "name": "荒古遺地", "realm": "元嬰", "size": [120, 120], "pos": [0, 8], "theme": "North",
    "description": "天地洪荒，歲月悠悠。漂浮的陸地碎片記錄著太古的戰火，虛空亂流在此交匯。",
    "portals": [
      { "target_id": 37, "dir": "North", "pos": [60, 0] },
      { "target_id": 44, "dir": "East", "pos": [120, 60] },
      { "target_id": 49, "dir": "West", "pos": [0, 60] }
    ],
    "boss": null
  },
  {
    "id": 44, "name": "葬劍古塚", "realm": "元嬰", "size": [120, 120], "pos": [1, 8], "theme": "North",
    "description": "劍氣縱橫，萬劍歸宗。無數斷劍插於荒塚之上，悲鳴聲中似乎在等待新的主人。",
    "portals": [
      { "target_id": 43, "dir": "West", "pos": [0, 60] },
      { "target_id": 52, "dir": "South", "pos": [60, 120] }
    ],
    "boss": { "name": "無名劍修", "realm": "元嬰大圓滿", "element": "物理/劍", "pos": [60, 30] }
  },
  {
    "id": 45, "name": "萬法枯竭荒漠", "realm": "元嬰", "size": [120, 120], "pos": [0, -8], "theme": "South",
    "description": "靈氣禁絕，萬法皆空。這是一片被天道遺棄的荒漠，修仙者的修為在此將受到嚴酷考驗。",
    "portals": [
      { "target_id": 39, "dir": "North", "pos": [60, 0] },
      { "target_id": 40, "dir": "NorthEast", "pos": [120, 0] },
      { "target_id": 46, "dir": "East", "pos": [120, 60] }
    ],
    "boss": null
  },
  {
    "id": 46, "name": "寂滅星原", "realm": "元嬰", "size": [120, 120], "pos": [1, -8], "theme": "South",
    "description": "黃沙漫漫，吞噬萬物。流動的沙丘如同活物，隨時準備將過客拖入無底深淵。",
    "portals": [
      { "target_id": 45, "dir": "West", "pos": [0, 60] },
      { "target_id": 53, "dir": "South", "pos": [60, 120] }
    ],
    "boss": { "name": "星塵巨人", "realm": "元嬰大圓滿", "element": "土/星辰", "pos": [60, 90] }
  },
  {
    "id": 47, "name": "鎮魔擎天塔", "realm": "元嬰", "size": [120, 120], "pos": [7, 2], "theme": "East",
    "description": "星光垂落，巨靈長眠。巨大的骸骨宛如山巒起伏，星塵之力在骨骼間流轉不息。",
    "portals": [
      { "target_id": 41, "dir": "West", "pos": [0, 60] },
      { "target_id": 48, "dir": "East", "pos": [120, 60] }
    ],
    "boss": null
  },
  {
    "id": 48, "name": "不朽帝尊陵", "realm": "元嬰", "size": [120, 120], "pos": [8, 3], "theme": "East",
    "description": "殺意凝實，血色遮空。這裡曾是神魔交戰的核心，殘留的意志至今仍在廝殺。",
    "portals": [
      { "target_id": 47, "dir": "West", "pos": [0, 60] },
      { "target_id": 54, "dir": "East", "pos": [120, 60] }
    ],
    "boss": { "name": "屍皇", "realm": "元嬰巔峰", "element": "死/金", "pos": [90, 60] }
  },
  // --- Block 5: 49-67 ---
  {
    "id": 49, "name": "碎星浮空島", "realm": "化神", "size": [120, 120], "pos": [-1, 8], "theme": "North",
    "description": "星河破碎，島嶼懸空。這裡是離天最近的地方，舉手可摘星辰，低頭可見蒼生。",
    "portals": [
      { "target_id": 43, "dir": "East", "pos": [120, 60] }
    ],
    "boss": null
  },
  {
    "id": 50, "name": "乾坤倒置界", "realm": "化神", "size": [120, 120], "pos": [-7, -3], "theme": "West",
    "description": "陰陽逆亂，天地倒懸。重力在此失去了意義，每一步都在挑戰常理的認知。",
    "portals": [
      { "target_id": 42, "dir": "East", "pos": [120, 60] },
      { "target_id": 51, "dir": "West", "pos": [0, 60] }
    ],
    "boss": null
  },
  {
    "id": 51, "name": "九天劫海", "realm": "化神", "size": [120, 120], "pos": [-8, -4], "theme": "West",
    "description": "雷漿化海，咆哮不息。這是天道對化神修士最後的考驗，渡過即為仙途。",
    "portals": [
      { "target_id": 50, "dir": "East", "pos": [120, 60] },
      { "target_id": 52, "dir": "North", "pos": [60, 0] }
    ],
    "boss": { "name": "霆祖", "realm": "化神圓滿", "element": "雷/罰", "pos": [30, 60] }
  },
  
  // --- Void Refining (52-54) ---
  {
    "id": 52, "name": "虛無裂隙", "realm": "煉虛", "size": [150, 150], "pos": [0, 9], "theme": "North",
    "description": "萬物歸寂，裂縫橫生。物質在此被剝離了形態，只剩下最本源的虛無。",
    "portals": [
      { "target_id": 51, "dir": "South", "pos": [75, 150] },
      { "target_id": 53, "dir": "North", "pos": [75, 0] }
    ],
    "boss": null
  },
  {
    "id": 53, "name": "元神試煉場", "realm": "煉虛", "size": [150, 150], "pos": [0, 10], "theme": "North",
    "description": "心魔叢生，幻象萬千。這裡沒有真實的敵人，唯一的對手只有你自己的元神。",
    "portals": [
      { "target_id": 52, "dir": "South", "pos": [75, 150] },
      { "target_id": 54, "dir": "North", "pos": [75, 0] }
    ],
    "boss": null
  },
  {
    "id": 54, "name": "太虛幻境", "realm": "煉虛", "size": [150, 150], "pos": [0, 11], "theme": "North",
    "description": "真假難辨，若即若離。在太虛之中，真實不過是一瞬的執念，虛幻才是永恆。",
    "portals": [
      { "target_id": 53, "dir": "South", "pos": [75, 150] },
      { "target_id": 55, "dir": "North", "pos": [75, 0] }
    ],
    "boss": { "name": "太虛夢魘", "realm": "煉虛圓滿", "element": "虛空", "pos": [75, 75] }
  },

  // --- Fusion (55-57) ---
  {
    "id": 55, "name": "空間崩壞裂縫", "realm": "合體", "size": [120, 120], "pos": [1, 11], "theme": "North",
    "description": "時空錯亂，碎片翻飛。巨大的裂縫如同蒼穹的傷疤，吞噬著一切敢於靠近的存在。",
    "portals": [
      { "target_id": 54, "dir": "South", "pos": [60, 120] },
      { "target_id": 56, "dir": "North", "pos": [60, 0] }
    ],
    "boss": null
  },
  {
    "id": 56, "name": "天罰之巔", "realm": "合體", "size": [120, 120], "pos": [1, 12], "theme": "South",
    "description": "雷雲壓頂，神威如獄。這裡是天道意志最為強烈之處，每一道雷霆都蘊含著毀滅法則。",
    "portals": [
      { "target_id": 55, "dir": "South", "pos": [60, 120] },
      { "target_id": 57, "dir": "North", "pos": [60, 0] }
    ],
    "boss": null
  },
  {
    "id": 57, "name": "虛空樞紐", "realm": "合體", "size": [120, 120], "pos": [2, 12], "theme": "East",
    "description": "萬界交匯，亂流激盪。無數位面的通道在此開啟，虛空生物在此築巢。",
    "portals": [
      { "target_id": 56, "dir": "South", "pos": [0, 120] },
      { "target_id": 58, "dir": "North", "pos": [0, 0] }
    ],
    "boss": { "name": "虛空守衛", "realm": "合體大圓滿", "element": "空/混元", "pos": [90, 90] }
  },

  // --- Mahayana (58-59) ---
  {
    "id": 58, "name": "墜星之地", "realm": "大乘", "size": [200, 200], "pos": [0, 13], "theme": "Ascent",
    "description": "星辰同悲，大道哀鳴。無數衝擊仙道失敗的強者隕落於此，化作永恆的星塵。",
    "portals": [
      { "target_id": 57, "dir": "South", "pos": [100, 200] },
      { "target_id": 59, "dir": "North", "pos": [100, 0] }
    ],
    "boss": null
  },
  {
    "id": 59, "name": "星辰盡頭", "realm": "大乘", "size": [200, 200], "pos": [0, 14], "theme": "Ascent",
    "description": "銀河斷流，星光寂滅。再向前一步，便是凡塵的終點，未知的起點。",
    "portals": [
      { "target_id": 58, "dir": "South", "pos": [100, 200] },
      { "target_id": 60, "dir": "North", "pos": [100, 0] }
    ],
    "boss": { "name": "古神 · 星緯", "realm": "大乘巔峰", "element": "星辰", "pos": [100, 100] }
  },

  // --- Tribulation (60-61) ---
  {
    "id": 60, "name": "劫雲深處", "realm": "渡劫", "size": [200, 200], "pos": [0, 15], "theme": "Ascent",
    "description": "墨色劫雲，遮天蔽日。毀滅的氣息令人窒息，這裡是修仙者最後的修羅場。",
    "portals": [
      { "target_id": 59, "dir": "South", "pos": [100, 200] },
      { "target_id": 61, "dir": "North", "pos": [100, 0] }
    ],
    "boss": null
  },
  {
    "id": 61, "name": "天道祭壇", "realm": "渡劫", "size": [200, 200], "pos": [0, 16], "theme": "Ascent",
    "description": "古樸蒼涼，道韻天成。祭壇之上，直面天道拷問，一步登天，或萬劫不復。",
    "portals": [
      { "target_id": 60, "dir": "South", "pos": [100, 200] },
      { "target_id": 62, "dir": "North", "pos": [100, 0] }
    ],
    "boss": { "name": "劫灰守衛", "realm": "渡劫圓滿", "element": "火/劫", "pos": [100, 100] }
  },

  // --- Immortal (62-64) ---
  {
    "id": 62, "name": "飛昇台", "realm": "人仙", "size": [250, 250], "pos": [0, 18], "theme": "Ascent",
    "description": "仙音裊裊，瑞氣千條。脫去凡胎換仙骨，從此不再是凡人。",
    "portals": [
      { "target_id": 61, "dir": "South", "pos": [125, 250] },
      { "target_id": 63, "dir": "North", "pos": [125, 0] }
    ],
    "boss": null
  },
  {
    "id": 63, "name": "長生仙域", "realm": "地仙", "size": [250, 250], "pos": [0, 19], "theme": "Ascent",
    "description": "瓊樓玉宇，仙鶴齊飛。這裡的一草一木都蘊含著長生之謎，歲月在此駐足。",
    "portals": [
      { "target_id": 62, "dir": "South", "pos": [125, 250] },
      { "target_id": 64, "dir": "North", "pos": [125, 0] }
    ],
    "boss": null
  },
  {
    "id": 64, "name": "九重天闕", "realm": "天仙", "size": [250, 250], "pos": [0, 20], "theme": "Ascent",
    "description": "雲端之上，天宮巍峨。金光萬道滾紅霓，瑞氣千條噴紫霧。",
    "portals": [
      { "target_id": 63, "dir": "South", "pos": [125, 250] },
      { "target_id": 65, "dir": "North", "pos": [125, 0] }
    ],
    "boss": { "name": "巡天神將", "realm": "天仙圓滿", "element": "金/天", "pos": [125, 125] }
  },

  // --- Golden Immortal (65-66) ---
  {
    "id": 65, "name": "法則之海", "realm": "金仙", "size": [200, 200], "pos": [0, 21], "theme": "Ascent",
    "description": "大道三千，匯聚成海。每一滴浪花都是一條完整的法則，令人沉醉其中。",
    "portals": [
      { "target_id": 64, "dir": "South", "pos": [100, 200] },
      { "target_id": 66, "dir": "North", "pos": [100, 0] }
    ],
    "boss": null
  },
  {
    "id": 66, "name": "混沌源頭", "realm": "金仙", "size": [250, 250], "pos": [0, 22], "theme": "Ascent",
    "description": "萬物歸一，混沌初開。這裡沒有時間的概念，只有無盡的虛無與起源。",
    "portals": [
      { "target_id": 65, "dir": "South", "pos": [125, 250] },
      { "target_id": 67, "dir": "North", "pos": [125, 0] }
    ],
    "boss": { "name": "鴻蒙之影", "realm": "金仙大圓滿", "element": "混沌", "pos": [125, 50] }
  },

  // --- Immortal Emperor (67) ---
  {
    "id": 67, "name": "彼岸終點", "realm": "仙帝", "size": [300, 300], "pos": [0, 23], "theme": "Ascent",
    "description": "證道之地，獨斷萬古。只有踏過這條路的盡頭，才能成為真正的諸天至尊。",
    "portals": [
      { "target_id": 66, "dir": "South", "pos": [150, 300] }
    ],
    "boss": { "name": "天道意志 · 因果法身", "realm": "仙帝", "element": "全系/天道", "pos": [150, 50] }
  }
];

const getRealmEnum = (str: string): MajorRealm => {
    switch (str) {
        case '凡人': return MajorRealm.Mortal;
        case '練氣': return MajorRealm.QiRefining;
        case '築基': return MajorRealm.Foundation;
        case '金丹': return MajorRealm.GoldenCore;
        case '元嬰': return MajorRealm.NascentSoul;
        case '化神': return MajorRealm.SpiritSevering;
        case '煉虛': return MajorRealm.VoidRefining;
        case '合體': return MajorRealm.Fusion;
        case '大乘': return MajorRealm.Mahayana;
        case '渡劫': return MajorRealm.Tribulation;
        case '人仙':
        case '地仙':
        case '天仙':
        case '金仙': return MajorRealm.Immortal;
        case '仙帝': return MajorRealm.ImmortalEmperor;
        default: return MajorRealm.Mortal;
    }
};

export const MAPS: MapData[] = RAW_MAPS_V60.map((raw, index) => {
    const realm = getRealmEnum(raw.realm);
    const id = raw.id.toString(); 
    
    const worldX = raw.pos[0];
    const worldY = raw.pos[1];
    const width = raw.size[0];
    const height = raw.size[1];

    // Generate Enemies List for the Map
    const enemies: Enemy[] = [];
    
    // Map 0 is a Safe Zone (Village) - No monsters
    if (id === '0') {
        // Generate Portals from explicit positions for Map 0
        const portals = raw.portals.map(p => {
            const targetIdNum = p.target_id;
            const targetMapRaw = RAW_MAPS_V60.find(m => m.id === targetIdNum);
            
            let targetX = 10;
            let targetY = 10;
            
            if (targetMapRaw) {
                 // Find portal in target that points back to current map to determine spawn point
                 const returnPortal = targetMapRaw.portals.find(rp => rp.target_id === raw.id);
                 if (returnPortal) {
                     const tx = returnPortal.pos[0];
                     const ty = returnPortal.pos[1];
                     // Directly use the target's portal position as spawn
                     // Clamp to be safe
                     targetX = Math.max(0, Math.min(tx, targetMapRaw.size[0] - 1));
                     targetY = Math.max(0, Math.min(ty, targetMapRaw.size[1] - 1));
                 } else {
                     // Default center fallback (Should not happen with complete data)
                     targetX = Math.floor(targetMapRaw.size[0] / 2);
                     targetY = Math.floor(targetMapRaw.size[1] / 2);
                 }
            }

            // Clamp local portal position
            const px = Math.max(0, Math.min(p.pos[0], width - 1));
            const py = Math.max(0, Math.min(p.pos[1], height - 1));

            return {
                x: px,
                y: py,
                targetMapId: targetIdNum.toString(),
                targetX: targetX,
                targetY: targetY,
                label: targetMapRaw ? `前往 [${targetMapRaw.name}]` : '未知區域'
            };
        });

        return {
            id,
            name: raw.name,
            minRealm: realm,
            description: raw.description || '...',
            introText: `踏入${raw.name}，${raw.description || '靈氣流動似乎有些不同...'}`,
            width,
            height,
            worldX,
            worldY,
            enemies: [], // No monsters in village
            portals: portals,
            bossSpawn: null,
            dropRateMultiplier: 1 // Default drop rate for safe zone
        };
    }

    // Precise 1:1 Map-Monster Ecosystem Population
    // Fetch common monsters for this map: m{id}_c1, m{id}_c2, ...
    for (let i = 1; i <= 4; i++) {
        const enemyId = `m${id}_c${i}`;
        if (BESTIARY[enemyId]) {
            enemies.push(BESTIARY[enemyId]);
        }
    }

    // Fetch elite monsters for this map: m{id}_e1, m{id}_e2, ...
    for (let i = 1; i <= 2; i++) {
        const enemyId = `m${id}_e${i}`;
        if (BESTIARY[enemyId]) {
            enemies.push(BESTIARY[enemyId]);
        }
    }

    // Fallback: If no monsters found for this specific map, use realm-wide defaults
    if (enemies.length === 0) {
        const allEnemies = Object.values(BESTIARY);
        const commonForRealm = allEnemies.filter(e => e.realm === realm && e.rank === EnemyRank.Common);
        if (commonForRealm.length > 0) {
            enemies.push(commonForRealm[Math.floor(Math.random() * commonForRealm.length)]);
        }
    }

    // Add Boss if defined (Use fixed position)
    let bossSpawn = undefined;
    // Boss handling via BOSS_MAPPING
    if (raw.boss) {
        const bossId = BOSS_MAPPING[raw.boss.name];
        if (bossId && BESTIARY[bossId]) {
            enemies.push(BESTIARY[bossId]);
            bossSpawn = {
                 x: Math.max(0, Math.min(raw.boss.pos[0], width - 1)),
                 y: Math.max(0, Math.min(raw.boss.pos[1], height - 1)),
                 enemyId: bossId
             };
        }
    }

    // Default Fallback (Skip Map 0 as it is Safe Zone)
    if (enemies.length === 0 && raw.id !== 0) {
        if (BESTIARY['m1_c1']) {
            enemies.push(BESTIARY['m1_c1']);
        }
    }

    // Generate Portals from explicit positions
    const portals = raw.portals.map(p => {
        const targetIdNum = p.target_id;
        const targetMapRaw = RAW_MAPS_V60.find(m => m.id === targetIdNum);
        
        let targetX = 10;
        let targetY = 10;
        
        if (targetMapRaw) {
             // Find portal in target that points back to current map to determine spawn point
             const returnPortal = targetMapRaw.portals.find(rp => rp.target_id === raw.id);
             if (returnPortal) {
                 const tx = returnPortal.pos[0];
                 const ty = returnPortal.pos[1];
                 // Directly use the target's portal position as spawn
                 // Clamp to be safe
                 targetX = Math.max(0, Math.min(tx, targetMapRaw.size[0] - 1));
                 targetY = Math.max(0, Math.min(ty, targetMapRaw.size[1] - 1));
             } else {
                 // Default center fallback (Should not happen with complete data)
                 targetX = Math.floor(targetMapRaw.size[0] / 2);
                 targetY = Math.floor(targetMapRaw.size[1] / 2);
             }
        }

        // Clamp local portal position
        const px = Math.max(0, Math.min(p.pos[0], width - 1));
        const py = Math.max(0, Math.min(p.pos[1], height - 1));

        return {
            x: px,
            y: py,
            targetMapId: targetIdNum.toString(),
            targetX: targetX,
            targetY: targetY,
            label: targetMapRaw ? `前往 [${targetMapRaw.name}]` : '未知區域'
        };
    });

    return {
        id: id.toString(),
        name: raw.name,
        minRealm: realm,
        description: raw.description || '...', 
        introText: `踏入${raw.name}，${raw.description || '靈氣流動似乎有些不同...'}`,
        width: width,
        height: height,
        worldX: worldX,
        worldY: worldY,
        portals: portals,
        bossSpawn: bossSpawn,
        enemies: enemies,
        dropRateMultiplier: 1 + (index * 0.05)
    };
});
