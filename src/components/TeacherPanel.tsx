import React, { useState } from 'react';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  History,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Users,
  X,
} from 'lucide-react';
import { BANK_BIRU_META, BANK_MERAH_META } from '../data/questions';
import { GameSettings, MatchState, PlayerRoundAttempt, TeamId } from '../types/game';

interface TeacherPanelProps {
  isOpen: boolean;
  match: MatchState;
  settings: GameSettings;
  onClose: () => void;
  onTogglePause: () => void;
  onToggleShowExplanation: () => void;
  onToggleWrongPullsOpponent: () => void;
  onRepeatTeamQuestion: (team: TeamId) => void;
  onResetMatch: () => void;
  onFinishEarly: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'] as const;
const HISTORY_PER_PAGE = 8;
const BANK_PER_PAGE = 4;
const RECAP_PER_PAGE = 12;

function formatRopePositionLabel(
  pos: number,
  redName: string,
  blueName: string
): string {
  if (pos === 0) return 'Seimbang (0)';
  return pos < 0
    ? `▲ ${redName} +${Math.abs(pos)}`
    : `● ${blueName} +${Math.abs(pos)}`;
}

function formatDeltaLabel(
  delta: number,
  redName: string,
  blueName: string
): string {
  if (delta === 0) return '0 (Tali Diam)';
  return delta < 0
    ? `▲ ${redName} +${Math.abs(delta)}`
    : `● ${blueName} +${Math.abs(delta)}`;
}

function renderPlayerRecapList(
  teamName: string,
  teamColor: 'red' | 'blue',
  memberCount: number,
  history: PlayerRoundAttempt[],
  pageIndex: number
) {
  const start = pageIndex * RECAP_PER_PAGE;
  const end = Math.min(memberCount, start + RECAP_PER_PAGE);
  const players: number[] = [];
  for (let p = start + 1; p <= end; p++) players.push(p);

  const marker = teamColor === 'red' ? '▲' : '●';

  return (
    <div
      className={`rounded-2xl border-[3px] p-[14px] flex flex-col gap-[8px] ${
        teamColor === 'red'
          ? 'border-[#FF1744] bg-[#2D0613]'
          : 'border-[#1E6BFF] bg-[#071A52]'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3
          className={`font-display font-bold text-[17px] text-outline-dark ${
            teamColor === 'red' ? 'text-[#FF5277]' : 'text-[#60A5FA]'
          }`}
        >
          {marker} {teamName} ({memberCount} Siswa)
        </h3>
        <span className="text-[13px] font-bold text-[#FFD400]">
          Total giliran: {history.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-[8px]">
        {players.map((pNum) => {
          const attempts = history.filter((h) => h.playerNumber === pNum);
          const correctTotal = attempts.filter((a) => a.isCorrect).length;
          const wrongTotal = attempts.filter((a) => !a.isCorrect).length;

          return (
            <div
              key={pNum}
              className="flex flex-col gap-[4px] px-[10px] py-[8px] rounded-xl bg-[#0B1B4D] border-2 border-[#040B24] text-[13px] tabular-nums"
            >
              <div className="flex items-center justify-between gap-[6px]">
                <span
                  className={`px-[8px] py-[2px] rounded-lg font-display font-bold text-white border border-[#040B24] ${
                    teamColor === 'red' ? 'bg-[#FF1744]' : 'bg-[#1E6BFF]'
                  }`}
                >
                  P{pNum}
                </span>
                <span className="text-white/95 font-bold">
                  {attempts.length === 0
                    ? 'Belum main'
                    : `B:${correctTotal} · S:${wrongTotal}`}
                </span>
              </div>

              {attempts.length > 0 && (
                <div className="flex flex-wrap items-center gap-[4px]">
                  {attempts.slice(-4).map((att, idx) => (
                    <span
                      key={idx}
                      className={`px-[6px] py-[1px] rounded font-bold text-[11px] border ${
                        att.isCorrect
                          ? 'bg-[#064E1D] border-[#00C853] text-[#69F0AE]'
                          : 'bg-[#5E0012] border-[#FF1744] text-[#FF8A9E]'
                      }`}
                    >
                      {att.isTiebreaker ? 'Pen' : `P${att.round}`}:{' '}
                      {att.isCorrect ? '✔' : att.isTimeout ? '⏱' : '✘'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({
  isOpen,
  match,
  settings,
  onClose,
  onTogglePause,
  onToggleShowExplanation,
  onToggleWrongPullsOpponent,
  onRepeatTeamQuestion,
  onResetMatch,
  onFinishEarly,
}) => {
  const [activeTab, setActiveTab] = useState<'recap' | 'history' | 'red' | 'blue'>('recap');
  const [confirmReset, setConfirmReset] = useState(false);
  const [recapPage, setRecapPage] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const [bankPage, setBankPage] = useState(0);

  if (!isOpen) return null;

  const bankList = activeTab === 'red' ? BANK_MERAH_META : BANK_BIRU_META;
  const pullHistory = match.pullHistory ?? [];
  const computedSum = pullHistory.reduce((acc, item) => acc + item.ropeDelta, 0);

  const maxRecapPages = Math.max(
    1,
    Math.ceil(Math.max(match.red.memberCount, match.blue.memberCount) / RECAP_PER_PAGE)
  );
  const safeRecapPage = Math.min(recapPage, maxRecapPages - 1);

  const reversedHistory = [...pullHistory].reverse();
  const maxHistoryPages = Math.max(1, Math.ceil(reversedHistory.length / HISTORY_PER_PAGE));
  const safeHistoryPage = Math.min(historyPage, maxHistoryPages - 1);
  const visibleHistory = reversedHistory.slice(
    safeHistoryPage * HISTORY_PER_PAGE,
    safeHistoryPage * HISTORY_PER_PAGE + HISTORY_PER_PAGE
  );

  const maxBankPages = Math.max(1, Math.ceil(bankList.length / BANK_PER_PAGE));
  const safeBankPage = Math.min(bankPage, maxBankPages - 1);
  const visibleBank = bankList.slice(
    safeBankPage * BANK_PER_PAGE,
    safeBankPage * BANK_PER_PAGE + BANK_PER_PAGE
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panel Kontrol & Kunci Jawaban Guru"
      className="absolute inset-0 z-50 bg-[#040B24]/82 flex items-center justify-center p-[20px]"
    >
      <div className="animate-pop-in bg-[#0B1B4D] text-white rounded-3xl border-[5px] border-[#FFD400] card-3d w-[1420px] h-[840px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-[64px] shrink-0 px-[24px] bg-[#071338] border-b-4 border-[#040B24] flex items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[16px]">
            <h2 className="font-display font-bold text-[22px] text-[#FFD400] text-outline-dark">
              Panel Kontrol, Rekap Pemain, Riwayat Tarikan &amp; Kunci Guru
            </h2>
            <span className="px-[12px] py-[4px] rounded-xl bg-[#13296B] border border-[#29B6FF]/60 text-[13px] font-semibold text-[#93C5FD]">
              Mode:{' '}
              {settings.endMode === 'questions'
                ? `Soal Habis (${settings.questionsPerTeam} soal/tim)`
                : settings.endMode === 'time'
                ? `Batas Waktu (${settings.totalTimeMinutes} menit · Bank 50 soal)`
                : `Keduanya (${settings.questionsPerTeam} soal / ${settings.totalTimeMinutes} menit)`}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel guru"
            className="btn-3d w-[44px] h-[44px] rounded-xl bg-[#FF1744] hover:bg-[#FF3D64] border-2 border-[#040B24] flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-[22px] h-[22px]" />
          </button>
        </div>

        {/* Status & Controls Strip */}
        <div className="px-[20px] py-[12px] bg-[#13296B] border-b-4 border-[#040B24] space-y-[10px] shrink-0">
          <div className="grid grid-cols-5 gap-[10px] text-[13px] tabular-nums">
            <div className="p-[10px] rounded-xl bg-[#5E0012] border-2 border-[#FF1744]">
              <p className="font-bold text-[#FF8A9E]">
                ▲ {settings.redName} ({match.red.memberCount} siswa)
              </p>
              <p className="text-white font-semibold">
                Terjawab {match.red.answeredCount} · Put.{match.red.currentRound} · Benar {match.red.correctCount}
              </p>
            </div>
            <div className="p-[10px] rounded-xl bg-[#0A2FA8] border-2 border-[#29B6FF]">
              <p className="font-bold text-[#7CC9FF]">
                ● {settings.blueName} ({match.blue.memberCount} siswa)
              </p>
              <p className="text-white font-semibold">
                Terjawab {match.blue.answeredCount} · Put.{match.blue.currentRound} · Benar {match.blue.correctCount}
              </p>
            </div>
            <div className="p-[10px] rounded-xl bg-[#0B1B4D] border-2 border-[#FFD400]">
              <p className="font-bold text-[#FFD400]">Selisih Tali Asli</p>
              <p className="text-white font-bold">
                {formatRopePositionLabel(match.ropePosition, settings.redName, settings.blueName)}
              </p>
            </div>
            <div className="p-[10px] rounded-xl bg-[#0B1B4D] border-2 border-[#29B6FF] flex items-center justify-between gap-[8px]">
              <span className="font-bold text-[#93C5FD]">Penjelasan</span>
              <button
                type="button"
                onClick={onToggleShowExplanation}
                className={`px-[12px] py-[6px] rounded-lg text-[13px] font-bold border border-[#040B24] cursor-pointer ${
                  settings.showExplanation
                    ? 'bg-[#00C853] text-white'
                    : 'bg-[#1D3E9E] text-[#93C5FD]'
                }`}
              >
                {settings.showExplanation ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="p-[10px] rounded-xl bg-[#0B1B4D] border-2 border-[#29B6FF] flex items-center justify-between gap-[8px]">
              <span className="font-bold text-[#93C5FD]">Salah Tarik</span>
              <button
                type="button"
                onClick={onToggleWrongPullsOpponent}
                className={`px-[12px] py-[6px] rounded-lg text-[13px] font-bold border border-[#040B24] cursor-pointer ${
                  settings.wrongPullsOpponent
                    ? 'bg-[#FFD400] text-[#0B1B4D]'
                    : 'bg-[#1D3E9E] text-[#93C5FD]'
                }`}
              >
                {settings.wrongPullsOpponent ? 'ON (+1)' : 'OFF'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-[10px]">
            {(match.phase === 'PLAYING' || match.phase === 'PAUSED') && (
              <button
                type="button"
                onClick={onTogglePause}
                className="btn-3d inline-flex items-center gap-[6px] px-[16px] py-[8px] rounded-xl bg-[#FFD400] hover:bg-[#FFE042] text-[#0B1B4D] border-2 border-[#040B24] font-bold text-[14px] cursor-pointer min-h-[42px]"
              >
                {match.phase === 'PAUSED' ? (
                  <>
                    <Play className="w-[16px] h-[16px] fill-current" /> Lanjutkan Semua
                  </>
                ) : (
                  <>
                    <Pause className="w-[16px] h-[16px]" /> Jeda Semua
                  </>
                )}
              </button>
            )}

            {settings.allowRepeatQuestion &&
              (match.phase === 'PLAYING' || match.phase === 'PAUSED') && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onRepeatTeamQuestion('red');
                      onClose();
                    }}
                    className="btn-3d-red inline-flex items-center gap-[6px] px-[14px] py-[8px] rounded-xl bg-[#FF1744] hover:bg-[#FF3D64] text-white border-2 border-[#040B24] font-bold text-[14px] cursor-pointer min-h-[42px]"
                  >
                    <RefreshCw className="w-[16px] h-[16px]" /> Ulangi Soal {settings.redName}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRepeatTeamQuestion('blue');
                      onClose();
                    }}
                    className="btn-3d-blue inline-flex items-center gap-[6px] px-[14px] py-[8px] rounded-xl bg-[#1E6BFF] hover:bg-[#3B82FF] text-white border-2 border-[#040B24] font-bold text-[14px] cursor-pointer min-h-[42px]"
                  >
                    <RefreshCw className="w-[16px] h-[16px]" /> Ulangi Soal {settings.blueName}
                  </button>
                </>
              )}

            <button
              type="button"
              onClick={() => {
                onFinishEarly();
                onClose();
              }}
              className="btn-3d inline-flex items-center gap-[6px] px-[16px] py-[8px] rounded-xl bg-[#7C4DFF] hover:bg-[#936EFF] text-white border-2 border-[#040B24] font-bold text-[14px] cursor-pointer min-h-[42px]"
            >
              <Award className="w-[16px] h-[16px] text-[#FFD400]" /> Akhiri &amp; Lihat Hasil
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="btn-3d-red inline-flex items-center gap-[6px] px-[16px] py-[8px] rounded-xl bg-[#FF1744] hover:bg-[#FF3D64] text-white border-2 border-[#040B24] font-bold text-[14px] cursor-pointer min-h-[42px]"
              >
                <RotateCcw className="w-[16px] h-[16px]" /> Reset Permainan
              </button>
            ) : (
              <div className="inline-flex items-center gap-[8px] bg-[#5E0012] border-2 border-[#FF1744] px-[12px] py-[6px] rounded-xl">
                <span className="text-[13px] font-bold text-[#FFD400]">Yakin reset?</span>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmReset(false);
                    onResetMatch();
                    onClose();
                  }}
                  className="px-[12px] py-[4px] rounded-lg bg-[#FF1744] text-white border border-[#040B24] text-[13px] font-bold cursor-pointer"
                >
                  Ya, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-[12px] py-[4px] rounded-lg bg-[#16307A] border border-[#29B6FF] text-white text-[13px] font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Panel Tabs */}
        <div className="px-[20px] pt-[10px] flex items-center gap-[8px] border-b-4 border-[#040B24] bg-[#071338] shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('recap');
              setRecapPage(0);
            }}
            className={`inline-flex items-center gap-[6px] px-[16px] py-[10px] rounded-t-xl font-display font-bold text-[15px] cursor-pointer border-b-4 transition-colors ${
              activeTab === 'recap'
                ? 'border-[#00C853] text-[#69F0AE] bg-[#064E1D]'
                : 'border-transparent text-[#93C5FD] hover:text-white'
            }`}
          >
            <Users className="w-[16px] h-[16px]" />
            REKAP PEMAIN
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              setHistoryPage(0);
            }}
            className={`inline-flex items-center gap-[6px] px-[16px] py-[10px] rounded-t-xl font-display font-bold text-[15px] cursor-pointer border-b-4 transition-colors ${
              activeTab === 'history'
                ? 'border-[#FFD400] text-[#FFD400] bg-[#13296B]'
                : 'border-transparent text-[#93C5FD] hover:text-white'
            }`}
          >
            <History className="w-[16px] h-[16px]" />
            RIWAYAT TARIKAN ({pullHistory.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('red');
              setBankPage(0);
            }}
            className={`px-[16px] py-[10px] rounded-t-xl font-display font-bold text-[15px] cursor-pointer border-b-4 transition-colors ${
              activeTab === 'red'
                ? 'border-[#FF1744] text-[#FF8A9E] bg-[#5E0012]'
                : 'border-transparent text-[#93C5FD] hover:text-white'
            }`}
          >
            ▲ BANK MERAH (50 Soal)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('blue');
              setBankPage(0);
            }}
            className={`px-[16px] py-[10px] rounded-t-xl font-display font-bold text-[15px] cursor-pointer border-b-4 transition-colors ${
              activeTab === 'blue'
                ? 'border-[#1E6BFF] text-[#7CC9FF] bg-[#0A2FA8]'
                : 'border-transparent text-[#93C5FD] hover:text-white'
            }`}
          >
            ● BANK BIRU (50 Soal)
          </button>
        </div>

        {/* Non-scrolling Paginated Tab Body */}
        <div className="flex-1 p-[18px] flex flex-col justify-between gap-[12px] bg-[#071338] min-h-0 overflow-hidden">
          {activeTab === 'recap' && (
            <>
              <div className="flex-1 grid grid-cols-2 gap-[16px] min-h-0 overflow-hidden">
                {renderPlayerRecapList(
                  settings.redName,
                  'red',
                  match.red.memberCount,
                  match.red.playerHistory,
                  safeRecapPage
                )}
                {renderPlayerRecapList(
                  settings.blueName,
                  'blue',
                  match.blue.memberCount,
                  match.blue.playerHistory,
                  safeRecapPage
                )}
              </div>

              {maxRecapPages > 1 && (
                <div className="h-[42px] shrink-0 flex items-center justify-center gap-[12px]">
                  <button
                    type="button"
                    disabled={safeRecapPage <= 0}
                    onClick={() => setRecapPage((p) => Math.max(0, p - 1))}
                    className="btn-3d px-[14px] py-[6px] rounded-xl bg-[#16307A] disabled:opacity-40 border-2 border-[#040B24] text-[14px] font-bold flex items-center gap-[4px] cursor-pointer"
                  >
                    <ChevronLeft className="w-[16px] h-[16px]" /> Sebelumnya
                  </button>
                  <span className="text-[14px] font-bold text-[#FFD400] tabular-nums">
                    Halaman {safeRecapPage + 1} / {maxRecapPages}
                  </span>
                  <button
                    type="button"
                    disabled={safeRecapPage >= maxRecapPages - 1}
                    onClick={() => setRecapPage((p) => Math.min(maxRecapPages - 1, p + 1))}
                    className="btn-3d px-[14px] py-[6px] rounded-xl bg-[#16307A] disabled:opacity-40 border-2 border-[#040B24] text-[14px] font-bold flex items-center gap-[4px] cursor-pointer"
                  >
                    Berikutnya <ChevronRight className="w-[16px] h-[16px]" />
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              <div className="flex-1 flex flex-col gap-[10px] min-h-0 overflow-hidden">
                <div className="p-[12px] rounded-2xl bg-[#13296B] border-[3px] border-[#FFD400] flex items-center justify-between gap-[12px] text-[14px] font-bold tabular-nums shrink-0">
                  <span>
                    Total Kejadian: <strong className="text-[#FFD400]">{pullHistory.length}</strong>
                  </span>
                  <span>
                    Jumlah Perubahan Riwayat:{' '}
                    <strong className="text-[#69F0AE]">
                      {formatRopePositionLabel(computedSum, settings.redName, settings.blueName)}
                    </strong>
                  </span>
                  <span>
                    Selisih Tali di Layar:{' '}
                    <strong className="text-[#FFD400]">
                      {formatRopePositionLabel(match.ropePosition, settings.redName, settings.blueName)}
                    </strong>
                  </span>
                </div>

                {pullHistory.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-[24px] rounded-2xl bg-[#0B1B4D] border-2 border-[#1E6BFF]/50 text-center text-[16px] font-semibold text-[#93C5FD]">
                    Belum ada tarikan tali pada sesi ini. Riwayat akan tercatat otomatis setiap kali tim menjawab atau waktu habis.
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-[#1E6BFF]/60 bg-[#0B1B4D] overflow-hidden">
                    <table className="w-full text-left text-[14px] tabular-nums">
                      <thead className="bg-[#13296B] text-[#FFD400] font-display border-b-2 border-[#040B24]">
                        <tr>
                          <th className="px-[14px] py-[10px]">#</th>
                          <th className="px-[14px] py-[10px]">Waktu</th>
                          <th className="px-[14px] py-[10px]">Tim &amp; Pemain</th>
                          <th className="px-[14px] py-[10px]">Hasil</th>
                          <th className="px-[14px] py-[10px]">Perubahan Langkah</th>
                          <th className="px-[14px] py-[10px]">Posisi Tali Setelahnya</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#16307A]">
                        {visibleHistory.map((entry) => {
                          const isRedEntry = entry.team === 'red';
                          const teamLabel = isRedEntry ? settings.redName : settings.blueName;
                          const outcomeLabel =
                            entry.outcome === 'correct'
                              ? 'Benar'
                              : entry.outcome === 'timeout'
                              ? 'Waktu Habis'
                              : 'Salah';

                          return (
                            <tr key={entry.id}>
                              <td className="px-[14px] py-[9px] font-bold text-[#93C5FD]">{entry.id}</td>
                              <td className="px-[14px] py-[9px] font-mono text-white/90">{entry.timestamp}</td>
                              <td className="px-[14px] py-[9px] font-bold">
                                <span className={isRedEntry ? 'text-[#FF5277]' : 'text-[#60A5FA]'}>
                                  {isRedEntry ? '▲' : '●'} {teamLabel}
                                </span>{' '}
                                <span className="text-white/80 font-semibold">
                                  (P{entry.playerNumber} · Put.{entry.round})
                                </span>
                              </td>
                              <td className="px-[14px] py-[9px]">
                                <span
                                  className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-md font-bold text-[12px] border ${
                                    entry.outcome === 'correct'
                                      ? 'bg-[#064E1D] border-[#00C853] text-[#69F0AE]'
                                      : 'bg-[#5E0012] border-[#FF1744] text-[#FF8A9E]'
                                  }`}
                                >
                                  {outcomeLabel}
                                  {entry.isBonus && (
                                    <span className="px-[5px] rounded bg-[#FFD400] text-[#040B24] font-display font-bold">
                                      x2
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="px-[14px] py-[9px] font-bold">
                                <span
                                  className={
                                    entry.ropeDelta < 0
                                      ? 'text-[#FF5277]'
                                      : entry.ropeDelta > 0
                                      ? 'text-[#60A5FA]'
                                      : 'text-[#93C5FD]'
                                  }
                                >
                                  {formatDeltaLabel(entry.ropeDelta, settings.redName, settings.blueName)}
                                </span>
                              </td>
                              <td className="px-[14px] py-[9px] font-bold text-[#FFD400]">
                                {formatRopePositionLabel(entry.ropeAfter, settings.redName, settings.blueName)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {maxHistoryPages > 1 && (
                <div className="h-[42px] shrink-0 flex items-center justify-center gap-[12px]">
                  <button
                    type="button"
                    disabled={safeHistoryPage <= 0}
                    onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                    className="btn-3d px-[14px] py-[6px] rounded-xl bg-[#16307A] disabled:opacity-40 border-2 border-[#040B24] text-[14px] font-bold flex items-center gap-[4px] cursor-pointer"
                  >
                    <ChevronLeft className="w-[16px] h-[16px]" /> Terbaru
                  </button>
                  <span className="text-[14px] font-bold text-[#FFD400] tabular-nums">
                    Halaman {safeHistoryPage + 1} / {maxHistoryPages}
                  </span>
                  <button
                    type="button"
                    disabled={safeHistoryPage >= maxHistoryPages - 1}
                    onClick={() => setHistoryPage((p) => Math.min(maxHistoryPages - 1, p + 1))}
                    className="btn-3d px-[14px] py-[6px] rounded-xl bg-[#16307A] disabled:opacity-40 border-2 border-[#040B24] text-[14px] font-bold flex items-center gap-[4px] cursor-pointer"
                  >
                    Sebelumnya <ChevronRight className="w-[16px] h-[16px]" />
                  </button>
                </div>
              )}
            </>
          )}

          {(activeTab === 'red' || activeTab === 'blue') && (
            <>
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-[14px] min-h-0 overflow-hidden">
                {visibleBank.map((item) => (
                  <div
                    key={item.id}
                    className="p-[14px] rounded-2xl border-2 border-[#1E6BFF]/60 bg-[#0B1B4D] flex flex-col justify-between gap-[8px] overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-[8px] text-[13px] font-bold text-[#FFD400]">
                      <span>
                        #{item.pairNumber} · {item.category}
                        {item.isBonus ? ' · BONUS ⚡ x2' : ''}
                      </span>
                      <span className="text-[#93C5FD]">Tingkat: {item.difficulty}</span>
                    </div>

                    <p className="font-bold text-[15px] leading-[1.3] text-white">{item.prompt}</p>

                    {item.codeSnippet && (
                      <pre className="px-[10px] py-[6px] rounded-lg bg-[#040B24] text-[#69F0AE] font-mono text-[12px] leading-[1.25] whitespace-pre-wrap border border-[#00C853]/50">
                        <code>{item.codeSnippet}</code>
                      </pre>
                    )}

                    <div className="p-[10px] rounded-xl bg-[#064E1D] border-2 border-[#00C853] text-[13px] leading-[1.3] text-white">
                      <p>
                        <strong className="text-[#FFD400]">Kunci ({LETTERS[item.correctIndex]}):</strong>{' '}
                        {item.options[item.correctIndex]}
                      </p>
                      <p className="mt-[2px] text-[#69F0AE]">
                        <strong>Penjelasan:</strong> {item.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-[42px] shrink-0 flex items-center justify-center gap-[12px]">
                <button
                  type="button"
                  disabled={safeBankPage <= 0}
                  onClick={() => setBankPage((p) => Math.max(0, p - 1))}
                  className="btn-3d px-[14px] py-[6px] rounded-xl bg-[#16307A] disabled:opacity-40 border-2 border-[#040B24] text-[14px] font-bold flex items-center gap-[4px] cursor-pointer"
                >
                  <ChevronLeft className="w-[16px] h-[16px]" /> Sebelumnya
                </button>
                <span className="text-[14px] font-bold text-[#FFD400] tabular-nums">
                  Halaman {safeBankPage + 1} / {maxBankPages} (Soal {safeBankPage * BANK_PER_PAGE + 1}–
                  {Math.min(bankList.length, (safeBankPage + 1) * BANK_PER_PAGE)})
                </span>
                <button
                  type="button"
                  disabled={safeBankPage >= maxBankPages - 1}
                  onClick={() => setBankPage((p) => Math.min(maxBankPages - 1, p + 1))}
                  className="btn-3d px-[14px] py-[6px] rounded-xl bg-[#16307A] disabled:opacity-40 border-2 border-[#040B24] text-[14px] font-bold flex items-center gap-[4px] cursor-pointer"
                >
                  Berikutnya <ChevronRight className="w-[16px] h-[16px]" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
