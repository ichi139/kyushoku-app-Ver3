import React, { useState } from 'react';
import { 
  Utensils, 
  Calendar, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Palette,
  ChefHat,
  ArrowLeft,
  Printer
} from 'lucide-react';

export default function App() {
  const [activeStep, setActiveStep] = useState('input');
  
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [title, setTitle] = useState('みんなだいすき かれーらいす');
  const [mainDish, setMainDish] = useState('ぽーくかれー (むぎごはん)');
  const [sideDish, setSideDish] = useState('かいそうと つなの さらだ');
  const [soup, setSoup] = useState('');
  const [dessert, setDessert] = useState('りんご');
  const [drink, setDrink] = useState('ぎゅうにゅう');
  const [artStyle, setArtStyle] = useState('picturebook');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);

  const artStyles = [
    { id: 'picturebook', name: 'えほん ふう（やさしい てがき）', promptStyle: 'cute picture book illustration style, warm soft hand-drawn lines, whimsical' },
    { id: 'watercolor', name: 'みずいろ ふう（ふんわり すいさい）', promptStyle: 'soft pastel watercolor illustration, gentle textures, cheerful colors' },
    { id: '3d', name: '3D 粘土ふう（ぷっくり かわいい）', promptStyle: 'cute 3D claymation style, vibrant, smooth, soft lighting' },
    { id: 'pop', name: 'くっきり ふう（あかるい イラスト）', promptStyle: 'bright pop anime style, clean lines, colorful, vector graphic feel' }
  ];

  const buildPrompt = () => {
    const items = [mainDish, sideDish, soup, dessert, drink].filter(item => item.trim() !== '');
    const selectedStyle = artStyles.find(s => s.id === artStyle)?.promptStyle || artStyles[0].promptStyle;
    
    return `A cute Japanese elementary school lunch tray (Kyushoku) layout containing: ${items.join(', ')}. ${selectedStyle}, top-down isometric view, clean background, bright appetite-inducing visual for kids, high resolution.`;
  };

  const callGenerateApi = async (promptText) => {
    const apiKey = "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;

    const delays = [1000, 2000, 4000, 8000];
    let response;

    for (let i = 0; i <= delays.length; i++) {
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: "image/png" }
          })
        });
        if (response.ok) break;
      } catch (err) {
        if (i === delays.length) throw err;
      }
      if (i < delays.length) {
        await new Promise(r => setTimeout(r, delays[i]));
      }
    }

    if (!response || !response.ok) {
      throw new Error('いらすとを つくることが できませんでした。もういちど ためしてください。');
    }

    const data = await response.json();
    const base64Bytes = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Bytes) {
      throw new Error('いらすとデータが みつかりませんでした。');
    }

    return `data:image/png;base64,${base64Bytes}`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    setActiveStep('result');

    const prompt = buildPrompt();
    setCustomPrompt(prompt);

    try {
      const imgUrl = await callGenerateApi(prompt);
      setGeneratedImageUrl(imgUrl);
      
      const newHistoryItem = {
        id: Date.now(),
        date,
        title,
        imgUrl,
        items: [mainDish, sideDish, soup, dessert, drink].filter(Boolean)
      };
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 5)]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'いらすとを つくるときに えらーが おきました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!customPrompt) return;
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const imgUrl = await callGenerateApi(customPrompt);
      setGeneratedImageUrl(imgUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg('もういちど つくるのに しっぱいしました: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `kyushoku-${date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-amber-50/50 text-slate-800 font-sans pb-12">
      <header className="bg-white border-b border-amber-200 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 text-white p-2 rounded-xl shadow-sm">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900 tracking-tight">きゅうしょく いらすと めーかー</h1>
              <p className="text-xs text-amber-700">こんだてを にゅうりょくするだけで かわいい いらすとが できるよ</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-amber-100/60 p-1 rounded-lg">
            <button
              onClick={() => setActiveStep('input')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1 ${
                activeStep === 'input' 
                  ? 'bg-white text-amber-900 shadow-sm' 
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. こんだて にゅうりょく</span>
            </button>
            <button
              onClick={() => {
                if (generatedImageUrl || isGenerating) setActiveStep('result');
              }}
              disabled={!generatedImageUrl && !isGenerating}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1 ${
                activeStep === 'result' 
                  ? 'bg-white text-amber-900 shadow-sm' 
                  : 'text-amber-700 hover:text-amber-900 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>2. いらすと かくにん</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6">
        {activeStep === 'input' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-2 backdrop-blur-sm">
                  がっこう・ほいくえん・ようちえん の けいじぶつ に
                </span>
                <h2 className="text-2xl font-bold mb-2">きょうの こんだてから いらすとを つくろう</h2>
                <p className="text-sm text-amber-50">
                  ひづけと メニューを 入力すると、おいしそうな 給食の いらすとが 自動で 作成されます。
                </p>
              </div>
              <ChefHat className="absolute -right-4 -bottom-4 w-40 h-40 text-white/10 rotate-12 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-amber-100 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    <span>こんだての じょうほう</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ひづけ</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">こんだて の なまえ・たいとる</label>
                    <input
                      type="text"
                      placeholder="れい: たなばた メニュー"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">メニュー の なかみ</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">しゅしょく (ごはん・ぱん など)</label>
                      <input
                        type="text"
                        placeholder="れい: ごはん、こっぺぱん"
                        value={mainDish}
                        onChange={(e) => setMainDish(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">しゅさい (おくず・メイン)</label>
                      <input
                        type="text"
                        placeholder="れい: はんばーぐ、ハンバーグ"
                        value={sideDish}
                        onChange={(e) => setSideDish(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">ふくさい (サラダ・おかず)</label>
                      <input
                        type="text"
                        placeholder="れい: つな さらだ"
                        value={soup}
                        onChange={(e) => setSoup(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">しるもの (スープ・みそしる)</label>
                      <input
                        type="text"
                        placeholder="れい: とんじる、スープ"
                        value={dessert}
                        onChange={(e) => setDessert(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">くだもの・のみもの</label>
                        <input
                          type="text"
                          placeholder="れい: りんご、ぎゅうにゅう"
                          value={drink}
                          onChange={(e) => setDrink(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center space-x-1">
                    <Palette className="w-4 h-4 text-amber-500" />
                    <span>いらすと の えらがら（タッチ）を えらぶ</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {artStyles.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setArtStyle(style.id)}
                        className={`p-3 text-left rounded-xl border transition-all text-xs flex items-start space-x-2 ${
                          artStyle === style.id
                            ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 font-medium text-amber-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full mt-0.5 border flex items-center justify-center ${
                          artStyle === style.id ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                        }`}>
                          {artStyle === style.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="font-semibold">{style.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleGenerate}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center space-x-2 text-base"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>このこんだてで いらすとを つくる</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-amber-100/50 border border-amber-200/60 rounded-2xl p-5">
                  <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>つかいかた の ひんと</span>
                  </h4>
                  <ul className="text-xs text-amber-800/90 space-y-2 list-disc list-inside leading-relaxed">
                    <li>メニューの なまえを くわしく かくと、きれいな いらすとが できます。</li>
                    <li>「かれーらいす」「はんばーぐ」などが おすすめです。</li>
                  </ul>
                </div>

                {history.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 text-sm mb-3">さいきん つくった いらすと</h4>
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => {
                            setDate(item.date);
                            setTitle(item.title);
                            setGeneratedImageUrl(item.imgUrl);
                            setActiveStep('result');
                          }}
                          className="flex items-center space-x-3 p-2 rounded-xl border border-slate-100 hover:bg-amber-50/50 cursor-pointer transition-all"
                        >
                          <img 
                            src={item.imgUrl} 
                            alt={item.title} 
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeStep === 'result' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
              <button
                onClick={() => setActiveStep('input')}
                className="flex items-center space-x-1 text-sm font-semibold text-amber-700 hover:text-amber-900 bg-white px-4 py-2 rounded-xl border border-amber-200/60 shadow-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>もどる</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  disabled={isGenerating || !generatedImageUrl}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>いんさつ する</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isGenerating || !generatedImageUrl}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>いらすとを ほぞん</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 print:hidden">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="bg-white rounded-2xl border-2 border-amber-200/80 p-6 md:p-8 shadow-lg print:shadow-none print:border-none print:p-0">
              <div className="border-b-2 border-dashed border-amber-300 pb-4 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2">
                <div>
                  <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full mb-2">
                    {date} の きゅうしょく
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                    {title || 'きょうの こんだて'}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-amber-50/50 border border-amber-100 flex items-center justify-center group shadow-inner">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                        <ChefHat className="w-8 h-8 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-base">いらすとを つくっています...</p>
                        <p className="text-xs text-slate-400 mt-1">すこし まってね（5〜10びょう）</p>
                      </div>
                    </div>
                  ) : generatedImageUrl ? (
                    <>
                      <img 
                        src={generatedImageUrl} 
                        alt="できた いらすと" 
                        className="w-full h-full object-cover rounded-xl transition-all"
                      />
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">いらすとが ありません</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-100">
                    <h3 className="text-sm font-bold text-amber-900 border-b border-amber-200/80 pb-2 mb-4 flex items-center space-x-2">
                      <Utensils className="w-4 h-4 text-amber-600" />
                      <span>こんだて メニュー</span>
                    </h3>
                    
                    <ul className="space-y-3">
                      {[
                        { label: 'しゅしょく', value: mainDish },
                        { label: 'しゅさい', value: sideDish },
                        { label: 'ふくさい', value: soup },
                        { label: 'しるもの', value: dessert },
                        { label: 'くだもの・のみもの', value: drink },
                      ].filter(item => item.value).map((item, idx) => (
                        <li key={idx} className="flex items-start justify-between text-sm border-b border-amber-100/60 pb-2 last:border-none">
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                            {item.label}
                          </span>
                          <span className="font-bold text-slate-800 text-right ml-4">
                            {item.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 print:hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AIへの しじ（プロンプト）</span>
                </h3>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={2}
                  className="flex-1 p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-slate-600 bg-slate-50"
                />
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="px-5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 flex-shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>もういちど つくる</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}