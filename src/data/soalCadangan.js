/**
 * SOAL CADANGAN RONDE PENENTUAN (5 per tim) + KUNCI & PENJELASAN
 * Mematuhi batas materi praktik Arduino Uno Kelas 12.
 */

export const CADANGAN_MERAH = [
  {
    id: 'cm1',
    tim: 'merah',
    materi: 'Kaki LED',
    tingkat: 'Mudah',
    bonus: false,
    pertanyaan: 'Pada lampu LED, kabel jumper yang menuju ke pin digital Arduino harus dipasang sejajar dengan...',
    pilihan: [
      'Kaki panjang (+) LED',
      'Kaki pendek (−) LED',
      'Rel negatif (−) breadboard',
      'Pin GND Arduino',
    ],
  },
  {
    id: 'cm2',
    tim: 'merah',
    materi: 'Perintah #define',
    tingkat: 'Mudah',
    bonus: false,
    pertanyaan: 'Manakah penulisan #define yang benar untuk memberi nama lampu pada pin 12?',
    pilihan: [
      '#define lampu 12;',
      '#define lampu 12',
      'define lampu 12',
      '#define lampu = 12;',
    ],
  },
  {
    id: 'cm3',
    tim: 'merah',
    materi: 'delay dan Waktu',
    tingkat: 'Mudah',
    bonus: false,
    pertanyaan: 'Untuk membuat lampu LED menyala selama setengah detik, perintah yang dipakai adalah...',
    pilihan: ['delay(5);', 'delay(50);', 'delay(500);', 'delay(5000);'],
  },
  {
    id: 'cm4',
    tim: 'merah',
    materi: 'Kesalahan Kode',
    tingkat: 'Sedang',
    bonus: false,
    pertanyaan: 'Apa kesalahan pada potongan kode berikut saat akan di-upload?',
    kode: 'void loop() {\n  digitalWrite(merah, HIGH);\n  delay(1000)\n}',
    pilihan: [
      'Nama merah harus huruf besar',
      'Kurang titik koma (;) di delay',
      'Kata HIGH harus diganti LOW',
      'void loop() wajib jadi setup()',
    ],
  },
  {
    id: 'cm5',
    tim: 'merah',
    materi: 'Membaca Kode',
    tingkat: 'Sedang',
    bonus: false,
    pertanyaan: 'Jika kode lampu ambulans ini berjalan, lampu mana yang menyala selama 1 detik?',
    kode: 'digitalWrite(merah, HIGH);\ndigitalWrite(biru, LOW);\ndelay(1000);',
    pilihan: [
      'Hanya lampu merah',
      'Hanya lampu biru',
      'Merah dan biru nyala',
      'Kedua lampu padam',
    ],
  },
];

export const KUNCI_CADANGAN_MERAH = {
  cm1: { jawaban: 0, penjelasan: 'Kabel ke pin digital dipasang sejajar (satu kolom) dengan kaki panjang (+) LED.' },
  cm2: { jawaban: 1, penjelasan: '#define ditulis tanpa tanda sama dengan dan tanpa titik koma di akhir baris.' },
  cm3: { jawaban: 2, penjelasan: '500 milidetik sama dengan setengah detik (0,5 detik).' },
  cm4: { jawaban: 1, penjelasan: 'Setiap perintah termasuk delay(1000); wajib ditutup dengan tanda titik koma (;).' },
  cm5: { jawaban: 0, penjelasan: 'merah diberi nilai HIGH (menyala) sedangkan biru diberi nilai LOW (mati).' },
};

export const CADANGAN_BIRU = [
  {
    id: 'cb1',
    tim: 'biru',
    materi: 'Kabel USB dan Adaptor',
    tingkat: 'Mudah',
    bonus: false,
    pertanyaan: 'Agar Arduino Uno dapat menyala sendiri di meja setelah program di-upload tanpa laptop, kita menyambungkan...',
    pilihan: ['Kabel USB ke mouse', 'Breadboard tambahan', 'Adaptor daya listrik', 'Kabel jumper monitor'],
  },
  {
    id: 'cb2',
    tim: 'biru',
    materi: 'Langkah Merakit',
    tingkat: 'Mudah',
    bonus: false,
    pertanyaan: 'Pada rakitan 3 lampu lalu lintas, dari mana kabel terakhir menuju pin GND Arduino berasal?',
    pilihan: [
      'Dari port USB laptop',
      'Dari rel positif (+) breadboard',
      'Dari rel negatif (−) breadboard',
      'Dari kaki panjang (+) LED kuning',
    ],
  },
  {
    id: 'cb3',
    tim: 'biru',
    materi: 'digitalWrite HIGH LOW',
    tingkat: 'Mudah',
    bonus: false,
    pertanyaan: 'Perintah untuk menyalakan lampu di pin bernama "hijau" adalah...',
    pilihan: [
      'digitalWrite(hijau, LOW);',
      'pinMode(hijau, HIGH);',
      'digitalwrite(hijau, HIGH);',
      'digitalWrite(hijau, HIGH);',
    ],
  },
  {
    id: 'cb4',
    tim: 'biru',
    materi: 'Kesalahan Kode',
    tingkat: 'Sedang',
    bonus: false,
    pertanyaan: 'Bagian mana yang salah pada baris kode ini?',
    kode: 'void setup() {\n  pinMode(biru, Output);\n}',
    pilihan: [
      'pinMode harus ditulis pinmode',
      'Output wajib kapital: OUTPUT',
      'Kurang #define dalam kurung',
      'Kurang kurung kurawal tutup }',
    ],
  },
  {
    id: 'cb5',
    tim: 'biru',
    materi: 'Membaca Kode',
    tingkat: 'Sedang',
    bonus: false,
    pertanyaan: 'Menurut potongan kode berikut, lampu mana yang sedang PADAM selama delay(2000);?',
    kode: 'digitalWrite(kuning, LOW);\ndigitalWrite(hijau, HIGH);\ndelay(2000);',
    pilihan: [
      'Hanya lampu hijau',
      'Hanya lampu kuning',
      'Kuning dan hijau padam',
      'Kuning dan hijau menyala',
    ],
  },
];

export const KUNCI_CADANGAN_BIRU = {
  cb1: { jawaban: 2, penjelasan: 'Adaptor menjadi sumber daya Arduino agar tetap menyala tanpa komputer setelah program masuk.' },
  cb2: { jawaban: 2, penjelasan: 'Rel negatif (−) breadboard dihubungkan dengan satu kabel jumper ke pin GND Arduino.' },
  cb3: { jawaban: 3, penjelasan: 'digitalWrite memakai huruf W besar dan nilai HIGH huruf kapital untuk menyalakan LED.' },
  cb4: { jawaban: 1, penjelasan: 'Kata kunci OUTPUT pada perintah pinMode() wajib ditulis dengan huruf kapital semua.' },
  cb5: { jawaban: 1, penjelasan: 'kuning diberi nilai LOW sehingga padam, sedangkan hijau diberi nilai HIGH sehingga menyala.' },
};
