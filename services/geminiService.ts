import { GoogleGenAI, Type } from "@google/genai";
import { TrackAnalysis, WeatherCondition, VehicleType, MapMarker, VideoAnalysisMode } from '../types';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string for the API
 */
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes the F1 track image or video using Gemini 2.5 Flash
 * @param imageInput Can be a File object (image/video) or a Base64 Data URL string (canvas image)
 * @param weather Weather condition
 * @param vehicle Vehicle type context
 * @param markers Array of markers with coordinates (Only used for images)
 * @param trackName Optional user provided track name
 * @param trackLength Optional user provided track length in meters
 * @param mediaType 'image' or 'video' to adjust prompt logic
 * @param videoMode Mode of analysis for video input
 */
export const analyzeTrackImage = async (
  imageInput: File | string, 
  weather: WeatherCondition,
  vehicle: VehicleType,
  markers: MapMarker[] = [],
  trackName: string = '',
  trackLength: string = '',
  mediaType: 'image' | 'video' = 'image',
  videoMode: VideoAnalysisMode = 'FullLap'
): Promise<TrackAnalysis> => {
  
  let base64Data = "";
  let mimeType = "image/jpeg";

  if (typeof imageInput === 'string') {
    // If input is a data URL string (e.g. from canvas), strip the prefix
    base64Data = imageInput.split(',')[1];
  } else {
    // If input is a File object (Image or Video)
    base64Data = await fileToGenerativePart(imageInput);
    
    // Determine MIME type strictly
    if (imageInput.type) {
      mimeType = imageInput.type;
    } else {
      // Fallback: guess by extension if type is empty (common for mkv/mov on some OS)
      const ext = imageInput.name.split('.').pop()?.toLowerCase();
      if (ext === 'mp4') mimeType = 'video/mp4';
      else if (ext === 'mov') mimeType = 'video/quicktime';
      else if (ext === 'webm') mimeType = 'video/webm';
      else if (ext === 'mkv') mimeType = 'video/x-matroska';
      else if (ext === 'avi') mimeType = 'video/x-msvideo';
      else mimeType = 'application/octet-stream'; // Risk of failure
    }
  }

  const weatherContext = weather === 'Wet' 
    ? '目前賽道狀況為：雨天 (Wet)。請務必針對濕地駕駛調整建議：煞車點通常需要更早且更平順，賽車路線應避開路面橡膠堆積區 (Rain Line)。\n[極重要] 請在策略與調校建議中，特別加入「雨胎配方建議 (Tire Compound)」與「濕地胎壓 (Wet Pressure)」的具體數值。' 
    : '目前賽道狀況為：晴天 (Dry)。請針對標準乾地駕駛提供最佳性能建議 (Slicks)。';

  // Detailed engineering contexts for each vehicle type
  const vehicleContexts: Record<VehicleType, string> = {
    'F1': `
      車輛設定：Formula 1 (F1)。
      [詳細性能規格]：
      - 動力: ~1000hp, 車重: 798kg. 極速 >330km/h.
      - 過彎 G 值: 5.0G - 6.0G. 下壓力等級: 極高.
      - 煞車: 碳纖維盤, 需高溫工作.
      - [新增] DRS 減阻系統: 開啟後尾翼主板平放，減少阻力並提升直線尾速 15-20 km/h. 有效區段單圈時間約減少 0.3s - 0.5s.
      - [新增] ERS 電能釋放: MGU-K 提供 160hp 輔助動力 (4MJ/Lap 釋放上限)，需優化單圈能量部屬 (Deployment) 與回收 (Harvesting) 策略.
      - [進階空力] 空力平衡 (Aero Balance): 調整前翼角度 (Flap Angle) 以改變前軸負載佔比 (Front %). 增加角度 (More Wing) 可消除轉向不足 (Understeer).
      
      [輪胎與煞車熱管理模型 Tire & Brake Thermal Model]:
      - 輪胎磨損 (Degradation): 極高熱敏感度 (High Thermal Sensitivity). 軟胎 (Soft C5) 壽命短且有明顯懸崖 (Cliff). 預期衰退率: 每圈慢 0.05s - 0.15s (視賽道). 
      - 工作溫度 (Operating Window): [前輪: 100°C - 110°C, 後輪: 90°C - 100°C]. 過熱會導致表面起泡 (Blistering).
      - 煞車熱衰 (Brake Fade): 碳纖維盤需 >400°C 才能工作, 最佳區間 400°C - 1000°C. 幾乎無熱衰退 (Fade-free), 但氧化磨損是限制. 真正的風險是安全車期間煞車過冷導致無制動力 (Glazing).
      
      [建議調校範圍 Reference Ranges]：
      - 前翼角度 (Front Wing): [Monza: 10°-18°] | [Spa/Suzuka: 28°-35°] | [Monaco: 45°-50°+].
      - 離地高 (Ride Height): [前: 4-6mm, 後: 5-7mm].
      - 胎壓 (Tire Pressure): [前: 22.0-24.0 psi, 後: 20.0-22.0 psi].
      - 懸吊硬度 (Spring Rate): [前: 200-250 N/mm (Stiff), 後: 160-200 N/mm (Stiff)].
      - 避震阻尼 (Damping): [高速壓縮: Stiff (硬), 低速回彈: Medium (中)].
      
      [物理特性]：極致氣動效率、碳纖維煞車(極短煞車距離)、DRS 減阻系統、ERS 電能釋放。
      [性能基準]：地球上最快賽車。若為知名賽道，必須精準參考真實 F1 紀錄。
      [平均時速參數]：230-250 km/h (乾地)。
      [煞車建議]：高速重煞 (Heavy Bleed)，初始咬合力極強，隨下壓力減弱需迅速收力 (Trail Braking)。
    `,
    'FormulaE': `
      車輛設定：Formula E (Gen3)。
      [詳細性能規格]：
      - 動力: 350kW (470hp). 車重: ~850kg. 極速 ~320km/h.
      - 輪胎: Hankook iON 全天候胎 (低抓地力).
      - [新增] 差速器: [無差速器鎖定調整]. 固定限滑或開放式，車手無法在駕駛艙調整.
      - [進階空力] 低風阻設定: 減少風阻係數 (Cd) 比增加下壓力更關鍵. 主要依賴車底擴散器 (Diffuser).
      
      [輪胎與煞車熱管理模型 Tire & Brake Thermal Model]:
      - 輪胎磨損 (Degradation): 極低 (Low). 全天候胎質地硬，可承受整場比賽不換胎. 衰退率幾乎為 0，但過熱會變得滑溜 (Greasy).
      - 工作溫度 (Operating Window): 寬廣但較低. 主要挑戰是排位賽單圈能否快速升溫 (Warm-up).
      - 煞車熱衰 (Brake Fade): 物理煞車極小，極少全負載工作. 真正的 "Fade" 來自電池過熱導致動能回收 (Regen) 功率下降 (De-rating)，迫使車手依賴冷且弱的物理煞車，這非常危險.
      
      [建議調校範圍 Reference Ranges]：
      - 離地高 (Ride Height): [60mm - 80mm].
      - 胎壓 (Tire Pressure): [1.3 - 1.6 bar].
      - 懸吊硬度 (Spring Rate): [前: 90-110 N/mm (Soft), 後: 80-100 N/mm (Soft)].
      - 避震阻尼 (Damping): [壓縮: Soft (軟), 回彈: Fast (快)].
      
      [物理特性]：直驅無換檔、後輪再生煞車極強 (Regen)、無差速器鎖定調整.
      [性能基準]：單圈比 F1 慢 20-25%。接近 F3 水準。
      [平均時速參數]：130-150 km/h (街道賽為主).
      [煞車建議]：關鍵是「Lift & Coast」。煞車點比 F1 早。主要利用馬達回充減速。
    `,
    'GT3': `
      車輛設定：GT3 賽車 (e.g., Porsche 911 GT3 R, AMG GT3)。
      [詳細性能規格]：
      - 動力: ~520-560hp. 車重: ~1250kg. 極速 ~280km/h.
      - [新增] 電控系統: [依賴 ABS (0-11段) 與 TC (0-11段)]. 設定範圍通常為 1-12.
      - [進階空力] Rake (車身俯仰角): 增加車尾高度 (Positive Rake) 可加速車底氣流，大幅提升擴散器效率.
      
      [輪胎與煞車熱管理模型 Tire & Brake Thermal Model]:
      - 輪胎磨損 (Degradation): 線性且可預測 (Linear). Slicks (Pirelli/Michelin) 設計用於耐久賽 (1小時 Stint). 衰退率: 每10圈慢 ~0.3s. 
      - 工作溫度 (Operating Window): [80°C - 100°C]. 注意胎壓隨溫度的增長 (Cold to Hot delta ~4-6 psi).
      - 煞車熱衰 (Brake Fade): 鋼製碟盤 (Steel Rotors). 熱容量有限，長時間高負載 (如 Monza T1) 會導致煞車油沸騰 (Fluid Boil) 或來令片效能下降 (Pad Fade). 需嚴格監控煞車導管 (Ducts) 開口.
      
      [建議調校範圍 Reference Ranges]：
      - 尾翼角度 (Rear Wing): [1° (Low Drag) - 12° (Max Downforce)].
      - 離地高 (Ride Height): [前: 55-65mm, 後: 65-80mm].
      - 懸吊硬度 (Spring Rate): [前: 180-220 N/mm (Medium), 後: 190-230 N/mm (Stiff)].
      - 避震阻尼 (Damping): [Bump: 5-8/10, Rebound: 4-7/10].
      - ABS 設定: [乾地: 3-5, 濕地: 6-9].
      - TC 設定: [出彎: 2-4, 保胎: 5-7].
      - 胎壓 (Tire Pressure): [2.0 - 2.1 bar] (熱胎壓).
      
      [物理特性]：車身較重，慣性大。依賴 ABS 與 TC (循跡系統)。
      [性能基準]：單圈比 F1 慢 20-30 秒。
      [平均時速參數]：160-180 km/h.
      [煞車建議]：煞車距離較長。可重踩觸發 ABS 邊緣，利用重心轉移入彎。
    `,
    'Karting': `
      車輛設定：競技卡丁車 (125cc 2-Stroke, OK/KZ)。
      [詳細性能規格]：
      - 動力: 30-45hp. 車重: ~150kg. 極速 100-140km/h.
      - 無懸吊，實心後軸.
      - [進階空力] 人體空力 (Driver Aero): 直道必須縮頭駝背 (Tuck in) 以減少迎風面積.
      
      [輪胎與煞車熱管理模型 Tire & Brake Thermal Model]:
      - 輪胎磨損 (Degradation): 極度依賴路面條件. 若過度側滑 (Sliding)，胎面溫度瞬間過高會變得 "油膩 (Greasy)" 失去抓地力. 需控制滑動角 (Slip Angle).
      - 工作溫度 (Operating Window): 敏感. 最佳胎壓 (Hot) 通常在 0.8 - 0.9 bar. 冷胎壓設定至關重要.
      - 煞車熱衰 (Brake Fade): 單一後碟盤散熱差. 如果車手習慣 "拖煞車 (Dragging)"，煞車油會瞬間沸騰導致完全失去煞車. 必須用 "點煞" 方式散熱.
      
      [建議調校範圍 Reference Ranges]：
      - 車架硬度: [前扭力桿: Soft/Medium, 後軸: Medium/Hard].
      - 後輪距 (Rear Track Width): [1380mm - 1400mm (Max)].
      - 胎壓 (Tire Pressure): [0.6 - 1.0 bar] (極低).
      - 齒比 (Sprocket): [例如: 11/78 (加速) - 12/75 (尾速)].
      
      [物理特性]：無懸吊、後軸死軸 (Solid Axle)、超高馬力重量比。
      [性能基準]：僅適用於卡丁賽道。
      [平均時速參數]：80-100 km/h (卡丁場).
      [煞車建議]：僅有後煞 (KZ 除外)。需瞬間重煞鎖死後輪幫助車尾滑動入彎 (Rotation)。
    `,
    'RoadCar': `
      車輛設定：高性能街車 (Supercar/Sports Car).
      [詳細性能規格]：
      - 動力: 400-700hp. 車重: >1400kg.
      - 街胎 (Street Tires).
      - [進階空力] 升力抑制 (Lift Reduction): 目標是減少升力以提升高速穩定性.
      
      [輪胎與煞車熱管理模型 Tire & Brake Thermal Model]:
      - 輪胎磨損 (Degradation): 災難性 (High). 街胎無法承受連續賽道負荷. 3-5 圈全力衝刺後，胎塊剝落 (Chunking) 或過熱融化，抓地力呈斷崖式下降.
      - 工作溫度 (Operating Window): 很低 (<80°C). 必須做冷卻圈 (Cool-down laps).
      - 煞車熱衰 (Brake Fade): 主要瓶頸. 煞車油沸騰 (Vapor Lock) 導致踏板變軟 (Spongy)，來令片摩擦係數隨溫度驟降. 必須嚴格管理煞車點，不可延遲煞車.
      
      [建議調校範圍 Reference Ranges]：
      - 胎壓 (Tire Pressure): [冷: 28-30 psi -> 熱: 34-36 psi].
      - 懸吊硬度 (Spring Rate): [前: 40-80 N/mm (Soft), 後: 50-90 N/mm (Soft)].
      - 避震阻尼 (Damping): [壓縮: Medium, 回彈: Slow (慢)].
      
      [物理特性]：懸吊軟、側傾大、煞車與輪胎極易熱衰竭。
      [性能基準]：比 GT3 慢很多。彎中速度受限於輪胎物理抓地力。
      [平均時速參數]：110-130 km/h.
      [煞車建議]：煞車點需非常早。不可過度依賴煞車，需控制熱量。
    `
  };

  const selectedVehicleContext = vehicleContexts[vehicle];

  // Logic for Image Markers
  let markerContext = "";
  if (mediaType === 'image') {
    const markerHints = markers.map((m, i) => {
      let hPos = m.x < 33 ? "左側(Left)" : m.x > 66 ? "右側(Right)" : "中間(Center)";
      let vPos = m.y < 33 ? "上方(Top)" : m.y > 66 ? "下方(Bottom)" : "中間(Middle)";
      return `   - 標記 ${i+1}: 位於圖片水平 ${Math.round(m.x)}%, 垂直 ${Math.round(m.y)}% 的位置 (${hPos}-${vPos})`;
    }).join('\n');

    markerContext = markers.length > 0
      ? `
        ***[極重要：使用者標記優先模式]***
        使用者在圖片上「已經」繪製了紅色的圓形標記。
        座標提示:
        ${markerHints}

        你的唯一任務是分析「被標記」的那些彎道。
        1. 【視覺搜尋】：根據座標找到紅色圓圈。
        2. 【位置鎖定】：確認該標記是哪個彎角。
        3. 【資料寫入】：'number' 必須對應標記數字。
        4. 【內容分析】：針對該彎道物理特性。
        5. 【命名備註】：'name' 欄位備註真實名稱。
        
        原則上 corners 陣列長度 = 使用者標記數量。
        絕對不要重新編號。
      `
      : `請自動辨識賽道上的關鍵彎道，並按照賽道行進順序為它們編號。`;
  } else {
    // Video Context
    let videoModeInstruction = "";
    switch (videoMode) {
      case 'FullLap': videoModeInstruction = "分析完整單圈 (Full Lap)。"; break;
      case 'KeyCorners': videoModeInstruction = "僅分析關鍵彎道 (Key Corners)。"; break;
      case 'SpecificSection': videoModeInstruction = "分析特定區段 (Specific Section)。"; break;
    }
    markerContext = `***[影片分析模式 Video Mode]***: ${videoMode} - ${videoModeInstruction}`;
  }

  // User info
  let userTrackInfo = trackName ? `使用者指定的賽道名稱: "${trackName}"。\n` : "";
  let mathInstruction = "";
  if (trackLength) {
    const lengthM = parseFloat(trackLength);
    const lengthKm = lengthM / 1000;
    mathInstruction = `***[物理運算]*** 賽道長度: ${lengthKm.toFixed(2)} km. 使用公式 Time = Distance / Speed 檢核單圈時間.`;
  }

  const prompt = `
    你是一位世界級的賽車工程師，專精於數據遙測與賽道分析。
    請詳細分析提供的${mediaType === 'video' ? '影片' : '影像'}。
    
    ${weatherContext}
    ${selectedVehicleContext}
    ${userTrackInfo}
    ${mathInstruction}
    ${markerContext}
    
    請注意：所有文字說明必須使用 **繁體中文 (Traditional Chinese)** 回答。
    
    請辨識：
    1. 賽道名稱。
    2. 關鍵彎道詳細分析。
    3. 煞車點與煞車力度。
    4. 建議檔位。
    5. 車輛調校建議 (參考 [建議調校範圍])。
    6. [空力調校策略]: 請針對空氣動力學設定 (翼片角度、空力平衡、阻力管理) 提供獨立的詳細分析與建議。
    7. [進站策略 (Pit Strategy)]: 基於 [輪胎與煞車熱管理模型] 與賽道特性(磨耗/進站損失時間)，提供詳細策略：
       - 首選策略 (Primary): 停站次數、輪胎配方順序 (e.g., C4 Soft -> C3 Med)、進站窗口 (Lap x-y).
       - 替代策略 (Alternative): 若輪胎衰退嚴重或遇上 SC 的備案.
       - 關鍵提示: Undercut 效應強弱或輪胎暖胎 (Warm-up) 難度.
    8. [獲勝關鍵]: 請總結一條精簡有力的 "獲勝關鍵 (Key to Win)"，例如 "排位賽順位至關重要" 或 "管理後輪熱衰竭是決勝點"。
    9. 預估區段時間與單圈時間 (必須基於物理現實或真實紀錄)。區段數據需包含「時間數值」與「特性描述」。
    
    *** 禁止在 'type', 'name' 或 'advice' 中使用「左/右 (Left/Right)」方向詞彙 ***
    
    嚴格遵守 JSON schema。
    注意：'detailedSetup' 需包含 Trend (Soft/Stiff等)。
    'type' 欄位描述幾何類型 (例如：髮夾彎)。
    
    [新增] 'racingLineSVG':
    對於每個彎道，請生成一個簡單的 SVG path 'd' 字串 (基於 100x100 的畫布)。
    這個路徑應該描繪出該彎道的「理想賽車路線 (Geometric Line)」。
    - 假設入口在底部 (50, 100) 或左下。
    - 描繪出彎道的形狀與 Apex。
    - 範例: "M 50 100 Q 50 50 90 50" (代表一個向右的 90 度彎).
    - 這將用於前端視覺化，請盡量讓線條圓滑 (使用 Q 或 C 指令)。
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      circuitName: { type: Type.STRING },
      locationGuess: { type: Type.STRING },
      totalCorners: { type: Type.INTEGER },
      overallCharacter: { type: Type.STRING },
      corners: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            number: { type: Type.INTEGER },
            name: { type: Type.STRING, nullable: true },
            type: { type: Type.STRING, description: "NO Left/Right direction info." },
            brakingZone: { type: Type.STRING, enum: ['Heavy', 'Medium', 'Light', 'Lift', 'Flat-out'] },
            difficulty: { type: Type.INTEGER },
            advice: { type: Type.STRING },
            gear: { type: Type.INTEGER, nullable: true },
            racingLineSVG: { type: Type.STRING, description: "Abstract SVG path 'd' for 100x100 box depicting the corner shape/line." }
          },
          required: ["number", "type", "brakingZone", "advice", "difficulty"]
        }
      },
      strategy: {
        type: Type.OBJECT,
        properties: {
          tireWear: { type: Type.STRING },
          keyToWin: { type: Type.STRING, description: "A concise winning strategy summary" },
          aeroStrategy: { type: Type.STRING, description: "Dedicated aerodynamic setup advice" },
          pitStrategy: { type: Type.STRING, description: "Detailed pit stop strategy (Windows, Compounds, Stops)" },
          overtakingOpportunities: { type: Type.STRING },
          setupSuggestion: { type: Type.STRING },
          detailedSetup: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                component: { type: Type.STRING },
                value: { type: Type.STRING },
                unit: { type: Type.STRING },
                trend: { type: Type.STRING, enum: ['Soft', 'Medium', 'Stiff', 'Low', 'High', 'Balanced'] }
              },
              required: ["component", "value", "trend"]
            }
          }
        },
        required: ["tireWear", "keyToWin", "aeroStrategy", "pitStrategy", "overtakingOpportunities", "setupSuggestion", "detailedSetup"]
      },
      sectorStats: {
        type: Type.OBJECT,
        properties: {
          sector1: { 
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Estimated Time e.g., '32.1s'" },
              description: { type: Type.STRING, description: "Brief characteristics description" }
            },
            required: ["time", "description"]
          },
          sector2: { 
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Estimated Time e.g., '45.2s'" },
              description: { type: Type.STRING, description: "Brief characteristics description" }
            },
            required: ["time", "description"]
          },
          sector3: { 
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Estimated Time e.g., '28.4s'" },
              description: { type: Type.STRING, description: "Brief characteristics description" }
            },
            required: ["time", "description"]
          },
          estimatedLapTime: { type: Type.STRING }
        },
        required: ["sector1", "sector2", "sector3", "estimatedLapTime"]
      }
    },
    required: ["circuitName", "corners", "strategy", "overallCharacter", "sectorStats"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType, 
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as TrackAnalysis;
    result.vehicle = vehicle;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the media. Please try again.");
  }
};