import React from 'react';
import { Clock, Cpu, Gauge, Users, X, Zap } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#040B24]/82 p-[24px]"
    >
      <div className="animate-pop-in bg-[#0B1B4D] text-white rounded-3xl border-[5px] border-[#FFD400] card-3d w-[1040px] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-[28px] py-[18px] bg-[#071338] border-b-4 border-[#040B24]">
          <h2 id="guide-title" className="font-display font-bold text-[24px] text-[#FFD400] text-outline-dark">
            Panduan Balapan Tarik Tambang Real-Time
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan"
            className="btn-3d w-[44px] h-[44px] rounded-xl bg-[#FF1744] hover:bg-[#FF3D64] border-2 border-[#040B24] flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-[22px] h-[22px]" />
          </button>
        </div>

        <div className="p-[24px] space-y-[16px] text-[17px] text-white leading-[1.35]">
          <div className="grid grid-cols-2 gap-[16px]">
            <div className="p-[18px] rounded-2xl bg-[#13296B] border-[3px] border-[#29B6FF] space-y-[6px]">
              <div className="flex items-center gap-[8px] font-display font-bold text-[19px] text-[#FFD400]">
                <Gauge className="w-[22px] h-[22px] text-[#FF5277]" />
                <span>1. Bank 50 Soal &amp; Balapan Mandiri</span>
              </div>
              <p className="text-white/95">
                Tersedia <strong className="text-[#FFD400]">50 soal per tim</strong> (bisa dipilih 10, 25, atau 50 soal) dan
                berjalan mandiri tanpa menunggu. Menyentuh garis hanya menampilkan status{' '}
                <strong className="text-[#00E676]">UNGGUL!</strong> — tim yang tertinggal tetap bisa menyusul!
              </p>
            </div>

            <div className="p-[18px] rounded-2xl bg-[#13296B] border-[3px] border-[#FFD400] space-y-[6px]">
              <div className="flex items-center gap-[8px] font-display font-bold text-[19px] text-[#FFD400]">
                <Users className="w-[22px] h-[22px] text-[#29B6FF]" />
                <span>2. Estafet Berputar Terus</span>
              </div>
              <p className="text-white/95">
                Giliran berputar urut dari Pemain 1 hingga pemain terakhir, lalu kembali ke Pemain 1
                di putaran berikutnya. Tidak ada pemain yang dilompati atau mendapat giliran ganda
                dalam satu putaran.
              </p>
            </div>

            <div className="p-[18px] rounded-2xl bg-[#064E1D] border-[3px] border-[#00C853] space-y-[6px]">
              <div className="flex items-center gap-[8px] font-display font-bold text-[19px] text-[#69F0AE]">
                <Clock className="w-[22px] h-[22px] text-[#FFD400]" />
                <span>3. Cara Mengakhiri Game</span>
              </div>
              <p className="text-white/95">
                Guru dapat memilih akhir permainan: <strong className="text-[#FFD400]">Soal Habis</strong> (10/25/50 soal),{' '}
                <strong className="text-[#FFD400]">Waktu</strong> (3/5/10 menit dengan bank penuh 50 soal), atau{' '}
                <strong className="text-[#FFD400]">Keduanya</strong> (mana yang lebih dulu).
              </p>
            </div>

            <div className="p-[18px] rounded-2xl bg-[#3B177A] border-[3px] border-[#7C4DFF] space-y-[6px]">
              <div className="flex items-center gap-[8px] font-display font-bold text-[19px] text-[#FFD400]">
                <Zap className="w-[22px] h-[22px] text-[#FFD400]" />
                <span>4. Ronde Penentuan Saat Seri</span>
              </div>
              <p className="text-white/95">
                Jika selisih tali akhir tepat <strong className="text-[#FFD400]">0 (seri)</strong>, otomatis masuk{' '}
                <strong className="text-[#FFD400]">RONDE PENENTUAN</strong>: satu wakil acak tiap tim menjawab soal cadangan
                bersamaan hingga ada tim yang unggul.
              </p>
            </div>
          </div>

          <div className="p-[18px] rounded-2xl bg-[#071338] border-[3px] border-[#1E6BFF] space-y-[6px]">
            <div className="flex items-center gap-[8px] font-display font-bold text-[19px] text-[#29B6FF]">
              <Cpu className="w-[22px] h-[22px] text-[#00E676]" />
              <span>Materi Arduino Kelas 12</span>
            </div>
            <p className="text-white/95">
              Arduino Uno, kabel USB &amp; adaptor, breadboard, kabel jumper, LED 4 warna,
              anoda/katoda, pin digital &amp; GND, Arduino IDE, <code className="font-mono text-[#69F0AE]">#define</code>,{' '}
              <code className="font-mono text-[#69F0AE]">void setup()</code>, <code className="font-mono text-[#69F0AE]">void loop()</code>,{' '}
              <code className="font-mono text-[#69F0AE]">pinMode()</code>, <code className="font-mono text-[#69F0AE]">digitalWrite()</code>,{' '}
              <code className="font-mono text-[#69F0AE]">delay()</code>, lampu lalu lintas, dan lampu ambulans.
            </p>
          </div>
        </div>

        <div className="px-[28px] py-[16px] border-t-4 border-[#040B24] bg-[#071338] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-3d px-[28px] py-[12px] rounded-xl bg-[#00C853] hover:bg-[#19DC6A] text-white border-2 border-[#040B24] font-display font-bold text-[17px] cursor-pointer min-h-[48px] text-outline-dark"
          >
            MENGERTI &amp; TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
