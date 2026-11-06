// =======================================================================
//  LỚP HỌC CHỮ - GAME CONTROLS PANEL
//  Architecture & Neo-Brutalism Ocean Breeze UI by GumballZ
//  Palette: #F9E8A2 | #B4E1EB | #95BDD7 | #78A4CB | #000000
// =======================================================================
import { useState } from 'react';
import { emitTest, sendControl } from '../live/page';
import type { StageView } from './useGame';
import { GAME } from './config';
import {
  AlertOctagon,
  Cake,
  SkipForward,
  RotateCcw,
  LogOut,
  Sparkles,
  Trophy,
  Users,
  CheckCircle2,
  Gift,
  Heart,
  HelpCircle,
  Flame,
  FileText,
  Volume2,
} from 'lucide-react';

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi'];
const TEN = ['Lan Anh', 'Minh Tuấn', 'Thu Trang', 'Quốc Bảo', 'Ngọc Hân', 'Gia Huy', 'Khánh Linh', 'Hải Yến', 'Đức Anh', 'Bảo Ngọc', 'Thanh Hà', 'Văn Toàn'];
const CHAT = ['khó quá cô ơi', 'chữ gì vậy trời', 'hay quá', 'vào lớp', 'cô xinh quá', 'ủa là gì', '???', 'hihi'];
const fake = (i: number) => ({ username: `hs${i}`, nickname: `${HO[i % HO.length]} ${TEN[i % TEN.length]}`, avatar: '' });
const shuffleWord = (w: string) => [...w].sort(() => Math.random() - 0.5).join('');

export function GameControls({ view, stageCount = 0 }: { view: StageView | null; stageCount?: number }) {
  const [sent, setSent] = useState(0);
  const [running, setRunning] = useState(false);
  const [bdName, setBdName] = useState('');

  /** Giả lập n người xem cùng bình luận trong 20 giây: 15% đúng, 20% đoán sai, còn lại nói chuyện */
  const flood = async (n: number) => {
    if (!view?.answer || running) return;
    setRunning(true);
    setSent(0);
    const answer = view.answer.toLowerCase();
    const start = Date.now();
    let done = 0;
    await Promise.all(
      Array.from({ length: n }, (_, i) => {
        const r = Math.random();
        const comment = r < 0.15 ? answer : r < 0.35 ? shuffleWord(answer) : CHAT[i % CHAT.length];
        const delay = Math.random() * 20_000;
        return new Promise<void>((ok) =>
          setTimeout(async () => {
            await emitTest('chat', { ...fake(i), comment, createTime: start + delay - Math.random() * 1500 }).catch(() => {});
            setSent(++done);
            ok();
          }, delay),
        );
      }),
    );
    setRunning(false);
  };

  return (
    <div className="space-y-4">
      {/* Cảnh báo đa trang stage */}
      {stageCount > 1 && (
        <div className="neo-box flex items-center gap-2 rounded-xl bg-[#FF6B6B] p-3 text-xs font-black text-white">
          <AlertOctagon className="h-5 w-5 shrink-0" />
          <span>
            Phát hiện đang mở {stageCount} trang stage cùng lúc! Sẽ có hiện tượng lặp đôi giọng đọc. Hãy đóng bớt các tab
            thừa hoặc nguồn browser trong LIVE Studio.
          </span>
        </div>
      )}

      {/* Trạng thái ván đấu hiện tại */}
      {view && (
        <div className="neo-box rounded-xl bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-black bg-[#F9E8A2] px-4 py-2">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide">
              <Trophy className="h-4 w-4 text-black" />
              <span>
                VÁN {view.round} · CÂU HỎI {view.qNo}/{view.total} · PHA: <span className="underline">{view.phase}</span>
              </span>
            </div>
            {view.topic && (
              <span className="rounded border border-black bg-[#B4E1EB] px-2 py-0.5 text-[11px] font-bold shadow-[1px_1px_0px_#000]">
                {view.topic}
              </span>
            )}
          </div>

          <div className="p-3.5 space-y-2.5 text-xs font-bold text-black">
            {/* Hàng đáp án bí mật */}
            <div className="flex flex-wrap items-center justify-between rounded-lg border-2 border-black bg-[#B4E1EB] p-2.5 shadow-[2px_2px_0px_#000]">
              <span className="font-black uppercase text-[11px] text-black/80">
                🔑 Đáp án bí mật (Chỉ Admin thấy):
              </span>
              <span className="rounded border border-black bg-[#F9E8A2] px-2.5 py-1 font-mono text-sm font-black text-black shadow-[1.5px_1.5px_0px_#000]">
                {view.answer || '—'}
              </span>
            </div>

            {/* Các chỉ số thống kê */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border-2 border-black bg-[#F0F7FA] p-2 text-center shadow-[1.5px_1.5px_0px_#000]">
                <div className="text-[10px] uppercase text-black/60 font-black">Comment nhận</div>
                <div className="text-base font-black text-black">{view.stats.received}</div>
              </div>
              <div className="rounded-lg border-2 border-black bg-[#F0F7FA] p-2 text-center shadow-[1.5px_1.5px_0px_#000]">
                <div className="text-[10px] uppercase text-black/60 font-black">Lượt trả lời</div>
                <div className="text-base font-black text-black">{view.stats.attempts}</div>
              </div>
              <div className="rounded-lg border-2 border-black bg-[#F0F7FA] p-2 text-center shadow-[1.5px_1.5px_0px_#000]">
                <div className="text-[10px] uppercase text-black/60 font-black">Trả lời đúng</div>
                <div className="text-base font-black text-emerald-700">{view.correctCount}</div>
              </div>
              <div className="rounded-lg border-2 border-black bg-[#F0F7FA] p-2 text-center shadow-[1.5px_1.5px_0px_#000]">
                <div className="text-[10px] uppercase text-black/60 font-black">Đang chơi</div>
                <div className="text-base font-black text-black">{view.players} bạn</div>
              </div>
            </div>

            {view.players < GAME.smallRoomPlayers && (
              <div className="rounded-md border border-black bg-[#F9E8A2] px-2.5 py-1 text-[11px] font-bold text-black">
                ⚠️ Chế độ phòng vắng: Có bạn đúng là {GAME.smallRoomEndAfterSec}s sau chốt câu ngay.
              </div>
            )}

            {sent > 0 && (
              <div className="rounded-md border border-black bg-[#95BDD7] px-2.5 py-1 text-[11px] font-bold text-black">
                🚀 Bot đang giả lập đã gửi: {sent} bình luận
              </div>
            )}
          </div>
        </div>
      )}

      {/* Điều khiển trực tiếp ván đấu */}
      <div className="neo-box rounded-xl bg-white overflow-hidden">
        <div className="border-b-2 border-black bg-[#95BDD7] px-4 py-2 font-black text-xs uppercase tracking-wide">
          🎮 Thao Tác Trực Tiếp Ván Học
        </div>
        <div className="p-3.5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                confirm(`Bỏ câu "${view?.answer}"? Câu này sẽ bị cấm vĩnh viễn và không bao giờ xuất hiện lại.`) &&
                sendControl('custom', 'ban')
              }
              disabled={!view?.answer || !!view.math || !['question', 'bonus', 'reveal'].includes(view.phase)}
              className="neo-btn flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#FF6B6B] px-3 py-2 text-xs font-black text-white disabled:opacity-40"
              title="Bỏ câu này vĩnh viễn"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>🚫 Bỏ Câu Này</span>
            </button>

            <button
              onClick={() => sendControl('custom', 'skip')}
              className="neo-btn flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#B4E1EB] px-3 py-2 text-xs font-black text-black"
            >
              <SkipForward className="h-4 w-4" />
              <span>⏭ Bỏ Qua Câu</span>
            </button>

            <button
              onClick={() => sendControl('custom', 'newRound')}
              className="neo-btn flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#F9E8A2] px-3 py-2 text-xs font-black text-black"
            >
              <RotateCcw className="h-4 w-4" />
              <span>🔄 Ván Mới</span>
            </button>

            <button
              onClick={() => sendControl('custom', 'goodbye')}
              className="neo-btn flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#78A4CB] px-3 py-2 text-xs font-black text-black"
            >
              <LogOut className="h-4 w-4" />
              <span>👋 Chào Xuống Live</span>
            </button>
          </div>

          {/* Chúc sinh nhật & Link Báo Cáo */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-black/15">
            <div className="flex flex-1 items-center gap-2 min-w-[240px]">
              <input
                value={bdName}
                onChange={(e) => setBdName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && bdName.trim()) {
                    sendControl('custom', `birthday:${bdName.trim()}`);
                    setBdName('');
                  }
                }}
                placeholder="Nhập tên học sinh sinh nhật..."
                className="w-full rounded-lg border-2 border-black bg-white px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none"
              />
              <button
                onClick={() => {
                  if (bdName.trim()) sendControl('custom', `birthday:${bdName.trim()}`);
                  setBdName('');
                }}
                disabled={!bdName.trim()}
                className="neo-btn flex shrink-0 items-center gap-1 rounded-lg border-2 border-black bg-[#F9E8A2] px-3 py-1.5 text-xs font-black text-black disabled:opacity-40"
              >
                <Cake className="h-3.5 w-3.5" />
                <span>🎂 Chúc Sinh Nhật</span>
              </button>
            </div>

            <a
              href="/bao-cao"
              target="_blank"
              rel="noreferrer"
              className="neo-btn flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#B4E1EB] px-3 py-1.5 text-xs font-black text-black"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>📊 Báo Cáo Buổi Live</span>
            </a>
          </div>
        </div>
      </div>

      {/* Kích hoạt Minigame Giờ Ra Chơi & Game Show */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Minigame Giờ Ra Chơi */}
        <div className="neo-box rounded-xl bg-white overflow-hidden">
          <div className="border-b-2 border-black bg-[#B4E1EB] px-4 py-2 font-black text-xs uppercase tracking-wide">
            🎪 Kích Hoạt Giờ Ra Chơi
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => sendControl('custom', 'recess:rps')}
              className="neo-btn rounded-lg border-2 border-black bg-[#F9E8A2] p-2 text-xs font-black text-black"
            >
              ✊ Oẳn Tù Tì (+2đ)
            </button>
            <button
              onClick={() => sendControl('custom', 'recess:callup')}
              className="neo-btn rounded-lg border-2 border-black bg-[#95BDD7] p-2 text-xs font-black text-black"
            >
              📢 Kiểm Tra Miệng (+5đ)
            </button>
            <button
              onClick={() => sendControl('custom', 'recess:pick')}
              className="neo-btn rounded-lg border-2 border-black bg-[#B4E1EB] p-2 text-xs font-black text-black"
            >
              ⚖️ Chọn Phe (Vui)
            </button>
            <button
              onClick={() => sendControl('custom', 'recess:roll')}
              className="neo-btn rounded-lg border-2 border-black bg-[#78A4CB] p-2 text-xs font-black text-black"
            >
              🙋 Điểm Danh (+3đ)
            </button>
            <button
              onClick={() => sendControl('custom', 'recess:heart')}
              className="neo-btn col-span-2 rounded-lg border-2 border-black bg-[#FF8A7A] p-2 text-xs font-black text-black"
            >
              ❤️ Thả Tim 300 (+1đ cả lớp)
            </button>
          </div>
        </div>

        {/* Game Show Lớn */}
        <div className="neo-box rounded-xl bg-white overflow-hidden">
          <div className="border-b-2 border-black bg-[#78A4CB] px-4 py-2 font-black text-xs uppercase tracking-wide">
            🏆 Kích Hoạt Game Show Lớn
          </div>
          <div className="p-3 space-y-2">
            <button
              onClick={() => sendControl('custom', 'show:everest')}
              className="neo-btn w-full rounded-lg border-2 border-black bg-[#F9E8A2] p-2.5 text-xs font-black text-black flex items-center justify-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              <span>🏔️ Đường Lên Đỉnh Everest</span>
            </button>
            <button
              onClick={() => sendControl('custom', 'show:chuong')}
              className="neo-btn w-full rounded-lg border-2 border-black bg-[#B4E1EB] p-2.5 text-xs font-black text-black flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>🔔 Game: Rung Chuông Đồng</span>
            </button>
            <button
              onClick={() =>
                Array.from({ length: 10 }, (_, i) =>
                  emitTest('chat', {
                    ...fake(i),
                    comment: view?.show?.step === 'stake' ? ['10', '20'][i % 2] : 'ABCD'[Math.floor(Math.random() * 4)],
                  }),
                )
              }
              className="neo-btn w-full rounded-lg border-2 border-black bg-[#95BDD7] p-2 text-xs font-black text-black flex items-center justify-center gap-2"
            >
              <span>🎲 Thử Game: 10 bạn gõ ABCD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bộ Giả Lập Tải & Kiểm Thử Bot */}
      <div className="neo-box rounded-xl bg-white overflow-hidden">
        <div className="border-b-2 border-black bg-[#F9E8A2] px-4 py-2 font-black text-xs uppercase tracking-wide flex items-center justify-between">
          <span>🧪 Thử Nghiệm Tải & Sự Kiện Bot</span>
          <span className="text-[10px] font-bold text-black/70">Engine by GumballZ</span>
        </div>
        <div className="p-3.5 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={() =>
                emitTest('chat', {
                  ...fake(Math.floor(Math.random() * 50)),
                  comment: view?.answer.toLowerCase() ?? '',
                })
              }
              className="neo-btn rounded-lg border-2 border-black bg-white p-2 text-xs font-black text-black"
            >
              ✅ 1 Bạn Trả Lời Đúng
            </button>

            <button
              onClick={() =>
                emitTest('chat', {
                  ...fake(Math.floor(Math.random() * 50)),
                  comment: 'vào lớp',
                })
              }
              className="neo-btn rounded-lg border-2 border-black bg-white p-2 text-xs font-black text-black"
            >
              🙋 1 Bạn "Vào Lớp"
            </button>

            <button
              onClick={() =>
                emitTest('gift', {
                  ...fake(3),
                  giftName: 'Hoa hồng',
                  giftId: 1,
                  diamondCount: 1,
                  repeatCount: 1,
                })
              }
              className="neo-btn rounded-lg border-2 border-black bg-[#B4E1EB] p-2 text-xs font-black text-black"
            >
              🌹 Tặng 1 Bông Hoa
            </button>

            <button
              onClick={() =>
                emitTest('gift', {
                  ...fake(4),
                  giftName: 'Mũ',
                  giftId: 2,
                  diamondCount: 99,
                  repeatCount: 1,
                })
              }
              className="neo-btn rounded-lg border-2 border-black bg-[#F9E8A2] p-2 text-xs font-black text-black"
            >
              🎁 Tặng Quà Khủng (99 xu)
            </button>

            <button
              onClick={() =>
                emitTest('like', {
                  ...fake(5),
                  likeCount: 300,
                })
              }
              className="neo-btn rounded-lg border-2 border-black bg-[#FF8A7A] p-2 text-xs font-black text-black"
            >
              ❤️ Thả 300 Tim
            </button>

            <button
              onClick={() =>
                emitTest('chat', {
                  ...fake(Math.floor(Math.random() * 50)),
                  comment: 'hôm nay sinh nhật con cô ơi',
                })
              }
              className="neo-btn rounded-lg border-2 border-black bg-[#95BDD7] p-2 text-xs font-black text-black"
            >
              🎂 1 Bạn Báo Sinh Nhật
            </button>

            <button
              onClick={() => flood(100)}
              disabled={running}
              className="neo-btn rounded-lg border-2 border-black bg-[#B4E1EB] p-2 text-xs font-black text-black disabled:opacity-40"
            >
              👥 100 Người Cùng Đoán
            </button>

            <button
              onClick={() => flood(1000)}
              disabled={running}
              className="neo-btn rounded-lg border-2 border-black bg-[#78A4CB] p-2 text-xs font-black text-black disabled:opacity-40"
            >
              🔥 1000 Người Cùng Đoán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
