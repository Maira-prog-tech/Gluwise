import React from 'react';
import { ScanResult } from '../services/api';
import './ScanResultComponent.css';

interface ScanResultComponentProps {
  result: ScanResult;
}

const ScanResultComponent: React.FC<ScanResultComponentProps> = ({ result }) => {
  const getHealthScoreColor = (score: number): string => {
    if (score >= 8) return '#4CAF50'; // Green
    if (score >= 6) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getHealthScoreLabel = (score: number): string => {
    if (score >= 8) return 'Отлично';
    if (score >= 6) return 'Хорошо';
    if (score >= 4) return 'Удовлетворительно';
    return 'Плохо';
  };

  const formatScanType = (type: string): string => {
    switch (type) {
      case 'barcode': return 'Штрих-код';
      case 'image': return 'Изображение';
      case 'manual': return 'Текстовый поиск';
      default: return type;
    }
  };

  return (
    <div className="scan-result">
      {/* Product Info */}
      <div className="result-section product-info">
        <h4 className="section-title">
          <span className="section-icon">📦</span>
          Информация о продукте
        </h4>
        <div className="product-details">
          <div className="product-header">
            <h5 className="product-name">{result.product.name}</h5>
            <span className="product-brand">{result.product.brand}</span>
          </div>
          <p className="product-description">{result.product.description}</p>
          <div className="product-meta">
            <span className="category">Категория: {result.product.category}</span>
            {result.product.barcode && (
              <span className="barcode">Штрих-код: {result.product.barcode}</span>
            )}
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="result-section health-score">
        <h4 className="section-title">
          <span className="section-icon">🎯</span>
          Оценка полезности
        </h4>
        <div className="score-display">
          <div 
            className="score-circle"
            style={{ borderColor: getHealthScoreColor(result.analysis.health_score) }}
          >
            <span 
              className="score-value"
              style={{ color: getHealthScoreColor(result.analysis.health_score) }}
            >
              {result.analysis.health_score}/10
            </span>
            <span className="score-label">
              {getHealthScoreLabel(result.analysis.health_score)}
            </span>
          </div>
          <div className="score-insights">
            <p>{result.analysis.insights}</p>
          </div>
        </div>
      </div>

      {/* Nutrition Facts */}
      <div className="result-section nutrition-facts">
        <h4 className="section-title">
          <span className="section-icon">📊</span>
          Пищевая ценность
          <span className="serving-size">на {result.nutrition.serving_size}</span>
        </h4>
        <div className="nutrition-grid">
          <div className="nutrition-item calories">
            <span className="nutrition-label">Калории</span>
            <span className="nutrition-value">{result.nutrition.calories} ккал</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Белки</span>
            <span className="nutrition-value">{result.nutrition.protein}г</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Жиры</span>
            <span className="nutrition-value">{result.nutrition.fat}г</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Углеводы</span>
            <span className="nutrition-value">{result.nutrition.carbs}г</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Клетчатка</span>
            <span className="nutrition-value">{result.nutrition.fiber}г</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Сахар</span>
            <span className="nutrition-value">{result.nutrition.sugar}г</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Натрий</span>
            <span className="nutrition-value">{result.nutrition.sodium}мг</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {result.analysis.recommendations.length > 0 && (
        <div className="result-section recommendations">
          <h4 className="section-title">
            <span className="section-icon">💡</span>
            Рекомендации
          </h4>
          <ul className="recommendations-list">
            {result.analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="recommendation-item">
                <span className="recommendation-icon">✅</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {result.analysis.benefits && result.analysis.benefits.length > 0 && (
        <div className="result-section benefits">
          <h4 className="section-title">
            <span className="section-icon">🌟</span>
            Полезные свойства
          </h4>
          <ul className="benefits-list">
            {result.analysis.benefits.map((benefit, index) => (
              <li key={index} className="benefit-item">
                <span className="benefit-icon">🌟</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {result.analysis.warnings.length > 0 && (
        <div className="result-section warnings">
          <h4 className="section-title">
            <span className="section-icon">⚠️</span>
            Предупреждения
          </h4>
          <ul className="warnings-list">
            {result.analysis.warnings.map((warning, index) => (
              <li key={index} className="warning-item">
                <span className="warning-icon">⚠️</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scan Metadata */}
      <div className="result-section scan-metadata">
        <h4 className="section-title">
          <span className="section-icon">📋</span>
          Информация о сканировании
        </h4>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Тип сканирования:</span>
            <span className="metadata-value">{formatScanType(result.scan_metadata.scan_type)}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Время обработки:</span>
            <span className="metadata-value">{result.scan_metadata.processing_time_ms}мс</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Уверенность:</span>
            <span className="metadata-value">{Math.round(result.scan_metadata.confidence * 100)}%</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">ID сканирования:</span>
            <span className="metadata-value scan-id">{result.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanResultComponent;
