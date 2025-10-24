import React, { useState, useRef } from 'react';
import { apiService, ScanResult } from '../services/api';
import ScanResultComponent from './ScanResultComponent';
import './ScannerComponent.css';

const ScannerComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'barcode' | 'image' | 'text'>('barcode');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let scanResult: ScanResult;

      switch (activeTab) {
        case 'barcode':
          if (!barcodeInput.trim()) {
            throw new Error('Введите штрих-код');
          }
          scanResult = await apiService.scanBarcode(barcodeInput.trim());
          break;

        case 'text':
          if (!textInput.trim()) {
            throw new Error('Введите название продукта');
          }
          scanResult = await apiService.analyzeText(textInput.trim());
          break;

        case 'image':
          const file = fileInputRef.current?.files?.[0];
          if (!file) {
            throw new Error('Выберите изображение');
          }
          scanResult = await apiService.scanImage(file);
          break;

        default:
          throw new Error('Неизвестный тип сканирования');
      }

      setResult(scanResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Автоматически запускаем сканирование при выборе файла
      setTimeout(handleScan, 100);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    setBarcodeInput('');
    setTextInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="scanner-component">
      <div className="scanner-header">
        <h3>Сканирование продуктов</h3>
        <p>Выберите способ анализа продукта</p>
      </div>

      {/* Tabs */}
      <div className="scanner-tabs">
        <button
          className={`tab ${activeTab === 'barcode' ? 'active' : ''}`}
          onClick={() => setActiveTab('barcode')}
        >
          <span className="tab-icon">📊</span>
          Штрих-код
        </button>
        <button
          className={`tab ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          <span className="tab-icon">📷</span>
          Фото
        </button>
        <button
          className={`tab ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <span className="tab-icon">🔍</span>
          Поиск
        </button>
      </div>

      {/* Scanner Content */}
      <div className="scanner-content">
        {activeTab === 'barcode' && (
          <div className="scan-method">
            <div className="input-group">
              <label htmlFor="barcode-input">Штрих-код продукта</label>
              <input
                id="barcode-input"
                type="text"
                placeholder="Введите штрих-код (например: 1234567890123)"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
            <button 
              className="scan-button"
              onClick={handleScan}
              disabled={loading || !barcodeInput.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Сканирование...
                </>
              ) : (
                <>
                  <span>📊</span>
                  Сканировать штрих-код
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="scan-method">
            <div className="image-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <div 
                className="upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">📷</div>
                <p>Нажмите для выбора изображения</p>
                <p className="upload-hint">Поддерживаются: JPG, PNG, WEBP</p>
              </div>
            </div>
            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Анализ изображения...</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'text' && (
          <div className="scan-method">
            <div className="input-group">
              <label htmlFor="text-input">Название продукта</label>
              <input
                id="text-input"
                type="text"
                placeholder="Введите название продукта (например: яблочный сок)"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              />
            </div>
            <button 
              className="scan-button"
              onClick={handleScan}
              disabled={loading || !textInput.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Поиск...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Найти продукт
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            <span>{error}</span>
            <button onClick={clearResults} className="clear-button">
              Очистить
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="results-section">
            <div className="results-header">
              <h4>Результаты анализа</h4>
              <button onClick={clearResults} className="clear-button">
                Новый поиск
              </button>
            </div>
            <ScanResultComponent result={result} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerComponent;
