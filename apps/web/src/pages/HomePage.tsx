import React, { useState, useEffect } from 'react';
import { apiService, HealthStatus } from '../services/api';
import ScannerComponent from '../components/ScannerComponent';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      setLoading(true);
      const status = await apiService.getHealth();
      setHealthStatus(status);
      setError(null);
    } catch (err) {
      setError('Не удалось подключиться к API');
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">
              <span className="logo-icon">🔍</span>
              GluWise
            </h1>
            <p className="tagline">Умный анализ продуктов питания</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        {/* Фоновые анимированные элементы */}
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
          </div>
          <div className="light-beams">
            <div className="beam beam-1"></div>
            <div className="beam beam-2"></div>
            <div className="beam beam-3"></div>
          </div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h2 className="hero-title">
                🤖 Ваш персональный AI-диетолог
              </h2>
              <p className="hero-subtitle">
                Революционная система анализа продуктов питания на основе искусственного интеллекта
              </p>
              <p className="hero-description">
                <strong>GluWise</strong> использует передовые технологии машинного обучения и компьютерного зрения 
                для мгновенного анализа любых продуктов питания. Получите профессиональные рекомендации 
                диетолога за секунды!
              </p>
              <div className="hero-features">
                <div className="hero-feature">
                  <span className="feature-emoji">🔬</span>
                  <span>Реальный Gemini AI</span>
                </div>
                <div className="hero-feature">
                  <span className="feature-emoji">⚡</span>
                  <span>Анализ за 10 секунд</span>
                </div>
                <div className="hero-feature">
                  <span className="feature-emoji">🎯</span>
                  <span>Точность 95%+</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image">
                {/* Декоративные элементы */}
                <div className="decoration-orb orb-1"></div>
                <div className="decoration-orb orb-2"></div>
                <div className="decoration-orb orb-3"></div>
                
                {/* Анимированные частицы */}
                <div className="particles">
                  <div className="particle particle-1">✨</div>
                  <div className="particle particle-2">⭐</div>
                  <div className="particle particle-3">💫</div>
                  <div className="particle particle-4">🌟</div>
                  <div className="particle particle-5">✨</div>
                </div>

                {/* Продуктовые карточки с голографическими эффектами */}
                <div className="floating-card card-1">
                  <div className="card-hologram"></div>
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="card-icon">🥑</div>
                    <div className="card-text">
                      <div className="card-title">Авокадо</div>
                      <div className="card-score">
                        <span className="score-number">9</span>
                        <span className="score-divider">/</span>
                        <span className="score-total">10</span>
                        <div className="score-sparkles">✨</div>
                      </div>
                      <div className="card-benefit">Полезные жиры</div>
                    </div>
                    <div className="card-energy"></div>
                  </div>
                </div>
                
                <div className="floating-card card-2">
                  <div className="card-hologram"></div>
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="card-icon">🐟</div>
                    <div className="card-text">
                      <div className="card-title">Лосось</div>
                      <div className="card-score">
                        <span className="score-number">8</span>
                        <span className="score-divider">/</span>
                        <span className="score-total">10</span>
                        <div className="score-sparkles">⭐</div>
                      </div>
                      <div className="card-benefit">Омега-3</div>
                    </div>
                    <div className="card-energy"></div>
                  </div>
                </div>
                
                <div className="floating-card card-3">
                  <div className="card-hologram"></div>
                  <div className="card-glow"></div>
                  <div className="card-content">
                    <div className="card-icon">🍓</div>
                    <div className="card-text">
                      <div className="card-title">Клубника</div>
                      <div className="card-score">
                        <span className="score-number">9</span>
                        <span className="score-divider">/</span>
                        <span className="score-total">10</span>
                        <div className="score-sparkles">💫</div>
                      </div>
                      <div className="card-benefit">Витамин C</div>
                    </div>
                    <div className="card-energy"></div>
                  </div>
                </div>

                {/* Центральный AI элемент с УЛЬТРА эффектами */}
                <div className="ai-brain">
                  <div className="brain-aura"></div>
                  <div className="brain-rings">
                    <div className="brain-ring ring-1"></div>
                    <div className="brain-ring ring-2"></div>
                    <div className="brain-ring ring-3"></div>
                    <div className="brain-ring ring-4"></div>
                  </div>
                  <div className="brain-core">
                    <div className="brain-icon">🧠</div>
                    <div className="brain-text">AI</div>
                    <div className="brain-sparks">
                      <div className="spark spark-1">⚡</div>
                      <div className="spark spark-2">✨</div>
                      <div className="spark spark-3">💫</div>
                      <div className="spark spark-4">⭐</div>
                    </div>
                  </div>
                  <div className="brain-pulse"></div>
                  <div className="brain-energy-field"></div>
                </div>

                {/* Соединительные линии */}
                <div className="connection-lines">
                  <div className="line line-1"></div>
                  <div className="line line-2"></div>
                  <div className="line line-3"></div>
                </div>
              </div>
            </div>
          </div>
            
          {/* API Status */}
          <div className="api-status">
            {loading ? (
              <div className="status-loading">
                <div className="spinner"></div>
                <span>Проверка соединения...</span>
              </div>
            ) : error ? (
              <div className="status-error">
                <span className="status-icon">❌</span>
                <span>{error}</span>
                <button onClick={checkApiHealth} className="retry-btn">
                  Повторить
                </button>
              </div>
            ) : healthStatus ? (
              <div className="status-success">
                <span className="status-icon">✅</span>
                <span>API работает</span>
                <div className="status-details">
                  <span>Время работы: {formatUptime(healthStatus.uptime)}</span>
                  {healthStatus.memory && (
                    <span>Память: {healthStatus.memory.percentage}%</span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="how-it-works">
        <div className="container">
          <h3 className="section-title">
            <span className="title-icon">🚀</span>
            <span className="title-text">Как это работает</span>
            <div className="title-underline"></div>
          </h3>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">
                <span>1</span>
                <div className="number-glow"></div>
              </div>
              <div className="step-content">
                <div className="step-icon-wrapper">
                  <div className="step-icon">📱</div>
                  <div className="icon-ring"></div>
                </div>
                <h4>Загрузите или введите</h4>
                <p>Сфотографируйте продукт, отсканируйте штрих-код или просто введите название</p>
                <div className="step-features">
                  <span className="feature-tag">📷 Фото</span>
                  <span className="feature-tag">📊 Штрих-код</span>
                  <span className="feature-tag">✏️ Текст</span>
                </div>
              </div>
            </div>
            <div className="step-arrow">
              <div className="arrow-line"></div>
              <div className="arrow-head">→</div>
              <div className="arrow-pulse"></div>
            </div>
            <div className="step">
              <div className="step-number">
                <span>2</span>
                <div className="number-glow"></div>
              </div>
              <div className="step-content">
                <div className="step-icon-wrapper">
                  <div className="step-icon">🤖</div>
                  <div className="icon-ring"></div>
                </div>
                <h4>AI анализирует</h4>
                <p>Gemini AI определяет продукт и анализирует его состав на основе своих знаний</p>
                <div className="step-features">
                  <span className="feature-tag">🧠 Gemini 2.5</span>
                  <span className="feature-tag">⚡ 10 сек</span>
                  <span className="feature-tag">🎯 95% точность</span>
                </div>
              </div>
            </div>
            <div className="step-arrow">
              <div className="arrow-line"></div>
              <div className="arrow-head">→</div>
              <div className="arrow-pulse"></div>
            </div>
            <div className="step">
              <div className="step-number">
                <span>3</span>
                <div className="number-glow"></div>
              </div>
              <div className="step-content">
                <div className="step-icon-wrapper">
                  <div className="step-icon">📊</div>
                  <div className="icon-ring"></div>
                </div>
                <h4>Получите результат</h4>
                <p>Детальный анализ, оценка здоровья и персональные рекомендации диетолога</p>
                <div className="step-features">
                  <span className="feature-tag">📈 Оценка 1-10</span>
                  <span className="feature-tag">💡 Советы</span>
                  <span className="feature-tag">⚠️ Предупреждения</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scanner Section */}
      <section className="scanner-section">
        <div className="container">
          <h3 className="section-title">🔍 Попробуйте прямо сейчас</h3>
          <ScannerComponent />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h3 className="section-title">💎 Возможности системы</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>Сканирование штрих-кодов</h4>
              <p>Быстрое получение информации о продукте по штрих-коду</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📷</div>
              <h4>Анализ изображений</h4>
              <p>Загрузите фото продукта для автоматического распознавания</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h4>Поиск по названию</h4>
              <p>Найдите продукт по названию и получите полную информацию</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h4>ИИ-анализ</h4>
              <p>Умные рекомендации и оценка полезности продукта</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h4>Детальная информация</h4>
              <p>Калории, белки, жиры, углеводы и другие показатели</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚠️</div>
              <h4>Предупреждения</h4>
              <p>Информация о потенциальных аллергенах и вредных веществах</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>GluWise</h4>
              <p>Умный помощник для здорового питания</p>
            </div>
            <div className="footer-section">
              <h4>Технологии</h4>
              <ul>
                <li>React + TypeScript</li>
                <li>Express.js API</li>
                <li>Искусственный интеллект</li>
                <li>Компьютерное зрение</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>API Статус</h4>
              {healthStatus && (
                <ul>
                  <li>Версия: {healthStatus.version}</li>
                  <li>Статус: {healthStatus.status}</li>
                  <li>Сервисы: Активны</li>
                </ul>
              )}
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 GluWise. Разработано с ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
