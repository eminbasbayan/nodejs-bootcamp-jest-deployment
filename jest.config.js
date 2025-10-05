module.exports = {
  testEnvironment: 'node', // Node.js ortamında çalış
  coveragePathIgnorePatterns: ['/node_modules/'], // Coverage'a dahil etme
  testMatch: ['**/__tests__/**/*.test.js'], // Test dosyalarını bul
  collectCoverageFrom: [
    // Coverage toplanacak dosyalar
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
  ],
  coverageDirectory: 'coverage', // Coverage raporu klasörü
  verbose: true, // Detaylı çıktı
  forceExit: true, // Testler bitince çık
  clearMocks: true, // Her testten sonra mock'ları temizle
  resetMocks: true,
  restoreMocks: true,
};
