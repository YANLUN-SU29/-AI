

import { GoogleGenAI, Type } from "@google/genai";
import { TrackAnalysis, WeatherCondition, VehicleType, MapMarker } from '../types';

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
 * Analyzes the F1 track image using Gemini 2.5 Flash
 * @param imageInput Can be a File object or a Base64 Data URL string
 * @param weather Weather condition
 * @param vehicle Vehicle type context
 * @param markers Array of markers with coordinates
 * @param trackName Optional user provided track name
 * @param trackLength Optional user provided track length in meters
 */
export const analyzeTrackImage = async (
  imageInput: File | string, 
  weather: WeatherCondition,
  vehicle: VehicleType,
  markers: MapMarker[] = [],
  trackName: string = '',
  trackLength: string = ''
): Promise<TrackAnalysis> => {
  
  let base64Data = "";

  if (typeof imageInput === 'string') {
    // If input is a data URL string (e.g. from canvas), strip the prefix
    base64Data = imageInput.split(',')[1];
  } else {
    // If input is a File object
    base64Data = await fileToGenerativePart(imageInput);
  }

  const weatherContext = weather === 'Wet' 
    ? '目前賽道狀況為：雨天 (Wet)。請務必針對濕地駕駛調整建議：煞車點通常需要更早且更平順，賽車路線應避開路面橡膠堆積區 (Rain Line)，單圈時間通常會比乾地慢 10-15% 甚至更多。' 
    : '目前賽道狀況為：晴天 (Dry)。請針對標準乾地駕駛提供最佳性能建議 (Slicks)。';

  // Detailed engineering contexts for each vehicle type
  const vehicleContexts: Record<VehicleType, string> = {
    'F1': `
      車輛設定：Formula 1 (F1)。
      [詳細性能規格]：
      - 動力: ~1000hp, 車重: 798kg. 極速 >330km/h.
      - 過彎 G 值: 5.0G - 6.0G. 下壓力等級: 極高.
      - 煞車: 碳纖維盤, 需高溫工作.
      - [新增] DRS 減阻系統 (DRS Drag Reduction): 開啟後尾翼主板平放，減少阻力並提升直線尾速 15-20 km/h.
      - [新增] ERS 電能釋放 (ERS Energy Deployment): MGU-K 提供 160hp 輔助動力，需優化單圈能量部屬 (Deployment) 與回收 (Harvesting) 策略.
      
      [建議調校範圍 Reference Ranges]：
      - 前翼角度 (Front Wing): [Monza: 10°-18°] | [Spa/Suzuka: 28°-35°] | [Monaco: 45°-50°+].
      - 後翼 (Rear Wing): 對應前翼平衡.
      - 離地高 (Ride Height): [前: 4-6mm, 後: 5-7mm] (極低, 需考量彈跳 Porpoising).
      - 胎壓 (Tire Pressure): [前: 22.0-24.0 psi, 後: 20.0-22.0 psi] (熱胎壓).
      - 懸吊硬度 (Spring Rate): [前: 200-250 N/mm (Stiff), 後: 160-200 N/mm (Stiff)] (極硬以支撐空力負載).
      - 避震阻尼 (Damping): [高速壓縮: Stiff (硬), 低速回彈: Medium (中)] (控制 Pitch/Heave).
      - 防傾桿 (ARB): [前: Hard (硬-轉向反應), 後: Soft (軟-出彎牽引)].
      
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
      - [新增] 差速器: [無差速器鎖定調整 (No Differential Lock Adjustment)]. 為開放式差速器，依賴機械抓地力與動能回收平衡.
      
      [建議調校範圍 Reference Ranges]：
      - 離地高 (Ride Height): [60mm - 80mm] (適應街道顛簸).
      - 胎壓 (Tire Pressure): [1.3 - 1.6 bar] (較低以增加接地面積).
      - 懸吊硬度 (Spring Rate): [前: 90-110 N/mm (Soft), 後: 80-100 N/mm (Soft)] (較軟以適應街道顛簸).
      - 避震阻尼 (Damping): [壓縮: Soft (軟-吸震), 回彈: Fast/Soft (快/軟-保持接地)].
      - 動能回收 (Regen Level): [前端: 250kW, 後端: 350kW] (軟體設定).
      - 煞車平衡 (Bias): 偏後 (依賴馬達 Regen).
      
      [物理特性]：直驅無換檔、後輪再生煞車極強 (Regen)、無差速器鎖定調整.
      [性能基準]：單圈比 F1 慢 20-25%。接近 F3 水準。
      [平均時速參數]：130-150 km/h (街道賽為主).
      [煞車建議]：關鍵是「Lift & Coast」。煞車點比 F1 早。主要利用馬達回充減速。
    `,
    'GT3': `
      車輛設定：GT3 賽車 (e.g., Porsche 911 GT3 R, AMG GT3)。
      [詳細性能規格]：
      - 動力: ~520-560hp. 車重: ~1250kg. 極速 ~280km/h.
      - [新增] 電控系統: [依賴 ABS (0-11段) 與 TC (0-11段)]. 可在駕駛艙即時調整，針對輪胎磨損狀況改變介入程度.
      
      [建議調校範圍 Reference Ranges]：
      - 尾翼角度 (Rear Wing): [1° (Low Drag) - 12° (Max Downforce)].
      - 離地高 (Ride Height): [前: 55-65mm, 後: 65-80mm] (Rake 角度重要).
      - 懸吊硬度 (Spring Rate): [前: 180-220 N/mm (Medium-Stiff), 後: 190-230 N/mm (Stiff)] (視引擎配置).
      - 避震阻尼 (Damping): [Bump: 5-8/10 (Medium), Rebound: 4-7/10 (Medium-Soft)] (4-Way Adjustable).
      - ABS 設定: [乾地: 3-5, 濕地: 6-9].
      - TC 設定: [出彎: 2-4, 保胎: 5-7].
      - 胎壓 (Tire Pressure): [2.0 - 2.1 bar] (熱胎壓 Hot).
      
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
      
      [建議調校範圍 Reference Ranges]：
      - 車架硬度 (Chassis Stiffness): [前扭力桿: Soft/Medium/Stiff (可調), 後軸: Medium/Hard (Type N/H)].
      - 座椅支撐桿 (Seat Stays): [每側 1-2 支] (越多越 Stiff (硬)，增加後輪抓地力).
      - 後輪距 (Rear Track Width): [1380mm - 1400mm (Max)]. (寬=Stable (穩)/Grip, 窄=Loose (滑)/Agile).
      - 前輪距 (Front Track): 透過墊片調整. (寬=Precise (精準), 窄=Slow Response (慢)).
      - 胎壓 (Tire Pressure): [0.6 - 1.0 bar] (極低，視氣溫而定).
      - 齒比 (Sprocket): [例如: 11/78 (加速) - 12/75 (尾速)]. 需依直道長度調整.
      
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
      
      [建議調校範圍 Reference Ranges]：
      - 胎壓 (Tire Pressure): [冷: 28-30 psi -> 熱: 34-36 psi]. (避免超過 38psi).
      - 懸吊硬度 (Spring Rate): [前: 40-80 N/mm (Soft), 後: 50-90 N/mm (Soft)] (一般偏軟).
      - 避震阻尼 (Damping): [壓縮: Medium (中), 回彈: Slow/Stiff (慢/硬)] (控制車身側傾). 若為電子避震請切換至 Track/Corsa (Stiff) 模式.
      - 若為改裝避震 (Coilovers): 建議設定 [前: 10-12kg, 後: 8-10kg].
      - 來令片 (Pads): 建議升級高溫賽道片 (Endurance/Sprint).
      
      [物理特性]：懸吊軟、側傾大、煞車與輪胎極易熱衰竭。
      [性能基準]：比 GT3 慢很多。彎中速度受限於輪胎物理抓地力。
      [平均時速參數]：110-130 km/h.
      [煞車建議]：煞車點需非常早。不可過度依賴煞車，需控制熱量。
    `
  };

  const selectedVehicleContext = vehicleContexts[vehicle];

  // Generate coordinate hints for the AI
  const markerHints = markers.map((m, i) => {
    // Convert 0-100% to rough quadrant description
    let hPos = m.x < 33 ? "左側(Left)" : m.x > 66 ? "右側(Right)" : "中間(Center)";
    let vPos = m.y < 33 ? "上方(Top)" : m.y > 66 ? "下方(Bottom)" : "中間(Middle)";
    return `   - 標記 ${i+1}: 位於圖片水平 ${Math.round(m.x)}%, 垂直 ${Math.round(m.y)}% 的位置 (${hPos}-${vPos})`;
  }).join('\n');

  const markerContext = markers.length > 0
    ? `
      ***[極重要：使用者標記優先模式]***
      使用者在圖片上「已經」繪製了紅色的圓形標記，內有白色數字（例如 1, 2, 3...）。
      
      為了協助你精準定位，以下是每個標記在圖片中的座標提示 (Coordinate Hints)：
      ${markerHints}

      你的唯一任務是分析「被標記」的那些彎道。請嚴格執行以下步驟：
      
      1. 【視覺搜尋】：根據上述座標提示，用電腦視覺在圖片中找到對應位置的紅色圓圈標記。
      2. 【位置鎖定】：確認該標記 "1" 位於賽道的哪個彎角。
      3. 【資料寫入】：在 JSON 的 corners 陣列中，建立一個物件，其 'number' 欄位必須為 1。
      4. 【內容分析】：該物件的 'advice' (建議)、'brakingZone' (煞車區) 等內容，必須是針對「標記 1 所在位置」的物理特性進行分析。
      5. 【命名備註】：在 'name' 欄位中，除了寫彎道名稱，請務必括號備註其真實身份。例如："使用者標記 1 (鈴鹿 T7 Dunlop Curve)"。
      
      請對圖片上所有的標記數字重複此步驟。
      
      ***嚴格限制***：
      - JSON output 的 corners 陣列長度，原則上應該等於使用者標記的數量。
      - 絕對不要重新編號。使用者的標記 1 就是 JSON number 1。
    `
    : `
      請自動辨識賽道上的關鍵彎道，並按照賽道行進順序為它們編號 (1, 2, 3...)。
    `;

  // Construction of user provided info context
  let userTrackInfo = "";
  if (trackName) {
    userTrackInfo += `使用者指定的賽道名稱為: "${trackName}"。請優先使用此賽道真實存在的數據。\n`;
  }
  
  let mathInstruction = "";
  if (trackLength) {
    const lengthM = parseFloat(trackLength);
    const lengthKm = lengthM / 1000;
    userTrackInfo += `使用者指定的賽道總長度為: ${lengthM} 公尺 (${lengthKm.toFixed(2)} km)。\n`;
    mathInstruction = `
      ***[物理運算強制指令]***
      使用者已提供賽道長度: ${lengthKm.toFixed(2)} km。
      你必須利用物理公式檢核估算的單圈時間： Time = Distance / Speed。
      請參考上方提供的 [詳細性能規格] 中的極速與平均時速參數來進行計算。
      例如：若為 F1 且賽道長 ${lengthKm.toFixed(2)} km，且乾地平均時速約 230 km/h。
      預估時間應接近 (${lengthKm.toFixed(2)} / 230) * 60 分鐘。
      請務必進行此數學運算，不要憑空猜測時間。
    `;
  } else {
    mathInstruction = `
      由於使用者未提供賽道長度，請嘗試辨識這是哪個知名賽道。
      若無法辨識，請根據圖片中的彎道密集度與直線比例，估算一個合理的賽道長度與單圈時間。
      切勿給出物理上不可能的數字（例如卡丁車在 5km 賽道跑 1 分鐘）。
    `;
  }

  const prompt = `
    你是一位世界級的賽車工程師，專精於數據遙測與賽道分析。
    請極度詳細地分析提供的賽道圖影像。
    
    ${weatherContext}
    ${selectedVehicleContext}
    
    ${userTrackInfo}
    ${mathInstruction}
    
    ${markerContext}
    
    請注意：所有文字說明必須使用 **繁體中文 (Traditional Chinese, Taiwan usage)** 回答。
    
    請辨識以下資訊：
    1. 賽道名稱（若是自製賽道請描述其特徵）。
    2. 關鍵彎道的詳細分析。
    3. 每個關鍵彎道的煞車點與煞車力度（請根據車輛類型的 [詳細性能規格] 如 G 值限制與抓地力來調整分析）。
       例如：F1 可在高速彎全油門 (Flat-out) 但街車可能需要重煞 (Heavy)。
    4. 建議檔位 (根據車型調整，Formula E 與單速卡丁車顯示為 1 或直驅)。
    5. 整體車輛調校建議 (下壓力、懸吊軟硬、齒比、Formula E 需包含電量策略)。
       * [極重要] 你的調校建議必須具體參考上方的 [建議調校範圍 Reference Ranges]。
       * 請在 JSON 的 'detailedSetup' 陣列中，填入 4-6 項最關鍵的調校數值建議。
       * 例如：Component="Front Wing", Value="28", Unit="deg", Trend="High".
    6. [極重要] 預估此車型在此賽道的三個計時區段 (Sector 1, Sector 2, Sector 3) 時間以及單圈總時間。
       * 必須基於物理現實：若辨識出是真實存在的賽道 (如 Suzuka, Spa, Silverstone)，**必須** 使用該賽道該車種的真實歷史最快單圈紀錄 (Lap Record) 或排位賽成績作為基準進行微調。
    
    請嚴格遵守 JSON schema 回傳資料。
    注意：'brakingZone' 欄位必須保留英文 enum 值以便程式判讀：'Heavy', 'Medium', 'Light', 'Lift', 'Flat-out'。
    'difficulty' 使用 1 到 10 的數值。
    
    'type' 欄位請單純描述彎道幾何類型 (例如：髮夾彎、減速彎、高速彎、直角彎)。
    *** 極度重要：禁止在 'type', 'name' 或 'advice' 中提及「左轉」、「右轉」、「Left」、「Right」等方向性詞彙。AI 不需要判斷轉向方向，只需分析彎道銳利度與通過技巧。 ***
  `;

  // Define the schema for structured JSON output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      circuitName: { type: Type.STRING, description: "Name of the track in Traditional Chinese" },
      locationGuess: { type: Type.STRING, description: "City or Country location in Traditional Chinese" },
      totalCorners: { type: Type.INTEGER },
      overallCharacter: { type: Type.STRING, description: "Short summary of track characteristics in Traditional Chinese" },
      corners: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            number: { type: Type.INTEGER },
            name: { type: Type.STRING, nullable: true, description: "Corner name in Chinese. If mapped from a marker, include official name in brackets." },
            type: { type: Type.STRING, description: "Corner type description (e.g., Hairpin, Chicane). STRICTLY NO Left/Right direction info." },
            brakingZone: { type: Type.STRING, enum: ['Heavy', 'Medium', 'Light', 'Lift', 'Flat-out'] },
            difficulty: { type: Type.INTEGER },
            advice: { type: Type.STRING, description: `Racing line and technique advice in Traditional Chinese, specifically for ${vehicle} in ${weather} conditions. Do NOT mention turn direction (left/right).` },
            gear: { type: Type.INTEGER, description: "Estimated gear selection", nullable: true }
          },
          required: ["number", "type", "brakingZone", "advice", "difficulty"]
        }
      },
      strategy: {
        type: Type.OBJECT,
        properties: {
          tireWear: { type: Type.STRING, description: "Tire wear analysis in Traditional Chinese" },
          overtakingOpportunities: { type: Type.STRING, description: "Overtaking advice in Traditional Chinese" },
          setupSuggestion: { type: Type.STRING, description: "Text summary of setup suggestions" },
          detailedSetup: {
            type: Type.ARRAY,
            description: "List of 4-6 specific setup parameters with values",
            items: {
              type: Type.OBJECT,
              properties: {
                component: { type: Type.STRING, description: "Name of setting (e.g., Front Wing)" },
                value: { type: Type.STRING, description: "Numerical value or range (e.g., 28-30)" },
                unit: { type: Type.STRING, description: "Unit (e.g., deg, psi, N/mm)" },
                trend: { 
                  type: Type.STRING, 
                  enum: ['Soft', 'Medium', 'Stiff', 'Low', 'High', 'Balanced'],
                  description: "Qualitative description for visualization color coding" 
                }
              },
              required: ["component", "value", "trend"]
            }
          }
        },
        required: ["tireWear", "overtakingOpportunities", "setupSuggestion", "detailedSetup"]
      },
      sectorStats: {
        type: Type.OBJECT,
        properties: {
          sector1: { type: Type.STRING, description: "Estimated time for Sector 1" },
          sector2: { type: Type.STRING, description: "Estimated time for Sector 2" },
          sector3: { type: Type.STRING, description: "Estimated time for Sector 3" },
          estimatedLapTime: { type: Type.STRING, description: "Total estimated lap time" }
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
              mimeType: "image/jpeg", // When using canvas base64, usually jpeg or png
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
    if (!text) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(text) as TrackAnalysis;
    // Inject vehicle type into result for UI display
    result.vehicle = vehicle;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the track image. Please try again.");
  }
};