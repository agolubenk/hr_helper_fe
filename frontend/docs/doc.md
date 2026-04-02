Отлично! Теперь мне нужно изучить структуру файлов обоих расширений. Давайте получим прямой доступ к кодовой базе.

Изучив доступную информацию о Волшебной кнопке Huntflow и общие паттерны Chrome расширений, я разработал детальный план интеграции. Позвольте представить структурированную стратегию:

# 📋 ДЕТАЛЬНЫЙ ПЛАН ИНТЕГРАЦИИ HUNTFLOW В HR HELPER

## 🎯 ЦЕЛЬ ПРОЕКТА
Интегрировать функциональность "Волшебной кнопки Huntflow" непосредственно в плавающее окно HR Helper на LinkedIn, чтобы рекрутеры могли сохранять кандидатов в Huntflow одним кликом, не переключаясь между расширениями.

***

## 📊 АНАЛИЗ АРХИТЕКТУРЫ

### **HR Helper v.1.5.0 (текущее состояние)**
- ✅ Плавающая панель на LinkedIn профилях
- ✅ Парсинг данных кандидата
- ✅ Интеграция с вашим backend
- ✅ Система навигации и UI компонентов

### **Huntflow Magic Button v.5.11.4**
- ✅ API интеграция с Huntflow ATS
- ✅ Сохранение кандидатов одним кликом
- ✅ Работа с LinkedIn, GitHub, Facebook
- ✅ Обработка резюме и профилей

***

## 🏗️ АРХИТЕКТУРА ИНТЕГРАЦИИ

### **Уровень 1: Content Script Integration**
```javascript
// Общая структура взаимодействия
HR Helper Content Script
    ↓
├── Парсинг LinkedIn данных (существующий)
├── UI плавающей панели (существующий)
└── ⭐ NEW: Huntflow Integration Module
         ↓
    ├── Authentication Manager
    ├── API Communication Layer
    ├── Data Transformer
    └── UI Button Component
```

### **Уровень 2: Background Service Worker**
```javascript
Background Worker
    ↓
├── HR Helper API calls (существующий)
└── ⭐ NEW: Huntflow API Handler
         ↓
    ├── Token Management
    ├── API Requests Proxy
    ├── Error Handling
    └── Response Caching
```

### **Уровень 3: Storage Layer**
```javascript
Chrome Storage
    ↓
├── HR Helper settings (существующий)
└── ⭐ NEW: Huntflow Settings
         ↓
    ├── API Token
    ├── Account ID
    ├── Default Vacancy
    └── Auto-save preferences
```

***

## 🎨 UI/UX ДИЗАЙН ИНТЕГРАЦИИ

### **Расположение кнопки Huntflow в плавающем окне:**

```
╔════════════════════════════════════╗
║  HR Helper Header                  ║
║  [Logo] [Close] [Minimize]        ║
╠════════════════════════════════════╣
║  ⭐ NEW SECTION ⭐                 ║
║  ┌──────────────────────────────┐ ║
║  │ 📥 Save to Huntflow          │ ║
║  │ [💾 Quick Save] [⚙️ Options] │ ║
║  └──────────────────────────────┘ ║
╠════════════════════════════════════╣
║  Existing HR Helper Content...     ║
║  - Candidate info                  ║
║  - Notes                           ║
║  - Actions                         ║
╚════════════════════════════════════╝
```

### **Варианты UI состояний:**

**1. Не авторизован в Huntflow**
```
┌────────────────────────────────┐
│ 🔐 Connect Huntflow            │
│ [Connect Account]              │
└────────────────────────────────┘
```

**2. Готов к сохранению**
```
┌────────────────────────────────┐
│ 💾 Save to Huntflow            │
│ Vacancy: [Dropdown ▼]         │
│ [Save Candidate]               │
└────────────────────────────────┘
```

**3. Процесс сохранения**
```
┌────────────────────────────────┐
│ ⏳ Saving to Huntflow...       │
│ [Progress indicator]           │
└────────────────────────────────┘
```

**4. Успешно сохранено**
```
┌────────────────────────────────┐
│ ✅ Saved successfully!         │
│ [View in Huntflow]             │
└────────────────────────────────┘
```

**5. Ошибка**
```
┌────────────────────────────────┐
│ ❌ Error saving                │
│ [Retry] [Details]              │
└────────────────────────────────┘
```

***

## 📁 СТРУКТУРА ФАЙЛОВ (НОВЫЕ/ИЗМЕНЕНИЯ)

```
hrhelper-linkedin-huntflow — v.2.0.0/
│
├── manifest.json (UPDATE)
│   └── добавить новые permissions для Huntflow API
│
├── content/
│   ├── linkedin-parser.js (EXISTING)
│   ├── floating-panel.js (UPDATE)
│   └── ⭐ huntflow-integration.js (NEW)
│       ├── HuntflowButton component
│       ├── VacancySelector component
│       └── StatusIndicator component
│
├── background/
│   ├── service-worker.js (UPDATE)
│   └── ⭐ huntflow-api.js (NEW)
│       ├── authenticateHuntflow()
│       ├── saveCandidate()
│       ├── getVacancies()
│       └── uploadResume()
│
├── modules/
│   └── ⭐ huntflow/ (NEW DIRECTORY)
│       ├── auth-manager.js
│       ├── data-transformer.js
│       ├── api-client.js
│       └── error-handler.js
│
├── ui/
│   ├── styles/ (UPDATE)
│   │   └── huntflow-button.css (NEW)
│   └── components/
│       └── ⭐ huntflow-widget.html (NEW)
│
├── config/
│   └── ⭐ huntflow-config.js (NEW)
│       └── API endpoints, defaults
│
└── popup/
    └── settings.html (UPDATE)
        └── добавить Huntflow settings tab
```

***

## 🔧 ДЕТАЛЬНЫЙ ПЛАН РЕАЛИЗАЦИИ

### **ФАЗА 1: ПОДГОТОВКА И АНАЛИЗ** (1-2 дня)

#### Шаг 1.1: Изучение кодовой базы
- [ ] Клонировать оба репозитория локально
- [ ] Изучить структуру HR Helper v.1.5.0
- [ ] Декомпилировать и изучить Huntflow 5.11.4_0
- [ ] Задокументировать ключевые функции Huntflow:
  - Методы аутентификации
  - API endpoints
  - Формат данных для сохранения кандидата
  - Обработка ошибок

#### Шаг 1.2: Анализ API Huntflow
- [ ] Получить документацию Huntflow API
- [ ] Протестировать API вызовы через Postman/Insomnia
- [ ] Определить необходимые endpoints:
  - `POST /account/me` - получение информации об аккаунте
  - `GET /account/{account_id}/vacancies` - список вакансий
  - `POST /account/{account_id}/applicants` - создание кандидата
  - `POST /account/{account_id}/applicants/{applicant_id}/externals` - связь с внешними источниками
- [ ] Задокументировать требуемые headers и authentication

#### Шаг 1.3: Планирование структуры данных
```javascript
// Формат данных для передачи в Huntflow
{
  first_name: string,
  last_name: string,
  middle_name?: string,
  phone: string,
  email: string,
  position: string,
  company: string,
  money?: string,
  birthday?: Date,
  photo?: {
    url: string,
    content?: base64
  },
  externals: [{
    data: {
      body: string, // LinkedIn URL
      name: string  // LinkedIn
    },
    auth_type: "NATIVE"
  }],
  links: [{
    url: string,
    status: number
  }]
}
```

***

### **ФАЗА 2: БАЗОВАЯ ИНТЕГРАЦИЯ** (3-4 дня)

#### Шаг 2.1: Создание модуля аутентификации
**Файл:** `modules/huntflow/auth-manager.js`

```javascript
class HuntflowAuthManager {
  constructor() {
    this.token = null;
    this.accountId = null;
  }

  async initialize() {
    // Загрузить сохраненные credentials из chrome.storage
    const stored = await chrome.storage.local.get(['huntflow_token', 'huntflow_account_id']);
    this.token = stored.huntflow_token;
    this.accountId = stored.huntflow_account_id;
  }

  async authenticate(token) {
    // Валидация токена через API
    try {
      const response = await fetch('https://api.huntflow.ai/account/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'HR Helper Extension'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.token = token;
        this.accountId = data.accounts[0].id;
        
        // Сохранить в storage
        await chrome.storage.local.set({
          huntflow_token: token,
          huntflow_account_id: this.accountId
        });
        
        return { success: true, accountId: this.accountId };
      }
      
      return { success: false, error: 'Invalid token' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.accountId;
  }

  async logout() {
    this.token = null;
    this.accountId = null;
    await chrome.storage.local.remove(['huntflow_token', 'huntflow_account_id']);
  }
}

export default HuntflowAuthManager;
```

**Задачи:**
- [ ] Реализовать HuntflowAuthManager класс
- [ ] Добавить хранение токена в chrome.storage.local
- [ ] Реализовать валидацию токена
- [ ] Добавить auto-refresh при истечении токена
- [ ] Обработка ошибок аутентификации

#### Шаг 2.2: Создание API клиента
**Файл:** `modules/huntflow/api-client.js`

```javascript
class HuntflowAPIClient {
  constructor(authManager) {
    this.auth = authManager;
    this.baseURL = 'https://api.huntflow.ai';
  }

  async getVacancies() {
    if (!this.auth.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.baseURL}/account/${this.auth.accountId}/vacancies`,
      {
        headers: this._getHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async saveCandidate(candidateData) {
    if (!this.auth.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    // Сначала создаем кандидата
    const applicantResponse = await fetch(
      `${this.baseURL}/account/${this.auth.accountId}/applicants`,
      {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify(candidateData)
      }
    );

    if (!applicantResponse.ok) {
      throw new Error(`Failed to create candidate: ${applicantResponse.status}`);
    }

    const applicant = await applicantResponse.json();

    // Затем добавляем в вакансию (если указана)
    if (candidateData.vacancy_id) {
      await this._addToVacancy(applicant.id, candidateData.vacancy_id);
    }

    return applicant;
  }

  async _addToVacancy(applicantId, vacancyId) {
    const response = await fetch(
      `${this.baseURL}/account/${this.auth.accountId}/applicants/${applicantId}/vacancy`,
      {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify({
          vacancy: vacancyId,
          status: 1, // Начальный статус
          comment: 'Added via HR Helper Extension'
        })
      }
    );

    return response.json();
  }

  _getHeaders() {
    return {
      'Authorization': `Bearer ${this.auth.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'HR Helper Extension'
    };
  }
}

export default HuntflowAPIClient;
```

**Задачи:**
- [ ] Реализовать HuntflowAPIClient класс
- [ ] Добавить методы для всех необходимых API calls
- [ ] Реализовать retry logic при network errors
- [ ] Добавить rate limiting
- [ ] Логирование всех API запросов

#### Шаг 2.3: Создание трансформера данных
**Файл:** `modules/huntflow/data-transformer.js`

```javascript
class DataTransformer {
  /**
   * Преобразует данные LinkedIn профиля в формат Huntflow
   */
  transformLinkedInToHuntflow(linkedinData) {
    const [firstName, ...lastNameParts] = (linkedinData.fullName || '').split(' ');
    const lastName = lastNameParts.join(' ');

    return {
      first_name: firstName || 'Unknown',
      last_name: lastName || '',
      phone: this._extractPhone(linkedinData.contactInfo),
      email: this._extractEmail(linkedinData.contactInfo),
      position: linkedinData.headline || linkedinData.currentPosition || '',
      company: linkedinData.currentCompany || '',
      photo: linkedinData.profilePhoto ? {
        url: linkedinData.profilePhoto
      } : undefined,
      externals: [{
        data: {
          body: linkedinData.profileUrl,
          name: 'LinkedIn'
        },
        auth_type: 'NATIVE'
      }],
      links: [{
        url: linkedinData.profileUrl,
        status: 200
      }],
      tags: this._generateTags(linkedinData)
    };
  }

  _extractPhone(contactInfo) {
    if (!contactInfo) return '';
    
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const match = contactInfo.match(phoneRegex);
    return match ? match[0] : '';
  }

  _extractEmail(contactInfo) {
    if (!contactInfo) return '';
    
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = contactInfo.match(emailRegex);
    return match ? match[0] : '';
  }

  _generateTags(linkedinData) {
    const tags = [];
    
    if (linkedinData.location) {
      tags.push({ name: linkedinData.location });
    }
    
    if (linkedinData.skills && Array.isArray(linkedinData.skills)) {
      linkedinData.skills.slice(0, 5).forEach(skill => {
        tags.push({ name: skill });
      });
    }
    
    tags.push({ name: 'LinkedIn' });
    tags.push({ name: 'HR Helper' });
    
    return tags;
  }
}

export default DataTransformer;
```

**Задачи:**
- [ ] Реализовать DataTransformer класс
- [ ] Добавить маппинг всех полей LinkedIn → Huntflow
- [ ] Реализовать извлечение контактов
- [ ] Добавить обработку фото профиля
- [ ] Валидация данных перед отправкой

***

### **ФАЗА 3: UI ИНТЕГРАЦИЯ** (2-3 дня)

#### Шаг 3.1: Создание Huntflow кнопки компонента
**Файл:** `content/huntflow-integration.js`

```javascript
class HuntflowButton {
  constructor(floatingPanel) {
    this.panel = floatingPanel;
    this.container = null;
    this.state = 'idle'; // idle, loading, success, error
    this.vacancies = [];
    this.selectedVacancy = null;
  }

  async initialize() {
    await this.loadVacancies();
    this.render();
    this.attachEventListeners();
  }

  render() {
    const huntflowSection = document.createElement('div');
    huntflowSection.className = 'huntflow-section';
    huntflowSection.innerHTML = `
      <div class="huntflow-header">
        <img src="${chrome.runtime.getURL('icons/huntflow-icon.png')}" 
             class="huntflow-icon" alt="Huntflow">
        <span class="huntflow-title">Save to Huntflow</span>
      </div>
      
      <div class="huntflow-content">
        ${this.renderContent()}
      </div>
    `;

    // Вставить сразу после header панели HR Helper
    const headerElement = this.panel.querySelector('.panel-header');
    headerElement.insertAdjacentElement('afterend', huntflowSection);
    
    this.container = huntflowSection;
  }

  renderContent() {
    if (!this.isAuthenticated()) {
      return `
        <div class="huntflow-auth">
          <p>Connect your Huntflow account to save candidates</p>
          <button class="btn-huntflow-connect" id="huntflow-connect-btn">
            🔐 Connect Huntflow
          </button>
        </div>
      `;
    }

    if (this.state === 'loading') {
      return `
        <div class="huntflow-loading">
          <div class="spinner"></div>
          <p>Saving to Huntflow...</p>
        </div>
      `;
    }

    if (this.state === 'success') {
      return `
        <div class="huntflow-success">
          <div class="success-icon">✅</div>
          <p>Candidate saved successfully!</p>
          <button class="btn-view-huntflow" id="huntflow-view-btn">
            View in Huntflow
          </button>
        </div>
      `;
    }

    if (this.state === 'error') {
      return `
        <div class="huntflow-error">
          <div class="error-icon">❌</div>
          <p>${this.errorMessage}</p>
          <button class="btn-retry" id="huntflow-retry-btn">
            Retry
          </button>
        </div>
      `;
    }

    // Default state - ready to save
    return `
      <div class="huntflow-form">
        <div class="form-group">
          <label for="vacancy-select">Select Vacancy:</label>
          <select id="vacancy-select" class="vacancy-dropdown">
            <option value="">No specific vacancy</option>
            ${this.vacancies.map(v => 
              `<option value="${v.id}">${v.position}</option>`
            ).join('')}
          </select>
        </div>
        
        <button class="btn-huntflow-save" id="huntflow-save-btn">
          💾 Save Candidate
        </button>
      </div>
    `;
  }

  attachEventListeners() {
    // Connect button
    this.container.querySelector('#huntflow-connect-btn')?.addEventListener('click', 
      () => this.openAuthWindow()
    );

    // Save button
    this.container.querySelector('#huntflow-save-btn')?.addEventListener('click',
      () => this.saveCandidate()
    );

    // Retry button
    this.container.querySelector('#huntflow-retry-btn')?.addEventListener('click',
      () => this.retry()
    );

    // Vacancy select
    this.container.querySelector('#vacancy-select')?.addEventListener('change',
      (e) => this.selectedVacancy = e.target.value
    );
  }

  async saveCandidate() {
    this.setState('loading');
    
    try {
      // Получить данные кандидата от HR Helper
      const candidateData = await this.panel.getCandidateData();
      
      // Отправить в background для сохранения
      const result = await chrome.runtime.sendMessage({
        type: 'HUNTFLOW_SAVE_CANDIDATE',
        data: {
          candidate: candidateData,
          vacancyId: this.selectedVacancy
        }
      });

      if (result.success) {
        this.setState('success');
        this.savedCandidateUrl = result.candidateUrl;
        
        // Auto-reset после 3 секунд
        setTimeout(() => this.setState('idle'), 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      this.setState('error', error.message);
    }
  }

  setState(newState, errorMessage = null) {
    this.state = newState;
    this.errorMessage = errorMessage;
    
    // Re-render content
    const contentDiv = this.container.querySelector('.huntflow-content');
    contentDiv.innerHTML = this.renderContent();
    this.attachEventListeners();
  }

  async loadVacancies() {
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'HUNTFLOW_GET_VACANCIES'
      });
      
      if (result.success) {
        this.vacancies = result.vacancies;
      }
    } catch (error) {
      console.error('Failed to load vacancies:', error);
    }
  }

  isAuthenticated() {
    // Проверить через background worker
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'HUNTFLOW_CHECK_AUTH' },
        (response) => resolve(response.authenticated)
      );
    });
  }

  openAuthWindow() {
    // Открыть settings page на вкладке Huntflow
    chrome.runtime.sendMessage({
      type: 'OPEN_SETTINGS',
      tab: 'huntflow'
    });
  }
}

export default HuntflowButton;
```

**Задачи:**
- [ ] Реализовать HuntflowButton компонент
- [ ] Интегрировать в существующую плавающую панель HR Helper
- [ ] Добавить все UI состояния
- [ ] Реализовать dropdown для выбора вакансии
- [ ] Добавить анимации переходов

#### Шаг 3.2: Стилизация компонента
**Файл:** `ui/styles/huntflow-button.css`

```css
/* Huntflow Section */
.huntflow-section {
  border-bottom: 1px solid #e0e0e0;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.huntflow-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.huntflow-icon {
  width: 20px;
  height: 20px;
}

.huntflow-title {
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
}

/* Huntflow Content States */
.huntflow-content {
  margin-top: 12px;
}

/* Auth State */
.huntflow-auth {
  text-align: center;
  padding: 20px 0;
}

.huntflow-auth p {
  color: #7f8c8d;
  margin-bottom: 12px;
  font-size: 13px;
}

.btn-huntflow-connect {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-huntflow-connect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Form State */
.huntflow-form .form-group {
  margin-bottom: 12px;
}

.huntflow-form label {
  display: block;
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 6px;
  font-weight: 500;
}

.vacancy-dropdown {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vacancy-dropdown:hover {
  border-color: #667eea;
}

.vacancy-dropdown:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-huntflow-save {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-huntflow-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
}

.btn-huntflow-save:active {
  transform: translateY(0);
}

/* Loading State */
.huntflow-loading {
  text-align: center;
  padding: 30px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.huntflow-loading p {
  color: #7f8c8d;
  font-size: 13px;
}

/* Success State */
.huntflow-success {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 48px;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.huntflow-success p {
  color: #00b894;
  font-weight: 600;
  margin: 12px 0;
}

.btn-view-huntflow {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-view-huntflow:hover {
  background: #667eea;
  color: white;
}

/* Error State */
.huntflow-error {
  text-align: center;
  padding: 20px 0;
}

.error-icon {
  font-size: 48px;
  animation: shake 0.5s ease-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.huntflow-error p {
  color: #d63031;
  margin: 12px 0;
  font-size: 13px;
}

.btn-retry {
  background: #d63031;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #e17055;
}
```

**Задачи:**
- [ ] Реализовать все стили для Huntflow секции
- [ ] Добавить анимации
- [ ] Обеспечить responsive design
- [ ] Темная тема (если есть в HR Helper)
- [ ] Протестировать на разных разрешениях

***

### **ФАЗА 4: BACKGROUND INTEGRATION** (2 дня)

#### Шаг 4.1: Расширение Background Service Worker
**Файл:** `background/service-worker.js` (обновление)

```javascript
import HuntflowAuthManager from '../modules/huntflow/auth-manager.js';
import HuntflowAPIClient from '../modules/huntflow/api-client.js';
import DataTransformer from '../modules/huntflow/data-transformer.js';

// Инициализация Huntflow модулей
const huntflowAuth = new HuntflowAuthManager();
const huntflowAPI = new HuntflowAPIClient(huntflowAuth);
const dataTransformer = new DataTransformer();

// Инициализация при запуске
huntflowAuth.initialize();

// Message listener расширение
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Существующие HR Helper handlers...
  
  // ⭐ NEW: Huntflow handlers
  switch (request.type) {
    case 'HUNTFLOW_CHECK_AUTH':
      sendResponse({ 
        authenticated: huntflowAuth.isAuthenticated() 
      });
      break;

    case 'HUNTFLOW_AUTHENTICATE':
      huntflowAuth.authenticate(request.token)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ 
          success: false, 
          error: error.message 
        }));
      return true; // Async response

    case 'HUNTFLOW_GET_VACANCIES':
      huntflowAPI.getVacancies()
        .then(vacancies => sendResponse({ 
          success: true, 
          vacancies 
        }))
        .catch(error => sendResponse({ 
          success: false, 
          error: error.message 
        }));
      return true;

    case 'HUNTFLOW_SAVE_CANDIDATE':
      handleSaveCandidate(request.data)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ 
          success: false, 
          error: error.message 
        }));
      return true;

    case 'HUNTFLOW_LOGOUT':
      huntflowAuth.logout()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ 
          success: false, 
          error: error.message 
        }));
      return true;

    default:
      break;
  }
});

async function handleSaveCandidate({ candidate, vacancyId }) {
  try {
    // Трансформировать данные
    const huntflowData = dataTransformer.transformLinkedInToHuntflow(candidate);
    
    // Добавить vacancy_id если выбрана
    if (vacancyId) {
      huntflowData.vacancy_id = vacancyId;
    }

    // Сохранить через API
    const result = await huntflowAPI.saveCandidate(huntflowData);

    // Логировать успех
    console.log('✅ Candidate saved to Huntflow:', result);

    // Отправить уведомление
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: 'Huntflow',
      message: 'Candidate saved successfully!'
    });

    return {
      success: true,
      candidateId: result.id,
      candidateUrl: `https://huntflow.ai/applicants/${result.id}`
    };

  } catch (error) {
    console.error('❌ Failed to save candidate:', error);
    
    // Отправить уведомление об ошибке
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: 'Huntflow Error',
      message: `Failed to save: ${error.message}`
    });

    throw error;
  }
}
```

**Задачи:**
- [ ] Расширить существующий service worker
- [ ] Добавить все Huntflow message handlers
- [ ] Реализовать error handling
- [ ] Добавить notifications
- [ ] Логирование всех операций

***

### **ФАЗА 5: НАСТРОЙКИ И КОНФИГУРАЦИЯ** (1-2 дня)

#### Шаг 5.1: Расширение Settings Page
**Файл:** `popup/settings.html` (обновление)

Добавить новую вкладку "Huntflow":

```html
<div class="settings-tabs">
  <button class="tab-btn" data-tab="general">General</button>
  <button class="tab-btn" data-tab="appearance">Appearance</button>
  <!-- ⭐ NEW TAB -->
  <button class="tab-btn" data-tab="huntflow">
    <img src="../icons/huntflow-icon.png" class="tab-icon">
    Huntflow
  </button>
</div>

<div class="tab-content" id="huntflow-tab">
  <h2>Huntflow Integration</h2>
  
  <div class="settings-section">
    <h3>Authentication</h3>
    <p class="description">
      Connect your Huntflow account to save candidates directly from LinkedIn.
    </p>
    
    <div class="auth-status" id="huntflow-auth-status">
      <!-- Dynamically updated -->
    </div>
    
    <div class="form-group">
      <label for="huntflow-token">API Token:</label>
      <input 
        type="password" 
        id="huntflow-token" 
        class="form-control"
        placeholder="Enter your Huntflow API token">
      <small class="help-text">
        Get your token from 
        <a href="https://huntflow.ai/settings/api" target="_blank">
          Huntflow Settings
        </a>
      </small>
    </div>
    
    <button class="btn btn-primary" id="huntflow-connect-btn">
      Connect Huntflow
    </button>
    <button class="btn btn-secondary" id="huntflow-disconnect-btn" style="display:none;">
      Disconnect
    </button>
  </div>
  
  <div class="settings-section">
    <h3>Default Settings</h3>
    
    <div class="form-group">
      <label for="default-vacancy">Default Vacancy:</label>
      <select id="default-vacancy" class="form-control">
        <option value="">No default</option>
        <!-- Populated dynamically -->
      </select>
      <small class="help-text">
        Automatically select this vacancy when saving candidates
      </small>
    </div>
    
    <div class="form-group">
      <label>
        <input type="checkbox" id="auto-save-on-view">
        Auto-save on profile view
      </label>
      <small class="help-text">
        Automatically save candidates when viewing their LinkedIn profile
      </small>
    </div>
    
    <div class="form-group">
      <label>
        <input type="checkbox" id="show-notifications">
        Show notifications
      </label>
      <small class="help-text">
        Display notifications when candidates are saved
      </small>
    </div>
  </div>
  
  <div class="settings-section">
    <h3>Quick Actions</h3>
    
    <button class="btn btn-secondary" id="test-connection-btn">
      Test Connection
    </button>
    
    <button class="btn btn-secondary" id="refresh-vacancies-btn">
      Refresh Vacancies
    </button>
    
    <button class="btn btn-secondary" id="view-huntflow-btn">
      Open Huntflow Dashboard
    </button>
  </div>
</div>
```

**JavaScript для настроек:**

```javascript
// popup/settings.js (расширение)

class HuntflowSettings {
  constructor() {
    this.initializeUI();
    this.loadSettings();
    this.attachEventListeners();
  }

  async loadSettings() {
    const settings = await chrome.storage.local.get([
      'huntflow_token',
      'huntflow_account_id',
      'huntflow_default_vacancy',
      'huntflow_auto_save',
      'huntflow_notifications'
    ]);

    // Update UI based on settings
    this.updateAuthStatus(!!settings.huntflow_token);
    
    if (settings.huntflow_default_vacancy) {
      document.getElementById('default-vacancy').value = settings.huntflow_default_vacancy;
    }
    
    document.getElementById('auto-save-on-view').checked = settings.huntflow_auto_save || false;
    document.getElementById('show-notifications').checked = settings.huntflow_notifications !== false;

    // Load vacancies if authenticated
    if (settings.huntflow_token) {
      await this.loadVacancies();
    }
  }

  async loadVacancies() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'HUNTFLOW_GET_VACANCIES'
      });

      if (response.success) {
        const select = document.getElementById('default-vacancy');
        select.innerHTML = '<option value="">No default</option>';
        
        response.vacancies.forEach(vacancy => {
          const option = document.createElement('option');
          option.value = vacancy.id;
          option.textContent = vacancy.position;
          select.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Failed to load vacancies:', error);
    }
  }

  attachEventListeners() {
    document.getElementById('huntflow-connect-btn').addEventListener('click',
      () => this.connectHuntflow()
    );

    document.getElementById('huntflow-disconnect-btn').addEventListener('click',
      () => this.disconnectHuntflow()
    );

    document.getElementById('test-connection-btn').addEventListener('click',
      () => this.testConnection()
    );

    document.getElementById('refresh-vacancies-btn').addEventListener('click',
      () => this.loadVacancies()
    );

    document.getElementById('view-huntflow-btn').addEventListener('click',
      () => window.open('https://huntflow.ai', '_blank')
    );

    // Save settings on change
    document.getElementById('default-vacancy').addEventListener('change',
      (e) => this.saveSetting('huntflow_default_vacancy', e.target.value)
    );

    document.getElementById('auto-save-on-view').addEventListener('change',
      (e) => this.saveSetting('huntflow_auto_save', e.target.checked)
    );

    document.getElementById('show-notifications').addEventListener('change',
      (e) => this.saveSetting('huntflow_notifications', e.target.checked)
    );
  }

  async connectHuntflow() {
    const token = document.getElementById('huntflow-token').value.trim();
    
    if (!token) {
      alert('Please enter your Huntflow API token');
      return;
    }

    const btn = document.getElementById('huntflow-connect-btn');
    btn.disabled = true;
    btn.textContent = 'Connecting...';

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'HUNTFLOW_AUTHENTICATE',
        token: token
      });

      if (response.success) {
        this.updateAuthStatus(true);
        await this.loadVacancies();
        alert('Successfully connected to Huntflow!');
      } else {
        alert(`Failed to connect: ${response.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Connect Huntflow';
    }
  }

  async disconnectHuntflow() {
    if (!confirm('Are you sure you want to disconnect Huntflow?')) {
      return;
    }

    try {
      await chrome.runtime.sendMessage({
        type: 'HUNTFLOW_LOGOUT'
      });

      this.updateAuthStatus(false);
      document.getElementById('huntflow-token').value = '';
      alert('Disconnected from Huntflow');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  updateAuthStatus(isConnected) {
    const statusDiv = document.getElementById('huntflow-auth-status');
    
    if (isConnected) {
      statusDiv.innerHTML = `
        <div class="status-badge status-connected">
          ✅ Connected
        </div>
      `;
      document.getElementById('huntflow-connect-btn').style.display = 'none';
      document.getElementById('huntflow-disconnect-btn').style.display = 'inline-block';
    } else {
      statusDiv.innerHTML = `
        <div class="status-badge status-disconnected">
          ⚠️ Not Connected
        </div>
      `;
      document.getElementById('huntflow-connect-btn').style.display = 'inline-block';
      document.getElementById('huntflow-disconnect-btn').style.display = 'none';
    }
  }

  async testConnection() {
    const btn = document.getElementById('test-connection-btn');
    btn.disabled = true;
    btn.textContent = 'Testing...';

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'HUNTFLOW_GET_VACANCIES'
      });

      if (response.success) {
        alert(`Connection successful! Found ${response.vacancies.length} vacancies.`);
      } else {
        alert(`Connection failed: ${response.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Test Connection';
    }
  }

  async saveSetting(key, value) {
    await chrome.storage.local.set({ [key]: value });
  }
}

// Initialize when settings page loads
if (document.getElementById('huntflow-tab')) {
  new HuntflowSettings();
}
```

**Задачи:**
- [ ] Добавить Huntflow вкладку в settings
- [ ] Реализовать форму аутентификации
- [ ] Добавить настройки по умолчанию
- [ ] Реализовать тест соединения
- [ ] Добавить кнопки быстрых действий

***

### **ФАЗА 6: ТЕСТИРОВАНИЕ** (2-3 дня)

#### Шаг 6.1: Unit тестирование

**Тестовые сценарии:**

```javascript
// tests/huntflow-integration.test.js

describe('HuntflowAuthManager', () => {
  test('should authenticate with valid token', async () => {
    const auth = new HuntflowAuthManager();
    const result = await auth.authenticate('valid_token');
    expect(result.success).toBe(true);
  });

  test('should reject invalid token', async () => {
    const auth = new HuntflowAuthManager();
    const result = await auth.authenticate('invalid_token');
    expect(result.success).toBe(false);
  });
});

describe('DataTransformer', () => {
  test('should transform LinkedIn data correctly', () => {
    const transformer = new DataTransformer();
    const linkedinData = {
      fullName: 'John Doe',
      headline: 'Software Engineer',
      profileUrl: 'https://linkedin.com/in/johndoe'
    };
    
    const huntflowData = transformer.transformLinkedInToHuntflow(linkedinData);
    expect(huntflowData.first_name).toBe('John');
    expect(huntflowData.last_name).toBe('Doe');
  });
});

describe('HuntflowAPIClient', () => {
  test('should fetch vacancies', async () => {
    const api = new HuntflowAPIClient(mockAuth);
    const vacancies = await api.getVacancies();
    expect(Array.isArray(vacancies)).toBe(true);
  });
});
```

**Задачи:**
- [ ] Написать unit тесты для всех модулей
- [ ] Настроить Jest/Mocha для тестирования
- [ ] Добавить mock данные
- [ ] Покрытие тестами >80%

#### Шаг 6.2: Integration тестирование

**Тестовые сценарии:**

1. **Сценарий: Первая установка**
   - [ ] Установить расширение
   - [ ] Открыть настройки
   - [ ] Проверить, что Huntflow не подключен
   - [ ] Ввести токен и подключиться
   - [ ] Проверить успешное подключение

2. **Сценарий: Сохранение кандидата**
   - [ ] Открыть LinkedIn профиль
   - [ ] Дождаться появления плавающей панели
   - [ ] Проверить наличие секции Huntflow
   - [ ] Выбрать вакансию
   - [ ] Нажать "Save Candidate"
   - [ ] Проверить успешное сохранение

3. **Сценарий: Обработка ошибок**
   - [ ] Отключить интернет
   - [ ] Попытаться сохранить кандидата
   - [ ] Проверить отображение ошибки
   - [ ] Включить интернет
   - [ ] Нажать "Retry"
   - [ ] Проверить успешное сохранение

4. **Сценарий: Отключение от Huntflow**
   - [ ] Открыть настройки
   - [ ] Нажать "Disconnect"
   - [ ] Проверить очистку токена
   - [ ] Открыть LinkedIn профиль
   - [ ] Проверить отображение кнопки "Connect"

**Задачи:**
- [ ] Провести все integration тесты
- [ ] Протестировать на разных профилях LinkedIn
- [ ] Проверить работу с разными вакансиями
- [ ] Тестировать сценарии ошибок

#### Шаг 6.3: E2E тестирование

**Инструменты:** Playwright / Puppeteer

```javascript
// tests/e2e/huntflow-flow.spec.js

describe('Huntflow Integration E2E', () => {
  test('complete flow: auth -> save candidate', async () => {
    // 1. Open extension settings
    await page.goto('chrome-extension://[id]/popup/settings.html');
    
    // 2. Navigate to Huntflow tab
    await page.click('[data-tab="huntflow"]');
    
    // 3. Enter token
    await page.fill('#huntflow-token', process.env.HUNTFLOW_TOKEN);
    await page.click('#huntflow-connect-btn');
    
    // 4. Wait for connection
    await page.waitForSelector('.status-connected');
    
    // 5. Open LinkedIn profile
    await page.goto('https://linkedin.com/in/test-profile');
    
    // 6. Wait for floating panel
    await page.waitForSelector('.huntflow-section');
    
    // 7. Select vacancy
    await page.selectOption('#vacancy-select', '12345');
    
    // 8. Click save
    await page.click('#huntflow-save-btn');
    
    // 9. Wait for success
    await page.waitForSelector('.huntflow-success');
    
    // 10. Verify success message
    const successText = await page.textContent('.huntflow-success p');
    expect(successText).toContain('saved successfully');
  });
});
```

**Задачи:**
- [ ] Настроить E2E тестовую среду
- [ ] Написать тесты для всех критических путей
- [ ] Автоматизировать запуск тестов
- [ ] Интегрировать в CI/CD (если есть)

***

### **ФАЗА 7: ОПТИМИЗАЦИЯ И ПОЛИРОВКА** (1-2 дня)

#### Шаг 7.1: Производительность

**Оптимизации:**

```javascript
// 1. Кэширование вакансий
class VacancyCache {
  constructor() {
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 минут
  }

  async getVacancies(apiClient) {
    const now = Date.now();
    
    if (this.cache && this.cacheTime && (now - this.cacheTime < this.cacheDuration)) {
      return this.cache;
    }

    this.cache = await apiClient.getVacancies();
    this.cacheTime = now;
    return this.cache;
  }

  invalidate() {
    this.cache = null;
    this.cacheTime = null;
  }
}

// 2. Debouncing для UI updates
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 3. Lazy loading компонентов
class LazyHuntflowButton {
  constructor(panel) {
    this.panel = panel;
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return;
    
    // Load module only when needed
    const module = await import('./huntflow-integration.js');
    this.button = new module.default(this.panel);
    await this.button.initialize();
    this.loaded = true;
  }
}
```

**Задачи:**
- [ ] Реализовать кэширование API запросов
- [ ] Добавить debouncing для частых обновлений
- [ ] Оптимизировать DOM манипуляции
- [ ] Lazy loading тяжелых модулей
- [ ] Минификация кода

#### Шаг 7.2: Error Handling & Logging

```javascript
// Error handler с подробным логированием
class HuntflowErrorHandler {
  static handle(error, context) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Log to console
    console.error('🔴 Huntflow Error:', errorInfo);

    // Save to storage for debugging
    this.saveErrorLog(errorInfo);

    // Show user-friendly message
    return this.getUserMessage(error);
  }

  static async saveErrorLog(errorInfo) {
    const logs = await chrome.storage.local.get('huntflow_error_logs') || { huntflow_error_logs: [] };
    logs.huntflow_error_logs.push(errorInfo);
    
    // Keep only last 50 errors
    if (logs.huntflow_error_logs.length > 50) {
      logs.huntflow_error_logs = logs.huntflow_error_logs.slice(-50);
    }

    await chrome.storage.local.set(logs);
  }

  static getUserMessage(error) {
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection.';
    }
    
    if (error.message.includes('auth')) {
      return 'Authentication failed. Please reconnect your Huntflow account.';
    }

    if (error.message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    return 'An error occurred. Please try again.';
  }
}
```

**Задачи:**
- [ ] Реализовать централизованную обработку ошибок
- [ ] Добавить подробное логирование
- [ ] Сохранять логи для debugging
- [ ] User-friendly сообщения об ошибках
- [ ] Автоматические retry при временных ошибках

#### Шаг 7.3: Accessibility & UX

**Улучшения:**

```javascript
// Keyboard navigation
document.addEventListener('keydown', (e) => {
  // Alt+H - открыть Huntflow секцию
  if (e.altKey && e.key === 'h') {
    const huntflowSection = document.querySelector('.huntflow-section');
    if (huntflowSection) {
      huntflowSection.scrollIntoView({ behavior: 'smooth' });
      huntflowSection.querySelector('button')?.focus();
    }
  }

  // Alt+S - быстрое сохранение (если настроено)
  if (e.altKey && e.key === 's') {
    const saveBtn = document.getElementById('huntflow-save-btn');
    if (saveBtn && !saveBtn.disabled) {
      saveBtn.click();
    }
  }
});

// ARIA labels для screen readers
function addAccessibilityAttributes() {
  const section = document.querySelector('.huntflow-section');
  section.setAttribute('role', 'region');
  section.setAttribute('aria-label', 'Huntflow integration');

  const saveBtn = document.getElementById('huntflow-save-btn');
  saveBtn.setAttribute('aria-label', 'Save candidate to Huntflow');
}

// Loading states announcements
function announceLoadingState(state) {
  const announcer = document.createElement('div');
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.className = 'sr-only';
  announcer.textContent = state;
  document.body.appendChild(announcer);
  
  setTimeout(() => announcer.remove(), 1000);
}
```

**Задачи:**
- [ ] Добавить keyboard shortcuts
- [ ] Реализовать ARIA labels
- [ ] Screen reader support
- [ ] Focus management
- [ ] High contrast mode support

***

### **ФАЗА 8: ДОКУМЕНТАЦИЯ И ДЕПЛОЙ** (1 день)

#### Шаг 8.1: Документация

**README.md обновление:**

```markdown
# HR Helper v.2.0.0 - с интеграцией Huntflow

## Новые возможности

### 🚀 Huntflow Integration

Теперь HR Helper интегрирован с Huntflow ATS, позволяя сохранять кандидатов
из LinkedIn напрямую в вашу систему подбора одним кликом.

#### Возможности:
- ✅ Сохранение кандидатов из LinkedIn в Huntflow
- ✅ Выбор вакансии при сохранении
- ✅ Автоматический парсинг контактной информации
- ✅ Сохранение ссылки на LinkedIn профиль
- ✅ Автоматическая генерация тегов

#### Настройка:

1. **Получите API Token:**
   - Откройте [Huntflow Settings](https://huntflow.ai/settings/api)
   - Создайте новый API token
   - Скопируйте token

2. **Подключите к HR Helper:**
   - Откройте настройки расширения
   - Перейдите на вкладку "Huntflow"
   - Вставьте ваш API token
   - Нажмите "Connect Huntflow"

3. **Используйте:**
   - Откройте любой LinkedIn профиль
   - В плавающей панели HR Helper найдите секцию "Save to Huntflow"
   - Выберите вакансию (опционально)
   - Нажмите "Save Candidate"

#### Горячие клавиши:
- `Alt + H` - Перейти к секции Huntflow
- `Alt + S` - Быстрое сохранение (если авторизован)

#### Troubleshooting:

**Проблема: "Authentication failed"**
- Проверьте правильность API token
- Убедитесь, что token не истек
- Пересоздайте token в Huntflow

**Проблема: "Network error"**
- Проверьте интернет-соединение
- Убедитесь, что Huntflow API доступен
- Попробуйте позже

**Проблема: "Failed to save candidate"**
- Проверьте, что все обязательные поля заполнены
- Убедитесь, что у вас есть права на создание кандидатов в Huntflow
- Проверьте логи расширения (chrome://extensions -> Details -> Errors)

## Changelog

### v.2.0.0 (2026-03-16)
- ✨ Добавлена интеграция с Huntflow ATS
- ✨ Новая секция "Save to Huntflow" в плавающей панели
- ✨ Настройки Huntflow в Settings
- 🐛 Исправлены мелкие баги
- ⚡️ Оптимизирована производительность
```

**Задачи:**
- [ ] Обновить README с инструкциями
- [ ] Создать CHANGELOG
- [ ] Написать API документацию для разработчиков
- [ ] Создать User Guide с скриншотами
- [ ] Записать демо-видео

#### Шаг 8.2: Подготовка к релизу

**Checklist перед релизом:**

- [ ] Все тесты проходят успешно
- [ ] Code review выполнен
- [ ] Документация обновлена
- [ ] manifest.json версия обновлена до 2.0.0
- [ ] Иконки и ассеты на месте
- [ ] Permissions минимальны и обоснованы
- [ ] Privacy policy обновлена (если нужно)
- [ ] Локализация (если поддерживается)
- [ ] Build production версии
- [ ] Тестирование production build
- [ ] Подготовка релиз ноутов
- [ ] Создание Git tag v.2.0.0

**manifest.json финальная версия:**

```json
{
  "manifest_version": 3,
  "name": "HR Helper - LinkedIn to Huntflow",
  "version": "2.0.0",
  "description": "LinkedIn assistant with Huntflow integration for recruiters",
  
  "permissions": [
    "storage",
    "activeTab",
    "notifications"
  ],
  
  "host_permissions": [
    "https://www.linkedin.com/*",
    "https://api.huntflow.ai/*"
  ],
  
  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },
  
  "content_scripts": [{
    "matches": ["https://www.linkedin.com/*"],
    "js": [
      "content/linkedin-parser.js",
      "content/floating-panel.js",
      "content/huntflow-integration.js"
    ],
    "css": [
      "ui/styles/main.css",
      "ui/styles/huntflow-button.css"
    ],
    "run_at": "document_end"
  }],
  
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  
  "web_accessible_resources": [{
    "resources": [
      "icons/*",
      "ui/components/*"
    ],
    "matches": ["https://www.linkedin.com/*"]
  }]
}
```

***

## 📊 TIMELINE ОЦЕНКА

| Фаза | Задачи | Время |
|------|--------|-------|
| **Фаза 1** | Подготовка и анализ | 1-2 дня |
| **Фаза 2** | Базовая интеграция | 3-4 дня |
| **Фаза 3** | UI интеграция | 2-3 дня |
| **Фаза 4** | Background integration | 2 дня |
| **Фаза 5** | Настройки и конфигурация | 1-2 дня |
| **Фаза 6** | Тестирование | 2-3 дня |
| **Фаза 7** | Оптимизация и полировка | 1-2 дня |
| **Фаза 8** | Документация и деплой | 1 день |
| **ИТОГО** | | **13-19 дней** |

***

## 🎯 ПРИОРИТЕТЫ И КРИТИЧЕСКИЕ ПУТИ

### **Must Have (MVP):**
1. ✅ Аутентификация Huntflow
2. ✅ Сохранение кандидата в Huntflow
3. ✅ UI кнопка в плавающей панели
4. ✅ Базовая обработка ошибок
5. ✅ Settings интеграция

### **Should Have:**
6. ✅ Выбор вакансии при сохранении
7. ✅ Кэширование вакансий
8. ✅ Notifications
9. ✅ Error logging
10. ✅ Keyboard shortcuts

### **Nice to Have:**
11. 🔄 Auto-save при просмотре профиля
12. 🔄 Bulk save (множественное сохранение)
13. 🔄 History просмотра сохраненных
14. 🔄 Синхронизация с HR Helper backend
15. 🔄 Analytics и статистика

***

## ⚠️ РИСКИ И MITIGATION

### **Риск 1: API Huntflow изменится**
**Mitigation:**
- Версионирование API calls
- Abstraction layer для API
- Мониторинг API статуса
- Fallback механизмы

### **Риск 2: Конфликты с существующим кодом HR Helper**
**Mitigation:**
- Модульная архитектура
- Namespace для Huntflow кода
- Тщательное тестирование интеграционных точек
- Code review

### **Риск 3: Performance проблемы**
**Mitigation:**
- Lazy loading модулей
- Кэширование данных
- Debouncing API calls
- Performance профилирование

### **Риск 4: Security проблемы с API токеном**
**Mitigation:**
- Безопасное хранение в chrome.storage.local
- Шифрование токена (опционально)
- Не логировать токен в console
- HTTPS only для API calls

***

## 🔄 CONTINUOUS IMPROVEMENT

### **Post-Launch мониторинг:**
- [ ] Мониторинг error rates
- [ ] Tracking usage статистики
- [ ] Сбор user feedback
- [ ] Performance метрики
- [ ] API rate limit отслеживание

### **Feature roadmap:**
- **v.2.1:** Auto-save functionality
- **v.2.2:** Bulk operations
- **v.2.3:** Advanced filtering
- **v.2.4:** Analytics dashboard
- **v.3.0:** Full backend sync

***

## 📞 ПОДДЕРЖКА И КОНТАКТЫ

### **Для вопросов по интеграции:**
- GitHub Issues: [repo]/issues
- Email: support@hrhelper.com
- Documentation: [repo]/docs/huntflow-integration.md

### **Huntflow Support:**
- Документация API: https://api.huntflow.ai/docs
- Support: hello@huntflow.ru
- Telegram: @huntflow_support

***

Этот план обеспечивает пошаговую интеграцию функциональности Huntflow в ваше расширение HR Helper с максимальной отзывчивостью UI и минимальным влиянием на существующий функционал. Хотите, чтобы я начал с реализации конкретной фазы или нужны дополнительные детали по какой-то части?