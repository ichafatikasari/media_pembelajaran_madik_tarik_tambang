import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  Maximize2,
  Minimize2,
  Minus,
  Music,
  Play,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  DifficultyFilter,
  EndMode,
  GameSettings,
  QuestionsCountOption,
  TotalTimeOption,
} from '../types/game';
import { REFERENCE_MASCOT_URL, TeamBadge } from './Character';
import { TugOfWarRig } from './Rope';
import { SchoolBackground } from './SchoolBackground';

interface HomeMenuProps {
  settings: GameSettings;
  hasActiveMatch: boolean;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  isFullscreen: boolean;
  onStartNewGame: () => void;
  onResumeMatch: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onToggleFullscreen: () => void;
}

const END_MODE_SHORT: Record<EndMode, string> = {
  questions: 'Soal Habis',
  time: 'Waktu',
  both: 'Keduanya',
};

export const HomeMenu: React.FC<HomeMenuProps> = ({
  settings,
  hasActiveMatch,
  sfxEnabled,
  musicEnabled,
  isFullscreen,
  onStartNewGame,
  onResumeMatch,
  onOpenSettings,
  onOpenGuide,
  onToggleSfx,
  onToggleMusic,
  onToggleFullscreen,
}) => {
  const [imgErr, setImgErr] = useState(false);
  const totalStudents = settings.redCount + settings.blueCount;
  const isConfigValid =
    settings.redCount >= 1 && settings.blueCount >= 1 && totalStudents <= 36;

  return (
    <div className="w-[1600px] h-[900px] flex flex-col justify-between bg-gradient-to-b from-[#0077E6] via-[#0B2A7A] to-[#071338] text-white overflow-hidden">
      <header className="h-[72px] w-full px-[40px] flex items-center justify-between gap-[16px] shrink-0">
        <div className="flex items-center gap-[10px] bg-[#0B1B4D] border-[3px] border-[#FFD400] rounded-2xl px-[18px] py-[8px] shadow-[0_5px_0_#040B24]">
          <span className="text-[#FF1744] font-bold text-[16px]">▲</span>
          <span className="font-display font-bold text-[20px] text-[#FFD400] text-outline-dark whitespace-nowrap">
            ARDUINO TUG WAR
          </span>
          <span className="text-[#29B6FF] font-bold text-[16px]">●</span>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={onToggleMusic}
            className={`btn-3d inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-xl border-[3px] border-[#040B24] font-bold text-[15px] cursor-pointer min-h-[46px] whitespace-nowrap ${
              musicEnabled
                ? 'bg-[#FFD400] text-[#0B1B4D]'
                : 'bg-[#13296B] text-[#93C5FD]'
            }`}
          >
            <Music className="w-[18px] h-[18px]" />
            <span>{musicEnabled ? 'Musik ON' : 'Musik OFF'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleSfx}
            className={`btn-3d inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-xl border-[3px] border-[#040B24] font-bold text-[15px] cursor-pointer min-h-[46px] whitespace-nowrap ${
              sfxEnabled
                ? 'bg-[#00C853] text-white text-outline-dark'
                : 'bg-[#13296B] text-[#93C5FD]'
            }`}
          >
            {sfxEnabled ? <Volume2 className="w-[18px] h-[18px]" /> : <VolumeX className="w-[18px] h-[18px]" />}
            <span>{sfxEnabled ? 'Suara ON' : 'Suara OFF'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label="Layar Penuh"
            className="btn-3d inline-flex items-center gap-[8px] px-[16px] py-[10px] rounded-xl bg-[#1E6BFF] hover:bg-[#3B82FF] text-white border-[3px] border-[#040B24] font-bold text-[15px] cursor-pointer min-h-[46px] text-outline-dark whitespace-nowrap"
          >
            {isFullscreen ? <Minimize2 className="w-[18px] h-[18px]" /> : <Maximize2 className="w-[18px] h-[18px]" />}
            <span>Layar Penuh</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-[48px] pb-[28px] w-full max-w-[1440px] mx-auto gap-[22px] min-h-0">
        <div className="text-center space-y-[10px]">
          <p className="inline-block px-[20px] py-[6px] rounded-full bg-[#0B1B4D] border-[3px] border-[#FFD400] font-bold text-[16px] text-[#FFD400] shadow-[0_4px_0_#040B24]">
            Informatika Kelas 12 · MAN 1 OKU TIMUR · Lomba Tarik Tambang Lapangan Sekolah
          </p>
          <h1 className="font-display font-bold text-[62px] leading-[1.15] text-outline-heavy">
            <span className="text-[#FF1744]">ARDUINO</span>{' '}
            <span className="text-[#FFD400]">TUG WAR</span> –{' '}
            <span className="text-[#29B6FF]">DUEL OTAK</span>
          </h1>
          <p className="text-[20px] leading-[1.35] font-bold text-white max-w-[920px] mx-auto text-outline-dark">
            Balapan jawab soal Arduino Uno, LED, breadboard, lampu lalu lintas, dan lampu ambulans
            secara real-time tanpa saling menunggu. Klik langsung tarik talinya!
          </p>
        </div>

        {/* Schoolyard 3D Arena Preview + Reference Team Emblem */}
        <div className="w-full rounded-3xl bg-gradient-to-b from-[#0B1B4D] to-[#16307A] border-[5px] border-[#FFD400] card-3d p-[20px] grid grid-cols-12 gap-[20px] items-center">
          <div className="col-span-8 relative h-[270px] rounded-2xl border-[4px] border-[#040B24] overflow-hidden flex items-end justify-center px-[16px] pb-[8px]">
            <SchoolBackground leader={null} dangerSide={null} excitementKey={0} compact />
            <div className="relative z-20 w-full flex justify-center">
              <TugOfWarRig
                ropePosition={0}
                stepsToWin={settings.stepsToWin}
                pullersPerTeam={settings.pullersPerTeam}
                redPose="idle"
                bluePose="idle"
                lightweightEffects={settings.lightweightEffects}
              />
            </div>
          </div>

          <div className="col-span-4 flex flex-col items-center justify-center gap-[14px]">
            {!imgErr && (
              <div className="w-full rounded-2xl bg-gradient-to-b from-[#1D3E9E] to-[#0B1B4D] p-[12px] border-[3px] border-[#29B6FF] shadow-[0_4px_0_#040B24]">
                <img
                  src={REFERENCE_MASCOT_URL}
                  alt="Maskot Resmi Tim Merah dan Tim Biru"
                  referrerPolicy="no-referrer"
                  onError={() => setImgErr(true)}
                  className="w-full h-[170px] object-contain rounded-xl"
                />
              </div>
            )}
            <div className="w-full p-[14px] rounded-2xl bg-[#071338] border-[3px] border-[#040B24] text-white text-[15px] leading-[1.35] font-bold flex flex-wrap items-center justify-center gap-x-[10px] gap-y-[4px] tabular-nums">
              <span className="text-[#FF5277]">
                ▲ {settings.redName}: {settings.redCount} siswa
              </span>
              <span className="text-[#FFD400]">·</span>
              <span className="text-[#60A5FA]">
                ● {settings.blueName}: {settings.blueCount} siswa
              </span>
              <span className="text-[#FFD400]">·</span>
              <span className="text-[#69F0AE]">
                {settings.endMode === 'time'
                  ? '50 soal/tim (otomatis)'
                  : `${settings.questionsPerTeam} soal/tim`}
              </span>
              <span className="text-[#FFD400]">·</span>
              <span className="text-[#FFD400]">
                Akhir: {END_MODE_SHORT[settings.endMode]}
                {settings.endMode !== 'questions' ? ` (${settings.totalTimeMinutes}m)` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-[18px] pt-[4px]">
          <button
            type="button"
            onClick={isConfigValid ? onStartNewGame : onOpenSettings}
            className="btn-3d inline-flex items-center justify-center gap-[12px] px-[38px] py-[18px] rounded-2xl bg-[#00C853] hover:bg-[#19DC6A] text-white font-display font-bold text-[24px] leading-none border-4 border-[#040B24] cursor-pointer min-h-[70px] whitespace-nowrap text-outline-dark"
          >
            <Play className="w-[26px] h-[26px] fill-current" />
            MULAI PERMAINAN
          </button>

          {hasActiveMatch && (
            <button
              type="button"
              onClick={onResumeMatch}
              className="btn-3d inline-flex items-center justify-center gap-[10px] px-[30px] py-[18px] rounded-2xl bg-[#FFD400] hover:bg-[#FFE042] text-[#0B1B4D] font-display font-bold text-[22px] leading-none border-4 border-[#040B24] cursor-pointer min-h-[70px] whitespace-nowrap"
            >
              <RotateCcw className="w-[24px] h-[24px]" />
              LANJUTKAN SESI
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            className="btn-3d inline-flex items-center justify-center gap-[10px] px-[30px] py-[18px] rounded-2xl bg-[#1E6BFF] hover:bg-[#3B82FF] text-white font-display font-bold text-[22px] leading-none border-4 border-[#040B24] cursor-pointer min-h-[70px] whitespace-nowrap text-outline-dark"
          >
            <Settings className="w-[24px] h-[24px]" />
            PENGATURAN
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="btn-3d inline-flex items-center justify-center gap-[10px] px-[30px] py-[18px] rounded-2xl bg-[#7C4DFF] hover:bg-[#936EFF] text-white font-display font-bold text-[22px] leading-none border-4 border-[#040B24] cursor-pointer min-h-[70px] whitespace-nowrap text-outline-dark"
          >
            <BookOpen className="w-[24px] h-[24px]" />
            PANDUAN
          </button>
        </div>
      </main>
    </div>
  );
};

interface SetupScreenProps {
  settings: GameSettings;
  onSaveSettings: (next: GameSettings) => void;
  onStartWithSettings: (next: GameSettings) => void;
  onResetSettings: () => GameSettings;
  onBackToMenu: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  settings,
  onSaveSettings,
  onStartWithSettings,
  onResetSettings,
  onBackToMenu,
}) => {
  const [draft, setDraft] = useState<GameSettings>(settings);
  const [redInput, setRedInput] = useState<string>(String(settings.redCount));
  const [blueInput, setBlueInput] = useState<string>(String(settings.blueCount));
  const [savedNotice, setSavedNotice] = useState(false);

  const parsedRed = Number.parseInt(redInput, 10);
  const parsedBlue = Number.parseInt(blueInput, 10);
  const validRed = !Number.isNaN(parsedRed) ? parsedRed : 0;
  const validBlue = !Number.isNaN(parsedBlue) ? parsedBlue : 0;
  const totalStudents = validRed + validBlue;

  const isRedInvalid = Number.isNaN(parsedRed) || parsedRed < 1;
  const isBlueInvalid = Number.isNaN(parsedBlue) || parsedBlue < 1;
  const isTotalOverLimit = totalStudents > 36;
  const isValid = !isRedInvalid && !isBlueInvalid && !isTotalOverLimit;

  const updateTeamCount = (team: 'red' | 'blue', nextVal: number) => {
    const clamped = Math.max(1, Math.min(35, nextVal));
    if (team === 'red') {
      setRedInput(String(clamped));
      setDraft((prev) => ({ ...prev, redCount: clamped }));
    } else {
      setBlueInput(String(clamped));
      setDraft((prev) => ({ ...prev, blueCount: clamped }));
    }
    setSavedNotice(false);
  };

  const handleManualInput = (team: 'red' | 'blue', raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    const num = cleaned === '' ? 0 : Number.parseInt(cleaned, 10);
    if (team === 'red') {
      setRedInput(cleaned);
      setDraft((prev) => ({ ...prev, redCount: num }));
    } else {
      setBlueInput(cleaned);
      setDraft((prev) => ({ ...prev, blueCount: num }));
    }
    setSavedNotice(false);
  };

  const buildCurrentSettings = (): GameSettings => ({
    ...draft,
    redName: draft.redName.trim() || 'TIM MERAH',
    blueName: draft.blueName.trim() || 'TIM BIRU',
    redCount: validRed,
    blueCount: validBlue,
  });

  const handleSave = () => {
    if (!isValid) return;
    onSaveSettings(buildCurrentSettings());
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleStart = () => {
    if (!isValid) return;
    onStartWithSettings(buildCurrentSettings());
  };

  const handleReset = () => {
    const defaults = onResetSettings();
    setDraft(defaults);
    setRedInput(String(defaults.redCount));
    setBlueInput(String(defaults.blueCount));
    setSavedNotice(false);
  };

  return (
    <div className="w-[1600px] h-[900px] bg-gradient-to-b from-[#071338] via-[#0B1B4D] to-[#071338] text-white flex flex-col overflow-hidden">
      <header className="h-[68px] shrink-0 px-[32px] bg-[#0B1B4D] border-b-4 border-[#FFD400] flex items-center justify-between gap-[16px]">
        <button
          type="button"
          onClick={onBackToMenu}
          className="btn-3d inline-flex items-center gap-[8px] px-[18px] py-[10px] rounded-xl border-[3px] border-[#040B24] bg-[#1E6BFF] hover:bg-[#3B82FF] text-[15px] font-bold text-white cursor-pointer min-h-[46px] whitespace-nowrap text-outline-dark"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
          KEMBALI KE MENU
        </button>

        <h1 className="font-display font-bold text-[28px] text-[#FFD400] text-outline-dark">
          Pengaturan Balapan Guru
        </h1>

        <div className="px-[16px] py-[8px] rounded-xl bg-[#071338] border-2 border-[#FFD400] text-[15px] font-bold tabular-nums">
          Total Siswa:{' '}
          <strong className={isTotalOverLimit ? 'text-[#FF5277]' : 'text-[#00E676]'}>
            {totalStudents} / 36
          </strong>
        </div>
      </header>

      <main className="flex-1 px-[32px] py-[18px] flex flex-col gap-[14px] min-h-0 overflow-hidden">
        {!isValid && (
          <div
            role="alert"
            className="px-[18px] py-[10px] rounded-2xl bg-[#5E0012] border-4 border-[#FF1744] text-white flex items-center gap-[12px] shrink-0"
          >
            <AlertTriangle className="w-[24px] h-[24px] text-[#FFD400] shrink-0" />
            <div className="text-[15px] font-bold">
              {isTotalOverLimit
                ? `Total siswa saat ini ${totalStudents} siswa, melebihi batas maksimal 36 siswa.`
                : 'Setiap tim wajib memiliki minimal 1 siswa.'}
            </div>
          </div>
        )}

        {/* 3-Column Non-Scrolling Cockpit for 1600x900 */}
        <div className="flex-1 grid grid-cols-12 gap-[20px] min-h-0">
          {/* Column 1 (4 cols): Tim Merah & Tim Biru */}
          <div className="col-span-4 flex flex-col gap-[16px] min-h-0">
            <div className="flex-1 p-[18px] rounded-3xl bg-[#0B1B4D] border-4 border-[#FF1744] card-3d-red flex flex-col justify-between">
              <div className="flex items-center gap-[14px]">
                <TeamBadge teamId="red" size="md" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[13px] font-bold text-[#FF8A9E] mb-[4px]">
                    ▲ Nama Tim Kiri
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={draft.redName}
                    onChange={(e) => setDraft((p) => ({ ...p, redName: e.target.value }))}
                    className="w-full px-[12px] py-[8px] rounded-xl border-[3px] border-[#FF1744] font-display font-bold text-[20px] text-white bg-[#071338] focus:outline-none focus:border-[#FFD400]"
                  />
                </div>
              </div>

              <div>
                <p className="text-[13px] font-bold text-[#93C5FD] mb-[8px]">
                  Jumlah Anggota (Estafet 1 s.d. {validRed > 0 ? validRed : 0})
                </p>
                <div className="flex items-center gap-[12px]">
                  <button
                    type="button"
                    onClick={() => updateTeamCount('red', validRed - 1)}
                    disabled={validRed <= 1}
                    aria-label="Kurangi Tim Merah"
                    className="btn-3d w-[54px] h-[54px] rounded-2xl bg-[#5E0012] hover:bg-[#88001B] disabled:opacity-40 border-[3px] border-[#FF1744] flex items-center justify-center text-white cursor-pointer"
                  >
                    <Minus className="w-[22px] h-[22px]" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={35}
                    value={redInput}
                    onChange={(e) => handleManualInput('red', e.target.value)}
                    className="flex-1 h-[54px] text-center font-display font-bold text-[30px] text-[#FFD400] bg-[#071338] border-[3px] border-[#040B24] rounded-2xl tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => updateTeamCount('red', validRed + 1)}
                    aria-label="Tambah Tim Merah"
                    className="btn-3d-red w-[54px] h-[54px] rounded-2xl bg-[#FF1744] hover:bg-[#FF3D64] text-white border-[3px] border-[#040B24] flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-[22px] h-[22px]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 p-[18px] rounded-3xl bg-[#0B1B4D] border-4 border-[#1E6BFF] card-3d-blue flex flex-col justify-between">
              <div className="flex items-center gap-[14px]">
                <TeamBadge teamId="blue" size="md" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[13px] font-bold text-[#7CC9FF] mb-[4px]">
                    ● Nama Tim Kanan
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={draft.blueName}
                    onChange={(e) => setDraft((p) => ({ ...p, blueName: e.target.value }))}
                    className="w-full px-[12px] py-[8px] rounded-xl border-[3px] border-[#1E6BFF] font-display font-bold text-[20px] text-white bg-[#071338] focus:outline-none focus:border-[#FFD400]"
                  />
                </div>
              </div>

              <div>
                <p className="text-[13px] font-bold text-[#93C5FD] mb-[8px]">
                  Jumlah Anggota (Estafet 1 s.d. {validBlue > 0 ? validBlue : 0})
                </p>
                <div className="flex items-center gap-[12px]">
                  <button
                    type="button"
                    onClick={() => updateTeamCount('blue', validBlue - 1)}
                    disabled={validBlue <= 1}
                    aria-label="Kurangi Tim Biru"
                    className="btn-3d w-[54px] h-[54px] rounded-2xl bg-[#0A2FA8] hover:bg-[#1342D6] disabled:opacity-40 border-[3px] border-[#29B6FF] flex items-center justify-center text-white cursor-pointer"
                  >
                    <Minus className="w-[22px] h-[22px]" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={35}
                    value={blueInput}
                    onChange={(e) => handleManualInput('blue', e.target.value)}
                    className="flex-1 h-[54px] text-center font-display font-bold text-[30px] text-[#FFD400] bg-[#071338] border-[3px] border-[#040B24] rounded-2xl tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => updateTeamCount('blue', validBlue + 1)}
                    aria-label="Tambah Tim Biru"
                    className="btn-3d-blue w-[54px] h-[54px] rounded-2xl bg-[#1E6BFF] hover:bg-[#3B82FF] text-white border-[3px] border-[#040B24] flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-[22px] h-[22px]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-[14px] rounded-2xl bg-[#0B1B4D] border-[3px] border-[#FFD400] text-[14px] font-bold text-[#93C5FD] text-center">
              Bank 50 soal/tim · Estafet berputar · Seri memicu Ronde Penentuan
            </div>
          </div>

          {/* Column 2 (4 cols): Race Rules & Modes */}
          <div className="col-span-4 p-[18px] rounded-3xl bg-[#0B1B4D] border-4 border-[#29B6FF] card-3d flex flex-col justify-between gap-[12px]">
            <div className="space-y-[8px]">
              <h3 className="font-display font-bold text-[18px] text-[#FFD400]">
                Akhiri Permainan Dengan
              </h3>
              <div className="grid grid-cols-3 gap-[8px]">
                {(
                  [
                    { id: 'questions', label: 'SOAL HABIS', sub: 'Semua selesai' },
                    { id: 'time', label: 'WAKTU', sub: '50 soal penuh' },
                    { id: 'both', label: 'KEDUANYA', sub: 'Mana duluan' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      setDraft((p) => {
                        if (mode.id === 'time') {
                          return {
                            ...p,
                            endMode: 'time',
                            totalTimeMinutes: 3,
                            timerSeconds: 10,
                          };
                        }
                        return { ...p, endMode: mode.id };
                      })
                    }
                    className={`btn-3d p-[8px] rounded-xl border-2 border-[#040B24] cursor-pointer text-center min-h-[62px] flex flex-col items-center justify-center ${
                      draft.endMode === mode.id
                        ? 'bg-[#FFD400] text-[#0B1B4D]'
                        : 'bg-[#16307A] text-white'
                    }`}
                  >
                    <span className="font-display font-bold text-[14px]">{mode.label}</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        draft.endMode === mode.id ? 'text-[#0B1B4D]/80' : 'text-[#93C5FD]'
                      }`}
                    >
                      {mode.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-[8px]">
              <h3 className="font-display font-bold text-[16px] text-[#FFD400]">
                Jumlah Soal Per Tim
              </h3>
              {draft.endMode === 'time' ? (
                <div className="p-[12px] rounded-xl bg-[#071338] border-2 border-[#00C853] text-[13px] leading-[1.35] font-semibold text-[#69F0AE]">
                  Mode Waktu otomatis memakai bank penuh <strong>50 soal per tim</strong>.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-[8px]">
                  {([10, 25, 50] as QuestionsCountOption[]).map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, questionsPerTeam: qty }))}
                      className={`btn-3d py-[10px] rounded-xl font-display font-bold text-[16px] border-2 border-[#040B24] cursor-pointer min-h-[48px] tabular-nums ${
                        draft.questionsPerTeam === qty
                          ? 'bg-[#00C853] text-white text-outline-dark'
                          : 'bg-[#16307A] text-white'
                      }`}
                    >
                      {qty} soal
                    </button>
                  ))}
                </div>
              )}
            </div>

            {draft.endMode !== 'questions' && (
              <div className="space-y-[8px]">
                <h3 className="font-display font-bold text-[16px] text-[#FFD400]">
                  Durasi Waktu Permainan
                </h3>
                <div className="grid grid-cols-3 gap-[8px]">
                  {([3, 5, 10] as TotalTimeOption[]).map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, totalTimeMinutes: mins }))}
                      className={`btn-3d py-[10px] rounded-xl font-display font-bold text-[16px] border-2 border-[#040B24] cursor-pointer min-h-[48px] tabular-nums ${
                        draft.totalTimeMinutes === mins
                          ? 'bg-[#FFD400] text-[#0B1B4D]'
                          : 'bg-[#16307A] text-white'
                      }`}
                    >
                      {mins} menit
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-[12px]">
              <div className="space-y-[8px]">
                <h3 className="font-display font-bold text-[15px] text-[#FFD400]">
                  Timer Per Soal
                </h3>
                <div className="grid grid-cols-3 gap-[6px]">
                  {([10, 15, 20] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, timerSeconds: sec }))}
                      className={`btn-3d py-[10px] rounded-xl font-display font-bold text-[15px] border-2 border-[#040B24] cursor-pointer min-h-[48px] tabular-nums ${
                        draft.timerSeconds === sec
                          ? 'bg-[#FFD400] text-[#0B1B4D]'
                          : 'bg-[#16307A] text-white'
                      }`}
                    >
                      {sec}d
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-[8px]">
                <h3 className="font-display font-bold text-[15px] text-[#FFD400]">
                  Penarik Per Tim
                </h3>
                <div className="grid grid-cols-3 gap-[6px]">
                  {([3, 4, 5] as const).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, pullersPerTeam: cnt }))}
                      className={`btn-3d py-[10px] rounded-xl font-display font-bold text-[15px] border-2 border-[#040B24] cursor-pointer min-h-[48px] tabular-nums ${
                        draft.pullersPerTeam === cnt
                          ? 'bg-[#00C853] text-white text-outline-dark'
                          : 'bg-[#16307A] text-white'
                      }`}
                    >
                      {cnt} org
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[12px]">
              <div className="space-y-[8px]">
                <h3 className="font-display font-bold text-[15px] text-[#FFD400]">
                  Batas Garis ({draft.stepsToWin})
                </h3>
                <div className="flex items-center gap-[8px]">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({ ...p, stepsToWin: Math.max(3, p.stepsToWin - 1) }))
                    }
                    className="btn-3d w-[46px] h-[46px] rounded-xl border-2 border-[#040B24] bg-[#16307A] text-white font-bold cursor-pointer flex items-center justify-center"
                  >
                    <Minus className="w-[18px] h-[18px]" />
                  </button>
                  <div className="flex-1 h-[46px] rounded-xl border-2 border-[#040B24] bg-[#071338] text-[#FFD400] font-display font-bold text-[20px] flex items-center justify-center tabular-nums">
                    {draft.stepsToWin}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({ ...p, stepsToWin: Math.min(10, p.stepsToWin + 1) }))
                    }
                    className="btn-3d w-[46px] h-[46px] rounded-xl border-2 border-[#040B24] bg-[#00C853] text-white font-bold cursor-pointer flex items-center justify-center"
                  >
                    <Plus className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>

              <div className="space-y-[8px]">
                <h3 className="font-display font-bold text-[15px] text-[#FFD400]">
                  Prioritas Kesulitan
                </h3>
                <select
                  value={draft.difficultyFilter}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      difficultyFilter: e.target.value as DifficultyFilter,
                    }))
                  }
                  className="w-full h-[46px] px-[10px] rounded-xl border-2 border-[#040B24] bg-[#071338] text-white font-bold text-[14px] focus:outline-none focus:border-[#FFD400]"
                >
                  <option value="Semua">Semua (80% Mudah, 20% Sedang)</option>
                  <option value="Mudah">Mudah (40 soal)</option>
                  <option value="Sedang">Sedang (10 soal)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Column 3 (4 cols): Toggles & Video Options */}
          <div className="col-span-4 p-[18px] rounded-3xl bg-[#0B1B4D] border-4 border-[#FFD400] card-3d flex flex-col justify-between gap-[8px]">
            <h3 className="font-display font-bold text-[18px] text-[#FFD400]">
              Opsi Tambahan &amp; Tampilan Video
            </h3>

            <label className="flex items-center justify-between gap-[12px] p-[12px] rounded-xl bg-[#13296B] border-2 border-[#29B6FF] cursor-pointer">
              <div className="flex items-start gap-[10px]">
                <Video className="w-[20px] h-[20px] text-[#FFD400] shrink-0 mt-[2px]" />
                <div>
                  <p className="font-bold text-[15px] text-white">Mode Rekam Video</p>
                  <p className="text-[12px] leading-[1.3] text-[#93C5FD]">
                    Garis tepi tebal &amp; kontras tinggi untuk Smartboard dan video
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={draft.videoRecordMode}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, videoRecordMode: e.target.checked }))
                }
                className="w-[24px] h-[24px] accent-[#FFD400] cursor-pointer shrink-0"
              />
            </label>

            <label className="flex items-center justify-between gap-[12px] p-[12px] rounded-xl bg-[#13296B] border-2 border-[#7C4DFF] cursor-pointer">
              <div className="flex items-start gap-[10px]">
                <Sparkles className="w-[20px] h-[20px] text-[#69F0AE] shrink-0 mt-[2px]" />
                <div>
                  <p className="font-bold text-[15px] text-white">Efek Ringan</p>
                  <p className="text-[12px] leading-[1.3] text-[#93C5FD]">
                    Mengurangi partikel konfeti &amp; animasi latar agar mulus
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={draft.lightweightEffects}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, lightweightEffects: e.target.checked }))
                }
                className="w-[24px] h-[24px] accent-[#00C853] cursor-pointer shrink-0"
              />
            </label>

            <label className="flex items-center justify-between gap-[12px] p-[12px] rounded-xl bg-[#5E0012]/80 border-2 border-[#FF1744] cursor-pointer">
              <div>
                <p className="font-bold text-[15px] text-white">Salah = Lawan Tarik Tali</p>
                <p className="text-[12px] leading-[1.3] text-[#FFB3C1]">
                  Salah atau waktu habis menarik tali 1 langkah ke lawan
                </p>
              </div>
              <input
                type="checkbox"
                checked={draft.wrongPullsOpponent}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, wrongPullsOpponent: e.target.checked }))
                }
                className="w-[24px] h-[24px] accent-[#FF1744] cursor-pointer shrink-0"
              />
            </label>

            <label className="flex items-center justify-between gap-[12px] p-[12px] rounded-xl bg-[#071338] border-2 border-[#1E6BFF]/60 cursor-pointer">
              <div>
                <p className="font-bold text-[15px] text-white">Soal Bonus ⚡ x2</p>
                <p className="text-[12px] leading-[1.3] text-[#93C5FD]">
                  Beberapa soal bernilai 2 langkah tarik tali saat benar
                </p>
              </div>
              <input
                type="checkbox"
                checked={draft.bonusEnabled}
                onChange={(e) => setDraft((p) => ({ ...p, bonusEnabled: e.target.checked }))}
                className="w-[24px] h-[24px] accent-[#00C853] cursor-pointer shrink-0"
              />
            </label>

            <label className="flex items-center justify-between gap-[12px] p-[12px] rounded-xl bg-[#071338] border-2 border-[#1E6BFF]/60 cursor-pointer">
              <div>
                <p className="font-bold text-[15px] text-white">Tampilkan Penjelasan Singkat</p>
                <p className="text-[12px] leading-[1.3] text-[#93C5FD]">
                  Default OFF agar balapan cepat; nyalakan untuk pembahasan
                </p>
              </div>
              <input
                type="checkbox"
                checked={draft.showExplanation}
                onChange={(e) => setDraft((p) => ({ ...p, showExplanation: e.target.checked }))}
                className="w-[24px] h-[24px] accent-[#00C853] cursor-pointer shrink-0"
              />
            </label>

            <label className="flex items-center justify-between gap-[12px] p-[12px] rounded-xl bg-[#071338] border-2 border-[#1E6BFF]/60 cursor-pointer">
              <div>
                <p className="font-bold text-[15px] text-white">Izinkan Ulangi Soal</p>
                <p className="text-[12px] leading-[1.3] text-[#93C5FD]">
                  Tombol ulangi soal di Panel Guru tanpa mengubah skor
                </p>
              </div>
              <input
                type="checkbox"
                checked={draft.allowRepeatQuestion}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, allowRepeatQuestion: e.target.checked }))
                }
                className="w-[24px] h-[24px] accent-[#00C853] cursor-pointer shrink-0"
              />
            </label>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="h-[62px] shrink-0 flex items-center justify-between gap-[16px]">
          <button
            type="button"
            onClick={handleReset}
            className="btn-3d inline-flex items-center justify-center gap-[10px] px-[24px] py-[12px] rounded-2xl bg-[#7C4DFF] hover:bg-[#936EFF] text-white border-[3px] border-[#040B24] font-bold text-[16px] cursor-pointer min-h-[54px] text-outline-dark"
          >
            <RotateCcw className="w-[18px] h-[18px]" />
            RESET PENGATURAN
          </button>

          <div className="flex items-center gap-[14px]">
            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid}
              className="btn-3d inline-flex items-center justify-center gap-[10px] px-[28px] py-[12px] rounded-2xl bg-[#FFD400] hover:bg-[#FFE042] disabled:opacity-40 border-[3px] border-[#040B24] text-[#0B1B4D] font-display font-bold text-[18px] cursor-pointer min-h-[54px]"
            >
              {savedNotice ? (
                <>
                  <Check className="w-[20px] h-[20px]" /> TERSIMPAN!
                </>
              ) : (
                <>
                  <Save className="w-[20px] h-[20px]" /> SIMPAN PENGATURAN
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleStart}
              disabled={!isValid}
              className="btn-3d inline-flex items-center justify-center gap-[10px] px-[34px] py-[12px] rounded-2xl bg-[#00C853] hover:bg-[#19DC6A] disabled:opacity-40 border-[3px] border-[#040B24] text-white font-display font-bold text-[20px] cursor-pointer min-h-[54px] text-outline-dark"
            >
              <Play className="w-[20px] h-[20px] fill-current" />
              MULAI DUEL
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
