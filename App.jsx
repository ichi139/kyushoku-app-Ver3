import React, { useState } from 'react';
import { Utensils, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [rice, setRice] = useState('');
  const [main, setMain] = useState('');
  const [side, setSide] = useState('');
  const [soup, setSoup] = useState('');
  const [milk, setMilk] = useState('ぎゅうにゅう');
  const [dessert, setDessert] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 簡易的な日本語→英語変換辞書（AIの理解度を高めるため）
  const translateToEnglish = (text) => {
    if (!text) return '';
    let t = text.trim();
    
    const dictionary = {
      'ごはん': 'rice', '麦ごはん': 'barley rice', 'むぎごはん': 'barley rice',
      '食パン': 'slice of bread', 'パン': 'bread', 'コッペパン': 'sub roll bread', 'あげぱん': 'fried bread',
      'ハンバーグ': 'hamburger steak', 'カレー': 'curry and rice', 'ぽーくかれー': 'pork curry',
      'からあげ': 'fried chicken', '唐揚げ': 'fried chicken', 'コロッケ': 'croquette',
      'サラダ': 'salad', 'かいそうサラダ': 'seaweed salad', '海藻サラダ': 'seaweed salad',
      'スープ': 'soup', 'みそしる': 'miso soup', '味噌汁': 'miso soup', '豚汁': 'pork miso soup',
      'ぎゅうにゅう': 'milk', '牛乳': 'carton of milk',
      'りんご': 'apple', 'みかん': 'mandarin orange', 'ゼリー': 'jelly dessert'
    };

    // 辞書に一致するものがあれば置き換え、なければそのままする
    for (const [key, value] of Object.entries(dictionary)) {
      if (t.includes(key)) {
        t = t.replace(key, value);
      }
    }
    return t;
  };

  // 献立から英語プロンプトを生成する関数
  const generatePrompt = () => {
    const items = [];
    if (rice) items.push(translateToEnglish(rice));
    if (main) items.push(translateToEnglish(main));
    if (side) items.push(translateToEnglish(side));
    if (soup) items.push(translateToEnglish(soup));
    if (milk) items.push(translateToEnglish(milk));
    if (dessert) items.push(translateToEnglish(dessert));

    if (items.length === 0) return '';

    const menuString = items.join(', ');
    return `A cute Japanese elementary school lunch tray (Kyushoku) layout containing: ${menuString}. bright pop anime style, clean lines, colorful, vector graphic feel, top-down isometric view, clean background, bright appetite-inducing visual for kids, high resolution.`;
  };

  // 画像生成APIを呼び出す関数
  const callGenerateApi = async (prompt) => {
    // ↓↓ ★ここに取得したAPIキーを入れてください★ ↓↓
    const apiKey = "AQ.Ab8RN6JXb17jD9clF8s4rOPC9MCenjmxkO8x4WApx9GHk2GJhQ"; 
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"]
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '画像の生成に失敗しました');
    }

    const data = await response.json();
    
    // 生成結果から画像データ(Base64)を取得
    const candidates = data.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('画像が生成されませんでした。別の入力で試してみてください。');
  };

  // ボタンを押した時の処理
  const handleGenerate = async () => {
    const generatedPrompt = generatePrompt();
    if (!generatedPrompt) {
      setError('こんだてを ひとつ以上 入力してください');
      return;
    }

    setPromptText(generatedPrompt);
    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const resultImageUrl = await callGenerateApi(generatedPrompt);
      setImageUrl(resultImageUrl);
    } catch (err) {
      setError(err.message || 'イラストの作成に失敗しました。もう一度ためしてね。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <header className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 flex items-center space-x-4">
          <div className="bg-amber-500 text-white p-3 rounded-xl shadow-sm">
            <Utensils className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-900 tracking-tight">
              きゅうしょく いらすと めーかー
            </h1>
            <p className="text-sm text-amber-700">
              きょうの こんだてを 入力して、かわいい イラストを つくろう！
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* フォームエリア */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 space-y-4">
            <h2 className="text-lg font-bold text-amber-900 border-b border-amber-100 pb-2">
              こんだてを 入力してね
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-amber-800 mb-1">主食（ごはん・パン）</label>
                <input
                  type="text"
                  placeholder="例: むぎごはん、食パン"
                  value={rice}
                  onChange={(e) => setRice(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-800 mb-1">主菜（メインのおかず）</label>
                <input
                  type="text"
                  placeholder="例: ハンバーグ、カレー"
                  value={main}
                  onChange={(e) => setMain(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-800 mb-1">副菜（サラダ・あえもの）</label>
                <input
                  type="text"
                  placeholder="例: かいそうサラダ"
                  value={side}
                  onChange={(e) => setSide(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-800 mb-1">汁物（スープ・味噌汁）</label>
                <input
                  type="text"
                  placeholder="例: 味噌汁、スープ"
                  value={soup}
                  onChange={(e) => setSoup(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-amber-800 mb-1">飲み物</label>
                  <input
                    type="text"
                    value={milk}
                    onChange={(e) => setMilk(e.target.value)}
                    className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-800 mb-1">デザート</label>
                  <input
                    type="text"
                    placeholder="例: りんご、ゼリー"
                    value={dessert}
                    onChange={(e) => setDessert(e.target.value)}
                    className="w-full p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>いらすとを つくっています...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>このこんだてで いらすとを つくる</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* イラスト表示エリア */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-lg font-bold text-amber-900 border-b border-amber-100 pb-2 mb-4">
                できあがった いらすと
              </h2>

              <div className="aspect-square bg-amber-50/50 border-2 border-dashed border-amber-200 rounded-2xl flex items-center justify-center overflow-hidden relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="給食のイラスト" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6 text-amber-400">
                    <Utensils className="w-16 h-16 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-bold">ここに イラストが ひょうじ されます</p>
                  </div>
                )}
              </div>
            </div>

            {promptText && (
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800 mb-1">AIへの指示文（自動英語化済）:</p>
                <p className="text-xs text-amber-700 font-mono break-all">{promptText}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
