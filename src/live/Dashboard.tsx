// =======================================================================
//  LỚP HỌC CHỮ - ADMIN DASHBOARD
//  Architecture & Neo-Brutalism Ocean Breeze Design by GumballZ
//  Palette: #F9E8A2 | #B4E1EB | #95BDD7 | #78A4CB | #000000
// =======================================================================
import { useState, useEffect, type ReactNode } from 'react';
import type { LiveStatus } from './types';
import { emitTest, sendControl } from './page';
import type { StageView } from '../game/useGame';
import { GAME } from '../game/config';
import {
  Radio,
  Volume2,
  Settings,
  Sliders,
  Users,
  MessageSquare,
  Gift,
  Heart,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
  Cake,
  Mic,
  Tv,
  FileText,
} from 'lucide-react';

const FAKE_NAMES = ['Quốc Hưng', 'Minh Tuấn', 'Bé Na 🌸', 'Hoàng Long', 'Thu Trang', 'Quốc Bảo', 'duyanh99', '𝑵𝒈𝒐̣𝒄 𝑨𝒏𝒉'];
const pick = () => {
  const nickname = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
  return { nickname, username: nickname.normalize('NFKD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'khach' };
};

export interface DashboardProps {
  status: LiveStatus | null;
  channelName: string;
  preview: ReactNode;
  extra?: ReactNode;
  view?: StageView | null;
  stageCount?: number;
}

export function Dashboard({
  status,
  channelName,
  preview,
  extra,
  view,
  stageCount = 0,
}: DashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'game' | 'settings' | 'voice' | 'sim' | 'connect'>('game');

  // TikTok connection state
  const [user, setUser] = useState(() => localStorageGet('tiktokUser'));
  const [nameText, setNameText] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Voice speech state
  const [speakText, setSpeakText] = useState('');

  // Extended game settings state (synced with runtime GAME & localStorage)
  const [config, setConfig] = useState({
    questionSec: GAME.questionSec,
    quickRead: GAME.quickRead,
    closeAfterTopN: GAME.closeAfterTopN,
    closeAfterTopSec: GAME.closeAfterTopSec,
    dhFirstLetters: GAME.dhFirstLetters,
    bonusSec: GAME.bonusSec,
    standQuestions: GAME.standQuestions,
    standMax: GAME.standMax,
    praiseEvery: GAME.praiseEvery,
    giftChance: GAME.giftChance,
    heartBoost: GAME.heartBoost,
    smallRoomEndAfterSec: GAME.smallRoomEndAfterSec,
  });

  // Apply config update
  const updateConfig = (patch: Partial<typeof config>) => {
    const updated = { ...config, ...patch };
    setConfig(updated);
    try {
      localStorage.setItem('admin-game-config', JSON.stringify(updated));
    } catch {}
    void sendControl('custom', 'config:' + JSON.stringify(patch));
    setMsg('Đã cập nhật cài đặt!');
    setTimeout(() => setMsg(''), 2500);
  };

  // Load saved config on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin-game-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig((prev) => ({ ...prev, ...parsed }));
        void sendControl('custom', 'config:' + saved);
      }
    } catch {}
  }, []);

  const connect = async () => {
    setBusy(true);
    setMsg('');
    localStorageSet('tiktokUser', user);
    try {
      const r = await fetch('/api/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user }),
      }).then((x) => x.json());
      setMsg(r.success ? 'Đã kết nối thành công!' : (r.error || 'Lỗi kết nối'));
    } catch (e) {
      setMsg(String(e));
    }
    setBusy(false);
  };

  const disconnect = () => {
    fetch('/api/tiktok/disconnect', { method: 'POST' });
    setMsg('Đã ngắt kết nối');
  };

  const speak = async (customPhrase?: string) => {
    const textToSay = customPhrase ?? speakText;
    if (!textToSay.trim()) return;
    const r = await sendControl('speak', textToSay);
    setMsg(r.pages > 1 ? `Đã gửi (đang mở ${r.pages} trang)` : 'Đã gửi lời đọc cho MC!');
    if (!customPhrase) setSpeakText('');
    setTimeout(() => setMsg(''), 3000);
  };

  const saveName = async () => {
    if (!nameText.trim()) return;
    const r = await sendControl('setName', nameText);
    setMsg(r.success ? `Đã lưu tên lớp: ${nameText.trim()}` : r.error);
    if (r.success) setNameText('');
    setTimeout(() => setMsg(''), 3000);
  };

  const copyLiveLink = () => {
    const link = `http://lvh.me:${window.location.port || 80}/?view=stage`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F0F7FA] font-sans text-black selection:bg-[#F9E8A2]">
      {/* Top Navbar */}
      <header className="flex min-h-14 items-center justify-between border-b-[3px] border-black bg-[#95BDD7] px-4 py-2 shadow-[0_3px_0_#000] gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-[#F9E8A2] px-3 py-1 font-black text-sm uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            <Sparkles className="h-4 w-4 text-black" />
            <span>Lớp Học Chữ</span>
            <span className="rounded bg-black px-1.5 py-0.5 text-[10px] text-[#F9E8A2]">ADMIN</span>
          </div>

          <div className="hidden items-center gap-1.5 text-xs font-bold xl:flex">
            <span className="rounded-md border-2 border-black bg-[#B4E1EB] px-2 py-0.5 shadow-[2px_2px_0px_#000]">
              🌊 Ocean Breeze
            </span>
            <span className="rounded-md border-2 border-black bg-[#F9E8A2] px-2 py-0.5 shadow-[2px_2px_0px_#000]">
              ⚡ GumballZ
            </span>
          </div>
        </div>

        {/* Cùng hàng: Kết nối TikTok + Mở Báo Cáo + Mở Stage */}
        <div className="flex flex-wrap items-center gap-2">
          {stageCount > 1 && (
            <div className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#FF6B6B] px-2.5 py-1 text-xs font-black text-white shadow-[2px_2px_0px_#000]">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Mở {stageCount} stage!</span>
            </div>
          )}

          {/* Phần Kết Nối TikTok */}
          {status?.isConnected ? (
            <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-[#B4E1EB] px-2.5 py-1 text-xs font-bold shadow-[2px_2px_0px_#000]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              </span>
              <span className="font-black text-black">@{status.username}</span>
              <span className="text-black/40">|</span>
              <span>{status.viewerCount} xem</span>
              <span className="text-black/40">|</span>
              <span>{status.totalLikes} tim</span>
              <button
                onClick={disconnect}
                className="ml-1 rounded border border-black bg-[#FF6B6B] px-1.5 py-0.5 text-[10px] font-black text-white hover:bg-red-700"
                title="Ngắt kết nối TikTok"
              >
                Ngắt
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                className="w-32 sm:w-40 rounded-lg border-2 border-black bg-white px-2.5 py-1 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none"
                placeholder="TikTok user..."
                value={user}
                onChange={(e) => setUser(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && user.trim() && connect()}
              />
              <button
                onClick={connect}
                disabled={busy || !user.trim()}
                className="neo-btn flex items-center gap-1 rounded-lg border-2 border-black bg-[#F9E8A2] px-2.5 py-1 text-xs font-black text-black disabled:opacity-40"
              >
                <Radio className={`h-3.5 w-3.5 ${busy || status?.isConnecting ? 'animate-spin' : ''}`} />
                <span>{busy || status?.isConnecting ? 'Đang nối...' : 'Kết Nối'}</span>
              </button>
            </div>
          )}

          {/* Mở Báo Cáo */}
          <a
            href="/bao-cao"
            target="_blank"
            rel="noreferrer"
            className="neo-btn flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#B4E1EB] px-3 py-1 text-xs font-black text-black shadow-[2px_2px_0px_#000]"
            title="Mở trang báo cáo buổi live trong tab mới"
          >
            <FileText className="h-3.5 w-3.5 text-black" />
            <span>Mở Báo Cáo</span>
          </a>

          {/* Mở Stage */}
          <button
            onClick={() => window.open(`/?view=stage`, '_blank')}
            className="neo-btn flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#78A4CB] px-3 py-1 text-xs font-black text-black shadow-[2px_2px_0px_#000]"
            title="Mở màn hình Stage dành cho TikTok LIVE Studio"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Mở Stage</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex h-[calc(100vh-3.5rem)] gap-4 p-4">
        {/* Left Column: Admin Navigation & Controls */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Neo-Brutalist Navigation Tabs */}
          <div className="mb-3 flex flex-wrap gap-2">
            <TabButton
              active={activeTab === 'game'}
              onClick={() => setActiveTab('game')}
              icon={<Zap className="h-4 w-4" />}
              label="🎮 Ván Đấu & Thao Tác"
              badge={view ? `Ván ${view.round}` : undefined}
            />
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={<Settings className="h-4 w-4" />}
              label="⚙️ Cài Đặt Luật & Hệ Thống"
            />
            <TabButton
              active={activeTab === 'voice'}
              onClick={() => setActiveTab('voice')}
              icon={<Mic className="h-4 w-4" />}
              label="🎙️ MC & Giọng Đọc"
            />
            <TabButton
              active={activeTab === 'sim'}
              onClick={() => setActiveTab('sim')}
              icon={<Users className="h-4 w-4" />}
              label="🧪 Giả Lập Livestream"
            />
            <TabButton
              active={activeTab === 'connect'}
              onClick={() => setActiveTab('connect')}
              icon={<Radio className="h-4 w-4" />}
              label="📡 Kết Nối & Báo Cáo"
            />
          </div>

          {/* Toast / Notification Banner */}
          {msg && (
            <div className="mb-3 flex items-center justify-between rounded-lg border-2 border-black bg-[#F9E8A2] px-3 py-2 text-xs font-black shadow-[3px_3px_0px_#000] animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-black" />
                <span>{msg}</span>
              </div>
              <button onClick={() => setMsg('')} className="font-bold hover:underline">
                ✕
              </button>
            </div>
          )}

          {/* Scrollable Tab Content Area */}
          <div className="min-w-0 flex-1 overflow-y-auto pr-2 pb-6 space-y-4">
            {/* TAB 1: VÁN ĐẤU & THAO TÁC */}
            {activeTab === 'game' && (
              <div className="space-y-4">
                {/* Embedded Game Controls from props */}
                {extra}

                {/* Quick Interactive Triggers */}
                <NeoCard title="⚡ Thao Tác Tương Tác Nhanh" color="#B4E1EB">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <ActionButton
                      onClick={() => void sendControl('custom', 'bonus')}
                      color="#F9E8A2"
                      title="Mở thêm 1 chữ cái đáp án ngay"
                    >
                      💡 Mở Gợi Ý 1 Chữ
                    </ActionButton>
                    <ActionButton
                      onClick={() => void sendControl('custom', 'clap')}
                      color="#95BDD7"
                      title="Kích hoạt vỗ tay cả lớp"
                    >
                      👏 Cả Lớp Vỗ Tay
                    </ActionButton>
                    <ActionButton
                      onClick={() => void sendControl('custom', 'skip')}
                      color="#B4E1EB"
                      title="Bỏ qua câu hiện tại"
                    >
                      ⏭ Bỏ Qua Câu
                    </ActionButton>
                    <ActionButton
                      onClick={() => confirmReset()}
                      color="#FF8A7A"
                      title="Làm mới lại toàn bộ ván"
                    >
                      🔄 Reset Ván
                    </ActionButton>
                  </div>
                </NeoCard>
              </div>
            )}

            {/* TAB 2: CÀI ĐẶT LUẬT & HỆ THỐNG */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                {/* Tên Kênh & Lớp Học */}
                <NeoCard title="🏷️ Tên Lớp Học & Bảng Hiệu" color="#F9E8A2">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      className="min-w-0 flex-1 rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none"
                      placeholder={`Tên lớp hiện tại: ${channelName || GAME.defaultChannelName}`}
                      value={nameText}
                      onChange={(e) => setNameText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    />
                    <button
                      onClick={saveName}
                      disabled={!nameText.trim()}
                      className="neo-btn rounded-lg bg-[#78A4CB] px-4 py-2 text-sm font-black text-black disabled:opacity-40"
                    >
                      Lưu Tên Mới
                    </button>
                  </div>
                  <p className="mt-2 text-xs font-medium text-black/70">
                    Tên lớp sẽ xuất hiện trên biển hiệu gỗ phía trên bảng đen trong phòng học.
                  </p>
                </NeoCard>

                {/* Nhịp Độ & Thời Gian Câu Hỏi */}
                <NeoCard title="⏱️ Nhịp Độ & Thời Gian Trả Lời" color="#B4E1EB">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-black uppercase">
                        Thời gian mỗi câu hỏi (Giây)
                      </label>
                      <div className="flex gap-2">
                        {[15, 20, 25, 30].map((sec) => (
                          <button
                            key={sec}
                            onClick={() => updateConfig({ questionSec: sec })}
                            className={`neo-btn flex-1 rounded-lg py-1.5 text-xs font-black ${
                              config.questionSec === sec
                                ? 'bg-[#78A4CB] text-black ring-2 ring-black'
                                : 'bg-white text-black'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-black uppercase">
                        Thời gian mở gợi ý thêm (+Giây)
                      </label>
                      <div className="flex gap-2">
                        {[5, 10, 15].map((sec) => (
                          <button
                            key={sec}
                            onClick={() => updateConfig({ bonusSec: sec })}
                            className={`neo-btn flex-1 rounded-lg py-1.5 text-xs font-black ${
                              config.bonusSec === sec
                                ? 'bg-[#78A4CB] text-black ring-2 ring-black'
                                : 'bg-white text-black'
                            }`}
                          >
                            +{sec}s
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-black uppercase">
                        Chế độ đọc nhanh (Quick Read)
                      </label>
                      <button
                        onClick={() => updateConfig({ quickRead: !config.quickRead })}
                        className={`neo-btn w-full rounded-lg py-2 text-xs font-black ${
                          config.quickRead ? 'bg-[#95BDD7] text-black' : 'bg-white text-black'
                        }`}
                      >
                        {config.quickRead ? '🟢 BẬT: Đọc ngắn gọn & chốt nhanh' : '⚪ TẮT: Đọc đề đầy đủ & hô bắt đầu'}
                      </button>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-black uppercase">
                        Đuổi hình: Hiện sẵn chữ cái đầu
                      </label>
                      <button
                        onClick={() => updateConfig({ dhFirstLetters: !config.dhFirstLetters })}
                        className={`neo-btn w-full rounded-lg py-2 text-xs font-black ${
                          config.dhFirstLetters ? 'bg-[#95BDD7] text-black' : 'bg-white text-black'
                        }`}
                      >
                        {config.dhFirstLetters ? '🟢 BẬT: Gợi ý chữ cái đầu mỗi từ' : '⚪ TẮT: Để trống toàn bộ'}
                      </button>
                    </div>
                  </div>
                </NeoCard>

                {/* Chốt Câu Sớm & Kỷ Luật */}
                <NeoCard title="🛡️ Chốt Sớm, Kỷ Luật & Phần Thưởng" color="#95BDD7">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-black uppercase">
                        Chốt câu khi đủ Top đúng
                      </label>
                      <div className="flex gap-2">
                        {[0, 3, 5, 10].map((n) => (
                          <button
                            key={n}
                            onClick={() => updateConfig({ closeAfterTopN: n })}
                            className={`neo-btn flex-1 rounded-lg py-1.5 text-xs font-black ${
                              config.closeAfterTopN === n
                                ? 'bg-[#F9E8A2] text-black ring-2 ring-black'
                                : 'bg-white text-black'
                            }`}
                          >
                            {n === 0 ? 'Tắt' : `${n} bạn`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-black uppercase">
                        Phạt gõ sai đứng bảng (Số câu)
                      </label>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3].map((q) => (
                          <button
                            key={q}
                            onClick={() => updateConfig({ standQuestions: q })}
                            className={`neo-btn flex-1 rounded-lg py-1.5 text-xs font-black ${
                              config.standQuestions === q
                                ? 'bg-[#F9E8A2] text-black ring-2 ring-black'
                                : 'bg-white text-black'
                            }`}
                          >
                            {q === 0 ? 'Tắt' : `${q} câu`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-black uppercase">
                        Hệ số nhân tim (Heart Boost)
                      </label>
                      <div className="flex gap-2">
                        {[1, 3, 5, 10].map((h) => (
                          <button
                            key={h}
                            onClick={() => updateConfig({ heartBoost: h })}
                            className={`neo-btn flex-1 rounded-lg py-1.5 text-xs font-black ${
                              config.heartBoost === h
                                ? 'bg-[#F9E8A2] text-black ring-2 ring-black'
                                : 'bg-white text-black'
                            }`}
                          >
                            x{h}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </NeoCard>
              </div>
            )}

            {/* TAB 3: MC & GIỌNG ĐỌC */}
            {activeTab === 'voice' && (
              <div className="space-y-4">
                <NeoCard title="🎙️ MC Giọng Đọc Trực Tiếp" color="#78A4CB">
                  <div className="flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none"
                      placeholder="Gõ câu muốn cô Ngân đọc ngay lập tức..."
                      value={speakText}
                      onChange={(e) => setSpeakText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && speakText.trim() && speak()}
                    />
                    <button
                      onClick={() => speak()}
                      disabled={!speakText.trim()}
                      className="neo-btn rounded-lg bg-[#F9E8A2] px-4 py-2 text-sm font-black text-black disabled:opacity-40"
                    >
                      Đọc Ngay 📢
                    </button>
                  </div>

                  {/* Tốc độ đọc */}
                  <div className="mt-4 flex flex-wrap items-center justify-between rounded-lg border-2 border-black bg-white/70 p-3 shadow-[2px_2px_0px_#000]">
                    <RateSlider />
                    <button
                      onClick={() => confirmReset()}
                      className="neo-btn rounded-lg bg-[#FF6B6B] px-3 py-1.5 text-xs font-black text-white"
                    >
                      ⚠️ Reset Giọng & Ván Đấu
                    </button>
                  </div>

                  {/* Mẫu câu nói nhanh của cô Ngân */}
                  <div className="mt-4">
                    <div className="mb-2 text-xs font-black uppercase text-black">
                      ⚡ Mẫu Câu Tương Tác Nhanh (Click để đọc):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Cả lớp chú ý lên bảng, không ai được quay cóp!',
                        'Gõ đáp án có dấu đàng hoàng nha cả lớp!',
                        'Bạn nào yêu cô Ngân thì thả tim mạnh lên nào!',
                        'Sắp hết giờ rồi các bạn ơi, nhanh tay gõ đáp án!',
                        'Lớp mình hôm nay học giỏi quá, cô khen cả lớp!',
                        'Bạn nào chưa vào lớp gõ vào lớp để cô xếp chỗ ngồi nha!',
                      ].map((phrase, i) => (
                        <button
                          key={i}
                          onClick={() => speak(phrase)}
                          className="neo-btn rounded-lg border-2 border-black bg-[#F9E8A2] px-3 py-1.5 text-left text-xs font-bold text-black"
                        >
                          💬 "{phrase}"
                        </button>
                      ))}
                    </div>
                  </div>
                </NeoCard>
              </div>
            )}

            {/* TAB 4: GIẢ LẬP LIVESTREAM */}
            {activeTab === 'sim' && (
              <div className="space-y-4">
                <NeoCard title="🧪 Giả Lập Tương Tác Học Sinh" color="#F9E8A2">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <ActionButton onClick={() => emitTest('member', pick())} color="#B4E1EB">
                      👋 1 Bạn Vào Lớp
                    </ActionButton>
                    <ActionButton
                      onClick={() => emitTest('chat', { ...pick(), comment: 'Chào cô giáo Ngân xinh đẹp ạ' })}
                      color="#95BDD7"
                    >
                      💬 1 Bình Luận Chat
                    </ActionButton>
                    <ActionButton
                      onClick={() => emitTest('chat', { ...pick(), comment: 'mong kỳ này thi được điểm mười' })}
                      color="#B4E1EB"
                    >
                      🙏 Cầu Chúc Điểm
                    </ActionButton>
                    <ActionButton onClick={() => emitTest('follow', pick())} color="#95BDD7">
                      ➕ 1 Lượt Follow
                    </ActionButton>
                    <ActionButton
                      onClick={() => emitTest('gift', { ...pick(), giftName: 'Hoa hồng', giftId: 1, diamondCount: 1, repeatCount: 1 })}
                      color="#F9E8A2"
                    >
                      🌹 Tặng Hoa Hồng
                    </ActionButton>
                    <ActionButton
                      onClick={() => emitTest('gift', { ...pick(), giftName: 'Xe hoa', giftId: 2, diamondCount: 99, repeatCount: 1 })}
                      color="#F9E8A2"
                    >
                      🎁 Tặng Quà Khủng (99 xu)
                    </ActionButton>
                    <ActionButton onClick={() => comboSameUser()} color="#78A4CB">
                      🔁 Tặng Combo 3 Lần
                    </ActionButton>
                    <ActionButton onClick={() => emitTest('like', { ...pick(), likeCount: 300 })} color="#FF8A7A">
                      ❤️ Thả 300 Tim
                    </ActionButton>
                  </div>
                  <p className="mt-3 text-xs font-medium text-black/70">
                    Sự kiện giả lập sẽ được gửi đến mọi trang đang mở (bao gồm cả màn hình Stage trong LIVE Studio).
                  </p>
                </NeoCard>
              </div>
            )}

            {/* TAB 5: KẾT NỐI & BÁO CÁO */}
            {activeTab === 'connect' && (
              <div className="space-y-4">
                <NeoCard title="📡 Kết Nối TikTok LIVE Studio" color="#B4E1EB">
                  <div className="flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none"
                      placeholder="Username TikTok (ví dụ: congansocute)"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && user.trim() && connect()}
                    />
                    <button
                      onClick={connect}
                      disabled={busy || !user.trim()}
                      className="neo-btn rounded-lg bg-[#F9E8A2] px-4 py-2 text-sm font-black text-black disabled:opacity-40"
                    >
                      {busy ? 'Đang nối...' : 'Kết Nối'}
                    </button>
                    <button
                      onClick={disconnect}
                      className="neo-btn rounded-lg bg-[#FF6B6B] px-4 py-2 text-sm font-black text-white"
                    >
                      Ngắt Nối
                    </button>
                  </div>

                  <div className="mt-4 rounded-lg border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black uppercase text-black/60">Đường dẫn LIVE Studio (1080×1920):</div>
                        <div className="mt-1 font-mono text-xs font-bold text-black">
                          http://lvh.me:{window.location.port || 80}/?view=stage
                        </div>
                      </div>
                      <button
                        onClick={copyLiveLink}
                        className="neo-btn flex items-center gap-1 rounded-lg bg-[#B4E1EB] px-3 py-1.5 text-xs font-black text-black"
                      >
                        {copiedLink ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedLink ? 'Đã Chép' : 'Sao Chép'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href="/bao-cao"
                      target="_blank"
                      rel="noreferrer"
                      className="neo-btn flex items-center gap-1.5 rounded-lg bg-[#F9E8A2] px-4 py-2 text-xs font-black text-black"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Xem Báo Cáo Buổi Live Hôm Nay (/bao-cao)</span>
                    </a>
                  </div>
                </NeoCard>
              </div>
            )}
          </div>

          {/* Neo-Brutalist Footer with GumballZ Credit */}
          <footer className="mt-auto border-t-[2.5px] border-black pt-2 pb-1 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-black">
                <span className="rounded border-2 border-black bg-[#F9E8A2] px-2 py-0.5 text-[11px] shadow-[1.5px_1.5px_0px_#000]">
                  DESIGNED & ENGINEERED BY GUMBALLZ
                </span>
                <span className="text-black/70">✦ Neo-Brutalism Ocean Breeze System</span>
              </div>
              <div className="text-[11px] font-bold text-black/60">
                Lớp Học Chữ © {new Date().getFullYear()} · TikTok LIVE Stream Engine
              </div>
            </div>
          </footer>
        </div>

        {/* Right Column: PREVIEW STAGE FRAME */}
        <div className="flex flex-none flex-col items-center">
          <div className="neo-box-lg flex flex-col overflow-hidden rounded-2xl bg-white">
            {/* Preview Frame Header */}
            <div className="flex items-center justify-between border-b-[3px] border-black bg-[#78A4CB] px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
                </span>
                <span className="text-xs font-black tracking-wider text-black uppercase">
                  MÀN HÌNH STAGE (1080×1920)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded border border-black bg-[#F9E8A2] px-1.5 py-0.5 text-[10px] font-black text-black">
                  IM LẶNG
                </span>
                <button
                  onClick={() => window.open('/?view=stage', '_blank')}
                  className="rounded border border-black bg-white p-1 text-black hover:bg-black hover:text-white transition-colors"
                  title="Mở toàn màn hình trong tab mới"
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Quick Live Indicators on top of preview */}
            {view && (
              <div className="flex items-center justify-between border-b-2 border-black bg-[#F9E8A2] px-2.5 py-1 text-[11px] font-bold">
                <div>
                  Ván {view.round} · Câu {view.qNo}/{view.total} · <span className="uppercase">{view.phase}</span>
                </div>
                <div>
                  Đáp án: <b className="text-red-700 underline">{view.answer || '—'}</b>
                </div>
              </div>
            )}

            {/* The Actual Preview Stage */}
            <div className="relative flex items-center justify-center bg-black p-1">
              {preview}
            </div>

            {/* Preview Bottom Bar Controls */}
            <div className="flex items-center justify-around border-t-2 border-black bg-[#B4E1EB] p-2 text-xs font-black">
              <button
                onClick={() => void sendControl('custom', 'bonus')}
                className="neo-btn rounded border border-black bg-white px-2 py-1 text-[11px]"
                title="Mở thêm 1 chữ cái"
              >
                💡 Mở Gợi Ý
              </button>
              <button
                onClick={() => void sendControl('custom', 'skip')}
                className="neo-btn rounded border border-black bg-white px-2 py-1 text-[11px]"
                title="Bỏ qua câu này"
              >
                ⏭ Qua Câu
              </button>
              <button
                onClick={() => void sendControl('custom', 'clap')}
                className="neo-btn rounded border border-black bg-white px-2 py-1 text-[11px]"
                title="Cả lớp vỗ tay"
              >
                👏 Vỗ Tay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Sub-Components with Neo-Brutalism Styling
// ----------------------------------------------------

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`neo-btn flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition-all ${
        active
          ? 'bg-[#F9E8A2] text-black ring-2 ring-black shadow-[4px_4px_0px_#000]'
          : 'bg-white text-black hover:bg-[#B4E1EB]'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="rounded border border-black bg-[#78A4CB] px-1.5 py-0.2 text-[10px] text-black">
          {badge}
        </span>
      )}
    </button>
  );
}

function NeoCard({
  title,
  color = '#B4E1EB',
  children,
}: {
  title: string;
  color?: string;
  children: ReactNode;
}) {
  return (
    <div className="neo-box rounded-xl bg-white overflow-hidden">
      <div
        className="border-b-2 border-black px-4 py-2 font-black text-xs uppercase tracking-wide flex items-center justify-between"
        style={{ backgroundColor: color }}
      >
        <span>{title}</span>
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  color = '#F9E8A2',
  title,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  color?: string;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ backgroundColor: color }}
      className="neo-btn rounded-lg border-2 border-black px-3 py-2 text-xs font-black text-black disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function RateSlider() {
  const [rate, setRate] = useState(() => {
    try {
      return Number(localStorage.getItem('voice-rate')) || 1.0;
    } catch {
      return 1.0;
    }
  });

  const change = (r: number) => {
    setRate(r);
    try {
      localStorage.setItem('voice-rate', String(r));
    } catch {}
    void sendControl('setRate', String(r));
  };

  return (
    <div className="flex items-center gap-3">
      <Volume2 className="h-4 w-4 text-black" />
      <span className="text-xs font-black uppercase text-black">Tốc độ giọng đọc MC:</span>
      <input
        type="range"
        min={0.8}
        max={1.5}
        step={0.05}
        value={rate}
        onChange={(e) => change(Number(e.target.value))}
        className="w-32 accent-[#78A4CB] cursor-pointer"
      />
      <span className="rounded border border-black bg-[#F9E8A2] px-2 py-0.5 text-xs font-black text-black shadow-[1px_1px_0px_#000]">
        {rate.toFixed(2)}×
      </span>
    </div>
  );
}

function confirmReset() {
  void sendControl('reset');
}

function comboSameUser() {
  const who = pick();
  for (let i = 0; i < 3; i++) {
    setTimeout(
      () => emitTest('gift', { ...who, giftName: 'Hoa hồng', giftId: 5655, diamondCount: 1, repeatCount: 1 }),
      i * 1000,
    );
  }
}

function localStorageGet(k: string) {
  try {
    return localStorage.getItem(k) || '';
  } catch {
    return '';
  }
}

function localStorageSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {}
}
