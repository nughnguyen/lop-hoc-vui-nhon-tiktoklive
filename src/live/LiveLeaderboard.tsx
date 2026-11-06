// =======================================================================
//  BẢNG XẾP HẠNG REALTIME & BỤC PHẠT — /?view=board
//  Hiển thị Top nhanh nhất, bảng xếp hạng điểm, và bục phạt (gõ sai)
//  Nhận game state từ Stage qua SSE, tự cập nhật liên tục.
// =======================================================================
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { StageView } from '../game/useGame';
import { GAME } from '../game/config';

const MEDAL = ['🥇', '🥈', '🥉', '🏅', '🏅'];
const secText = (ms: number) => `${(ms / 1000).toFixed(2).replace('.', ',')}s`;

export function LiveLeaderboard() {
  const [view, setView] = useState<StageView | null>(null);
  const [now, setNow] = useState(Date.now());

  // Nhận game state từ SSE
  useEffect(() => {
    const source = new EventSource('/api/tiktok/events');
    source.addEventListener('gamestate', (e) => {
      try {
        setView(JSON.parse((e as MessageEvent).data));
      } catch {}
    });
    source.onerror = () => {
      source.close();
      setTimeout(() => window.location.reload(), 5000);
    };
    return () => source.close();
  }, []);

  // Đồng hồ UI
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  if (!view) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0a1e] text-white">
        <div className="animate-pulse text-2xl font-bold">⏳ Đang kết nối với lớp học…</div>
      </div>
    );
  }

  const asking = view.phase === 'question' || view.phase === 'bonus';
  const revealing = view.phase === 'reveal';
  const left = !view.boardShown && view.phase === 'question'
    ? GAME.questionSec
    : Math.max(0, Math.ceil((view.endsAt - now) / 1000));

  return (
    <div className="flex h-screen flex-col gap-4 overflow-hidden bg-[#0f0a1e] p-6 font-sans text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📋</span>
          <h1 className="text-2xl font-black tracking-tight text-white">LỚP HỌC VUI NHỘN</h1>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold uppercase tracking-wider text-[#F9E8A2]">
            Tiết {view.round} · Câu {view.qNo}/{view.total} · <span className="uppercase text-emerald-400">{view.phase}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {asking && (
            <div className={`rounded-xl px-4 py-2 text-xl font-black tabular-nums shadow-lg ${left <= 5 ? 'animate-pulse bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {!view.boardShown ? '👂 Đang đọc câu hỏi…' : `⏱️ ${left}s`}
            </div>
          )}
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold">
            👥 {view.classSize} học sinh
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        {/* LEFT COLUMN: Top comment nhanh nhất câu hiện tại & Bục phạt */}
        <div className="flex w-[45%] flex-col gap-4">
          {/* Top Fastest Answers */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-950/60 to-[#1a1230] shadow-xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3">
              <span className="text-lg font-black tracking-wide text-white">⚡ COMMENT NHANH &amp; ĐÚNG NHẤT</span>
              <span className="rounded-full bg-black/40 px-3 py-0.5 text-sm font-bold text-amber-200">
                {view.correctCount} bạn đúng
              </span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <AnimatePresence mode="popLayout">
                {(revealing ? view.fastest : view.correctTop).length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-full items-center justify-center text-center text-lg text-white/40"
                  >
                    {asking ? '🤔 Chờ các bạn comment đáp án…' : 'Chưa có ai trả lời đúng câu này'}
                  </motion.div>
                )}
                {revealing
                  ? view.fastest.map((a, i) => (
                      <motion.div
                        key={a.username}
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`mb-1.5 flex items-center gap-3 rounded-xl border border-white/5 px-4 py-2.5 ${i === 0 ? 'bg-amber-500/25 border-amber-400/40' : 'bg-white/5'}`}
                      >
                        <span className="w-8 text-center text-2xl">{MEDAL[i] ?? `#${i + 1}`}</span>
                        <span className="flex-1 truncate text-lg font-bold text-white">{a.nickname}</span>
                        <span className="font-mono text-sm font-semibold text-amber-300">{secText(a.ms)}</span>
                        <span className="rounded-full bg-emerald-500/30 px-3 py-1 text-sm font-black text-emerald-300 border border-emerald-400/40">
                          +{a.points}đ
                        </span>
                      </motion.div>
                    ))
                  : view.correctTop.map((a, i) => (
                      <motion.div
                        key={a.username}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mb-1.5 flex items-center gap-3 rounded-xl border border-white/5 px-4 py-2.5 ${i === 0 ? 'bg-amber-500/25 border-amber-400/40' : 'bg-white/5'}`}
                      >
                        <span className="w-8 text-center text-2xl">{MEDAL[i]}</span>
                        <span className="flex-1 truncate text-lg font-bold text-white">{a.nickname}</span>
                        <span className="rounded-full bg-emerald-500/30 px-3 py-1 text-sm font-black text-emerald-300 border border-emerald-400/40">
                          +{a.points}đ
                        </span>
                      </motion.div>
                    ))}
              </AnimatePresence>
              {revealing && view.laterCount > 0 && (
                <div className="mt-2 rounded-xl bg-white/5 px-4 py-2 text-center text-sm font-medium text-white/60">
                  +{view.laterCount} bạn khác trả lời đúng chậm hơn · mỗi bạn +{view.laterPoints} điểm
                </div>
              )}
            </div>
          </div>

          {/* Bục Phạt: Ai sai thì bắt đứng lên bục */}
          <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-red-500/40 bg-gradient-to-b from-red-950/60 to-[#1a1230] shadow-xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-700 px-4 py-3">
              <span className="text-lg font-black tracking-wide text-white">🪑 BỤC PHẠT (COMMENT SAI)</span>
              <span className="rounded-full bg-black/40 px-3 py-0.5 text-sm font-bold text-red-200">
                {view.punished.length} bạn đang đứng phạt
              </span>
            </div>
            <div className="max-h-[220px] overflow-auto p-2">
              {view.punished.length === 0 ? (
                <div className="py-6 text-center text-sm text-white/40">
                  🎉 Hiện không có ai bị phạt — cả lớp rất ngoan!
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {view.punished.map((s) => (
                    <motion.div
                      key={s.username}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="mb-1.5 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2"
                    >
                      <span className="text-2xl">{s.girl ? '👧' : '👦'}</span>
                      <div className="flex-1 truncate">
                        <span className="text-base font-bold text-red-200">{s.nickname}</span>
                        <span className="ml-2 text-xs text-white/40">(@{s.username})</span>
                      </div>
                      <span className="rounded-lg bg-red-600/30 px-2.5 py-1 text-xs font-black text-red-300 border border-red-400/30">
                        Phạt đứng {s.left} câu nữa
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bảng điểm học sinh cả lớp */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-b from-cyan-950/50 to-[#1a1230] shadow-xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3">
            <span className="text-lg font-black tracking-wide text-white">🏆 BẢNG ĐIỂM TIẾT HỌC {view.round}</span>
            <span className="rounded-full bg-black/40 px-3 py-0.5 text-sm font-bold text-cyan-200">
              {view.seats.filter((s) => s.score > 0).length} bạn có điểm
            </span>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {view.seats.filter((s) => s.score > 0).length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-lg text-white/40">
                Chưa có bạn nào ghi điểm trong tiết này
              </div>
            ) : (
              view.seats
                .filter((s) => s.score > 0)
                .sort((a, b) => b.score - a.score)
                .map((s, i) => (
                  <motion.div
                    key={s.username}
                    layout
                    className={`mb-1.5 flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors
                      ${i === 0 ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-100' : 'bg-white/5 border-white/5 text-white'}
                      ${s.standing ? 'opacity-60 bg-red-950/20 border-red-500/20' : ''}
                    `}
                  >
                    <span className="w-8 text-center text-xl font-black">
                      {i < 3 ? MEDAL[i] : `#${i + 1}`}
                    </span>
                    <div className="flex flex-1 items-center gap-2 truncate">
                      <span className="text-base font-bold">{s.nickname}</span>
                      {s.title === 'lop-truong' && (
                        <span className="rounded-md bg-yellow-500/20 px-2 py-0.5 text-[11px] font-black text-yellow-300 border border-yellow-400/40">
                          👑 LỚP TRƯỞNG
                        </span>
                      )}
                      {s.title === 'lop-pho' && (
                        <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[11px] font-black text-blue-300 border border-blue-400/40">
                          ⭐ LỚP PHÓ
                        </span>
                      )}
                      {s.showIcons && <span className="text-sm">{s.showIcons}</span>}
                      {s.standing && (
                        <span className="rounded-md bg-red-500/20 px-1.5 py-0.5 text-[11px] font-bold text-red-300 border border-red-500/30">
                          🚫 Đang phạt đứng
                        </span>
                      )}
                    </div>
                    {s.answered === 'right' && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                        ✅ Đúng
                      </span>
                    )}
                    {s.answered === 'wrong' && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-300 border border-red-500/30">
                        ❌ Sai
                      </span>
                    )}
                    <span className="min-w-[56px] rounded-xl bg-cyan-500/20 px-3 py-1 text-center text-lg font-black tabular-nums text-cyan-300 border border-cyan-400/30">
                      {s.score}đ
                    </span>
                  </motion.div>
                ))
            )}
          </div>

          {/* Session Top: Điểm tổng cả buổi live */}
          {view.sessionTop.length > 0 && (
            <div className="border-t-2 border-cyan-500/30 bg-[#0c0818]/90 p-3">
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400/80">
                🌟 Top cả buổi live:
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {view.sessionTop.slice(0, 6).map((s, i) => (
                  <div key={s.username} className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1 text-xs">
                    <span className="font-bold">{MEDAL[i] ?? `#${i + 1}`}</span>
                    <span className="flex-1 truncate font-medium text-white/80">{s.nickname}</span>
                    <span className="font-mono font-bold text-cyan-300">{s.session}đ</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer banner: khi công bố đáp án */}
      {revealing && view.answer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 rounded-2xl border-2 border-emerald-400/50 bg-gradient-to-r from-emerald-900/80 to-teal-900/80 px-6 py-3 shadow-2xl"
        >
          <span className="text-2xl">🎉</span>
          <span className="text-lg font-bold text-emerald-200">ĐÁP ÁN CHÍNH XÁC:</span>
          <span className="text-3xl font-black tracking-wide text-white underline decoration-emerald-400 underline-offset-4">
            {view.answer}
          </span>
        </motion.div>
      )}
    </div>
  );
}

