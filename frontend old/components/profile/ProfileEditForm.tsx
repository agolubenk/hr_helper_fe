/**
 * ProfileEditForm (components/profile/ProfileEditForm.tsx) - Форма редактирования профиля пользователя
 * 
 * Назначение:
 * - Редактирование личных данных пользователя
 * - Настройка рабочего времени (общее или по дням недели)
 * - Управление контактами (Telegram, LinkedIn)
 * - Настройка интервала между встречами
 * 
 * Функциональность:
 * - Поля редактирования: Telegram, LinkedIn, рабочее время, интервал встреч
 * - Переключение между режимами рабочего времени (все дни одинаково / каждый день отдельно)
 * - Валидация полей формы
 * - Сохранение изменений через callback onSave
 * - Отмена редактирования через callback onCancel
 * 
 * Особенности:
 * - Имя, фамилия и email отключены (disabled) - редактируются только через администратора
 * - Кастомная реализация полей Telegram и LinkedIn с плавающими метками
 * - Toggle для выбора режима рабочего времени
 * - Условный рендеринг полей в зависимости от режима рабочего времени
 * 
 * Связи:
 * - ProfilePage: используется на вкладке 'edit' страницы профиля
 * - FloatingLabelInput: используется для стандартных полей формы
 * - ThemeProvider: использует CSS переменные для цветов темы
 * 
 * Поведение:
 * - При загрузке инициализирует форму данными из initialData
 * - При переключении toggle синхронизирует данные между режимами
 * - При сохранении передает данные в onSave с учетом выбранного режима
 * - При отмене вызывает onCancel для возврата на вкладку просмотра
 * 
 * TODO: Замена моковых данных на API
 * - Реализовать сохранение через API: PUT /api/user/profile
 * - Валидация данных на сервере
 * - Обработка ошибок сохранения
 * - Показ индикатора загрузки при сохранении
 */

'use client'

// Импорты компонентов Radix UI для создания интерфейса
import { Box, Text, Flex, Button, Grid, Switch } from "@radix-ui/themes"
// Импорты иконок из Radix UI для визуального оформления
import { PersonIcon, EnvelopeClosedIcon, ClockIcon, Pencil1Icon, ChevronLeftIcon } from "@radix-ui/react-icons"
// Импорт кастомного компонента поля ввода с плавающей меткой
import FloatingLabelInput from "@/components/FloatingLabelInput"
// Импорты хуков React для управления состоянием
import { useState } from "react"
// Импорт компонента управления социальными сетями
import SocialLinksManager from "./SocialLinksManager"
// Импорт типов
import type { SocialLink } from "@/lib/types/social-links"
import type { DaySchedule } from "@/lib/types/working-hours"
import { DAY_KEYS, DAY_NAMES } from "@/lib/types/working-hours"
// Импорт CSS модуля для стилизации компонента
import styles from './ProfileEditForm.module.css'

/** Тип для рабочего времени по дням (совместим с WorkingHours.custom) */
type WorkTimeByDay = Partial<Record<(typeof DAY_KEYS)[number], DaySchedule>>

/**
 * ProfileEditFormProps - пропсы компонента ProfileEditForm
 * 
 * Параметры:
 * - initialData: начальные данные профиля для заполнения формы
 *   - firstName, lastName, email: обязательные поля (отключены для редактирования)
 *   - telegram, linkedin: опциональные контакты
 *   - workStartTime, workEndTime: общее рабочее время (если все дни одинаковые)
 *   - workTimeByDay: рабочее время по дням недели (если каждый день отдельно)
 *   - meetingInterval: интервал между встречами в минутах
 * - onCancel: обработчик отмены редактирования (возврат на вкладку просмотра)
 * - onSave: обработчик сохранения данных (принимает обновленные данные профиля)
 * 
 * Использование: Передаются из ProfilePage при рендеринге вкладки 'edit'
 */
interface ProfileEditFormProps {
  initialData: {
    firstName: string
    lastName: string
    email: string
    workStartTime?: string
    workEndTime?: string
    workTimeByDay?: WorkTimeByDay
    meetingInterval?: string
    socialLinks?: SocialLink[]
  }
  onCancel: () => void
  onSave: (data: ProfileEditFormProps['initialData']) => void
}

/**
 * ProfileEditForm - компонент формы редактирования профиля
 * 
 * Состояние:
 * - formData: данные формы (синхронизируется с initialData при инициализации)
 * - telegramFocused: флаг фокуса на поле Telegram (для анимации метки)
 * - linkedinFocused: флаг фокуса на поле LinkedIn (для анимации метки)
 * - isAllDaysSame: режим рабочего времени (true = все дни одинаково, false = каждый день отдельно)
 * - workTimeByDay: рабочее время по дням недели (используется когда isAllDaysSame === false)
 * 
 * Поведение:
 * - При монтировании инициализирует форму данными из initialData
 * - Определяет начальный режим рабочего времени на основе наличия workTimeByDay
 * - При переключении toggle синхронизирует данные между режимами
 * - При сохранении передает данные в onSave с учетом выбранного режима
 */
export default function ProfileEditForm({
  initialData,
  onCancel,
  onSave
}: ProfileEditFormProps) {
  // Состояние формы: данные профиля для редактирования
  const [formData, setFormData] = useState(initialData)
  // Состояние социальных ссылок (управляется SocialLinksManager)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialData.socialLinks ?? [])
  
  /**
   * isAllDaysSame - режим рабочего времени
   * 
   * Определение начального режима:
   * - true: если есть workStartTime и workEndTime, но нет workTimeByDay
   * - false: если есть workTimeByDay (каждый день имеет свое время)
   * 
   * Использование: Определяет, какие поля отображать (общие или по дням)
   */
  const [isAllDaysSame, setIsAllDaysSame] = useState(
    !!(initialData.workStartTime && initialData.workEndTime) && !initialData.workTimeByDay
  )
  
  /**
   * workTimeByDay - рабочее время по дням недели
   * 
   * Инициализация:
   * - Если есть initialData.workTimeByDay - использует его
   * - Иначе создает объект с временем из workStartTime/workEndTime или значениями по умолчанию (09:00-18:00)
   * 
   * Использование: Используется когда isAllDaysSame === false (каждый день отдельно)
   */
  const defaultStart = initialData.workStartTime || '09:00'
  const defaultEnd = initialData.workEndTime || '18:00'
  const defaultIsWorkday = (d: string) =>
    d !== 'saturday' && d !== 'sunday'
  const normalizeWorkTimeByDay = (w: WorkTimeByDay | undefined): WorkTimeByDay => {
    if (!w || Object.keys(w).length === 0) {
      return {
        monday: { start: defaultStart, end: defaultEnd, isWorkday: true },
        tuesday: { start: defaultStart, end: defaultEnd, isWorkday: true },
        wednesday: { start: defaultStart, end: defaultEnd, isWorkday: true },
        thursday: { start: defaultStart, end: defaultEnd, isWorkday: true },
        friday: { start: defaultStart, end: defaultEnd, isWorkday: true },
        saturday: { start: defaultStart, end: defaultEnd, isWorkday: false },
        sunday: { start: defaultStart, end: defaultEnd, isWorkday: false },
      }
    }
    return DAY_KEYS.reduce<WorkTimeByDay>((acc, day) => {
      const existing = w[day] as { start?: string; end?: string; isWorkday?: boolean } | undefined
      acc[day] = {
        start: existing?.start ?? defaultStart,
        end: existing?.end ?? defaultEnd,
        isWorkday: existing?.isWorkday ?? defaultIsWorkday(day),
      }
      return acc
    }, {})
  }
  const [workTimeByDay, setWorkTimeByDay] = useState<WorkTimeByDay>(
    normalizeWorkTimeByDay(initialData.workTimeByDay as WorkTimeByDay | undefined)
  )

  /**
   * handleToggleChange - обработчик переключения режима рабочего времени
   * 
   * Функциональность:
   * - Переключает режим между "все дни одинаково" и "каждый день отдельно"
   * - Синхронизирует данные между режимами при переключении
   * 
   * Логика синхронизации:
   * - При переключении на "все дни одинаково" (checked === true):
   *   - Копирует время из первого дня (monday) в общие поля workStartTime и workEndTime
   * - При переключении на "каждый день отдельно" (checked === false):
   *   - Копирует общее время (workStartTime, workEndTime) во все дни недели
   * 
   * Поведение:
   * - Вызывается при изменении Switch "Все дни недели одинаково"
   * - Обновляет isAllDaysSame и синхронизирует данные
   * 
   * @param checked - новое состояние toggle (true = все дни одинаково, false = каждый день отдельно)
   */
  const handleToggleChange = (checked: boolean) => {
    setIsAllDaysSame(checked)
    // При переключении на "все дни одинаково" - копируем время из первого рабочего дня в общие поля
    if (checked) {
      const firstWorkday = DAY_KEYS.find((d) => workTimeByDay[d]?.isWorkday)
      const s = firstWorkday ? workTimeByDay[firstWorkday] : workTimeByDay.monday
      if (s) {
        setFormData((prev) => ({
          ...prev,
          workStartTime: s.start,
          workEndTime: s.end,
        }))
      }
    }
    // При переключении на "каждый день отдельно" - копируем общее время во все дни
    else if (formData.workStartTime && formData.workEndTime) {
      const base = { start: formData.workStartTime, end: formData.workEndTime }
      setWorkTimeByDay({
        monday: { ...base, isWorkday: true },
        tuesday: { ...base, isWorkday: true },
        wednesday: { ...base, isWorkday: true },
        thursday: { ...base, isWorkday: true },
        friday: { ...base, isWorkday: true },
        saturday: { ...base, isWorkday: false },
        sunday: { ...base, isWorkday: false },
      })
    }
  }

  /**
   * handleChange - фабрика обработчиков изменения полей формы
   * 
   * Функциональность:
   * - Создает обработчик для конкретного поля формы
   * - Обновляет formData при изменении значения поля
   * 
   * Использование:
   * - Используется для всех полей формы (firstName, lastName, email, telegram, linkedin, workStartTime, workEndTime, meetingInterval)
   * - Пример: onChange={handleChange('telegram')}
   * 
   * Поведение:
   * - Возвращает функцию-обработчик, которая обновляет указанное поле в formData
   * - Использует функциональное обновление состояния для избежания замыканий
   * 
   * @param field - имя поля для обновления (ключ из formData)
   * @returns обработчик события изменения поля
   */
  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  /**
   * handleSubmit - обработчик отправки формы
   * 
   * Функциональность:
   * - Предотвращает стандартную отправку формы (перезагрузка страницы)
   * - Подготавливает данные для сохранения с учетом выбранного режима рабочего времени
   * - Вызывает onSave с подготовленными данными
   * 
   * Подготовка данных:
   * - Если isAllDaysSame === true:
   *   - Включает workStartTime и workEndTime
   *   - Устанавливает workTimeByDay в undefined
   * - Если isAllDaysSame === false:
   *   - Включает workTimeByDay с временем по дням
   *   - Устанавливает workStartTime и workEndTime в undefined
   * 
   * Поведение:
   * - Вызывается при submit формы (нажатие Enter или кнопка "Сохранить")
   * - Передает данные в onSave для сохранения через API
   * - После сохранения остается на странице редактирования (не переходит на другую вкладку)
   * 
   * TODO: Реализовать сохранение через API
   * - PUT /api/user/profile с данными профиля
   * - Обработка ответа: успех или ошибка
   * - Показ индикатора загрузки при сохранении
   * - Отображение сообщений об ошибках
   * 
   * @param e - событие submit формы
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() // Предотвращаем стандартную отправку формы
    
    const dataToSave = {
      ...formData,
      socialLinks,
      ...(isAllDaysSame 
        ? { 
            workStartTime: formData.workStartTime,
            workEndTime: formData.workEndTime,
            workTimeByDay: undefined
          }
        : {
            workStartTime: undefined,
            workEndTime: undefined,
            workTimeByDay: workTimeByDay
          }
      )
    }
    
    // Вызываем callback для сохранения данных
    onSave(dataToSave)
    // Остаемся на странице редактирования (не переходим на другую вкладку)
  }

  /**
   * handleWorkTimeByDayChange - обработчик изменения рабочего времени для конкретного дня
   * 
   * Функциональность:
   * - Обновляет время начала или окончания для указанного дня недели
   * - Сохраняет существующее время для другого поля дня (start или end)
   * 
   * Использование:
   * - Вызывается при изменении времени в полях "Начало" или "Конец" для конкретного дня
   * - Пример: onChange={(e) => handleWorkTimeByDayChange('monday', 'start', e.target.value)}
   * 
   * Поведение:
   * - Обновляет только указанное поле (start или end) для указанного дня
   * - Сохраняет значение другого поля дня без изменений
   * 
   * @param day - день недели (monday, tuesday, wednesday, thursday, friday)
   * @param field - поле для обновления ('start' | 'end')
   * @param value - новое значение времени (формат HH:mm)
   */
  const handleWorkTimeByDayChange = (
    day: (typeof DAY_KEYS)[number],
    field: 'start' | 'end' | 'isWorkday',
    value: string | boolean
  ) => {
    setWorkTimeByDay((prev) => {
      const current = prev[day] ?? { start: '09:00', end: '18:00', isWorkday: false }
      if (field === 'isWorkday') {
        return { ...prev, [day]: { ...current, isWorkday: value as boolean } }
      }
      return { ...prev, [day]: { ...current, [field]: value } }
    })
  }

  /**
   * Рендер компонента формы редактирования профиля
   * 
   * Структура:
   * - Заголовок с иконкой карандаша
   * - Форма с полями редактирования
   * - Кнопки действий (Отмена, Сохранить)
   */
  return (
    <Box className={styles.editBlock}>
      {/* Заголовок блока редактирования
          styles.header - стили для заголовка (отступы, граница снизу)
          Содержит иконку карандаша и текст "Редактирование профиля" */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          {/* Иконка карандаша - визуально обозначает режим редактирования
              width="20" height="20" - размер иконки */}
          <Pencil1Icon width="20" height="20" />
          {/* Текст заголовка - название блока
              size="4" - средний размер текста
              weight="bold" - жирное начертание */}
          <Text size="4" weight="bold">
            Редактирование профиля
          </Text>
        </Flex>
      </Box>

      {/* HTML форма для редактирования профиля
          onSubmit={handleSubmit} - обработчик отправки формы
          styles.form - стили для формы (отступы, расположение элементов)
          Предотвращает стандартную отправку формы (перезагрузка страницы) */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Содержимое формы - все поля редактирования
            styles.content - стили для контента (отступы, расположение) */}
        <Box className={styles.content}>
          {/* Сетка из двух колонок для имени и фамилии
              columns="2" - две колонки
              gap="4" - отступ между колонками
              styles.grid - стили для сетки (адаптивность на мобильных) */}
          <Grid columns="2" gap="4" width="100%" className={styles.grid}>
            {/* Левая колонка: Поле имени
                disabled - поле отключено, редактируется только администратором
                required - обязательное поле (валидация)
                icon - иконка пользователя слева от поля */}
            <Box>
              <FloatingLabelInput
                id="firstName"
                label="Имя"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
                disabled
                icon={<PersonIcon width={16} height={16} />}
              />
            </Box>

            {/* Правая колонка: Поле фамилии
                disabled - поле отключено, редактируется только администратором
                required - обязательное поле (валидация)
                icon - иконка пользователя слева от поля */}
            <Box>
              <FloatingLabelInput
                id="lastName"
                label="Фамилия"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
                disabled
                icon={<PersonIcon width={16} height={16} />}
              />
            </Box>
          </Grid>

          {/* Поле Email - на всю ширину
              marginTop: '16px' - отступ сверху от предыдущих полей
              disabled - поле отключено, редактируется только администратором
              type="email" - тип поля для валидации email формата
              icon - иконка конверта слева от поля */}
          <Box style={{ marginTop: '16px' }}>
            <FloatingLabelInput
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              disabled
              icon={<EnvelopeClosedIcon width={16} height={16} />}
            />
          </Box>

          {/* Социальные сети и мессенджеры */}
          <Box style={{ marginTop: '16px' }}>
            <Text size="2" weight="medium" mb="2" as="div">
              Социальные сети и мессенджеры
            </Text>
            <SocialLinksManager links={socialLinks} onUpdate={setSocialLinks} />
          </Box>

          {/* Toggle для выбора режима рабочего времени
              marginTop: '16px' - отступ сверху от предыдущих полей
              Switch - переключатель между режимами "все дни одинаково" и "каждый день отдельно"
              Текст подсказки меняется в зависимости от выбранного режима */}
          <Box style={{ marginTop: '16px' }}>
            <Flex align="center" gap="2" mb="2">
              {/* Switch переключатель режима рабочего времени
                  checked={isAllDaysSame} - текущее состояние (true = все дни одинаково)
                  onCheckedChange={handleToggleChange} - обработчик переключения
                  При переключении синхронизирует данные между режимами */}
              <Switch
                checked={isAllDaysSame}
                onCheckedChange={handleToggleChange}
              />
              {/* Текст метки переключателя
                  size="2" - маленький размер текста
                  weight="medium" - средняя жирность */}
              <Text size="2" weight="medium">
                Все дни недели одинаково
              </Text>
            </Flex>
            {/* Подсказка под переключателем - объясняет текущий режим
                size="1" - очень маленький размер текста
                color="gray" - серый цвет для визуального отличия
                marginLeft: '28px' - отступ слева для выравнивания с текстом переключателя
                Условный текст в зависимости от isAllDaysSame */}
            <Text size="1" color="gray" style={{ marginLeft: '28px', display: 'block' }}>
              {isAllDaysSame 
                ? 'Одно и то же рабочее время для всех рабочих дней'
                : 'Настроить рабочее время для каждого дня недели отдельно'
              }
            </Text>
          </Box>

          {/* Условный рендеринг полей рабочего времени
              isAllDaysSame === true: отображаем общие поля (workStartTime, workEndTime)
              isAllDaysSame === false: отображаем поля для каждого дня недели отдельно */}
          {isAllDaysSame ? (
            /* Режим: все дни одинаковые
                Отображаем два поля: начало и конец рабочего времени
                Эти значения применяются ко всем рабочим дням недели */
            <Grid columns="2" gap="4" width="100%" style={{ marginTop: '16px' }} className={styles.grid}>
              {/* Левая колонка: Поле начала рабочего времени
                  type="time" - поле выбора времени (HTML5 time picker)
                  value - значение из formData.workStartTime
                  onChange - обработчик изменения через handleChange('workStartTime')
                  icon - иконка часов слева от поля
                  Подсказка под полем объясняет назначение */}
              <Box>
                <FloatingLabelInput
                  id="workStartTime"
                  label="Начало рабочего времени"
                  type="time"
                  value={formData.workStartTime || ''}
                  onChange={handleChange('workStartTime')}
                  icon={<ClockIcon width={16} height={16} />}
                />
                <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
                  Время начала рабочего дня для планирования интервью
                </Text>
              </Box>

              {/* Правая колонка: Поле окончания рабочего времени
                  type="time" - поле выбора времени (HTML5 time picker)
                  value - значение из formData.workEndTime
                  onChange - обработчик изменения через handleChange('workEndTime')
                  icon - иконка часов слева от поля
                  Подсказка под полем объясняет назначение */}
              <Box>
                <FloatingLabelInput
                  id="workEndTime"
                  label="Конец рабочего времени"
                  type="time"
                  value={formData.workEndTime || ''}
                  onChange={handleChange('workEndTime')}
                  icon={<ClockIcon width={16} height={16} />}
                />
                <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
                  Время окончания рабочего дня для планирования интервью
                </Text>
              </Box>
            </Grid>
          ) : (
            /* Режим: каждый день отдельно
                Отображаем поля для каждого дня недели (понедельник - воскресенье)
                Каждый день: переключатель "Рабочий день", начало и конец времени */
            <Box style={{ marginTop: '16px' }}>
              {DAY_KEYS.map((day) => {
                const s = workTimeByDay[day] ?? { start: '09:00', end: '18:00', isWorkday: day !== 'saturday' && day !== 'sunday' }
                return (
                  <Box key={day} className={styles.dayRow}>
                    <Flex align="center" gap="3" mb="2">
                      <Switch
                        checked={s.isWorkday}
                        onCheckedChange={(v) => handleWorkTimeByDayChange(day, 'isWorkday', v)}
                      />
                      <Text size="2" weight="medium">
                        {DAY_NAMES[day]}
                      </Text>
                    </Flex>
                    <Grid columns="2" gap="4" width="100%" className={styles.grid}>
                      <Box>
                        <FloatingLabelInput
                          id={`${day}-start`}
                          label="Начало"
                          type="time"
                          value={s.start}
                          onChange={(e) => handleWorkTimeByDayChange(day, 'start', e.target.value)}
                          icon={<ClockIcon width={16} height={16} />}
                          disabled={!s.isWorkday}
                        />
                      </Box>
                      <Box>
                        <FloatingLabelInput
                          id={`${day}-end`}
                          label="Конец"
                          type="time"
                          value={s.end}
                          onChange={(e) => handleWorkTimeByDayChange(day, 'end', e.target.value)}
                          icon={<ClockIcon width={16} height={16} />}
                          disabled={!s.isWorkday}
                        />
                      </Box>
                    </Grid>
                  </Box>
                )
              })}
            </Box>
          )}

          {/* Поле интервала между встречами
              marginTop: '16px' - отступ сверху
              type="number" - числовое поле для ввода минут
              value - значение из formData.meetingInterval
              onChange - обработчик изменения через handleChange('meetingInterval')
              icon - иконка часов слева от поля
              Подсказка под полем объясняет формат (кратно 5, от 0 до 60 минут) */}
          <Box style={{ marginTop: '16px' }}>
            <FloatingLabelInput
              id="meetingInterval"
              label="Время между встречами"
              type="number"
              value={formData.meetingInterval || ''}
              onChange={handleChange('meetingInterval')}
              icon={<ClockIcon width={16} height={16} />}
            />
            <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
              Время между встречами в минутах (кратно 5, от 0 до 60)
            </Text>
          </Box>
        </Box>

        {/* Кнопки действий формы
            styles.actions - стили для контейнера кнопок (отступы, расположение)
            justify="between" - кнопки по краям (Отмена слева, Сохранить справа)
            align="center" - вертикальное выравнивание по центру */}
        <Flex justify="between" align="center" className={styles.actions}>
          {/* Кнопка "Отмена" - возврат на вкладку просмотра профиля
              type="button" - кнопка не отправляет форму
              variant="soft" - мягкий стиль (прозрачный фон)
              onClick={onCancel} - обработчик отмены (вызывает callback из ProfilePage)
              Внутри: иконка стрелки влево и текст */}
          <Button
            type="button"
            variant="soft"
            onClick={onCancel}
          >
            <ChevronLeftIcon width={16} height={16} />
            Отмена
          </Button>
          
          {/* Кнопка "Сохранить изменения" - отправка формы
              type="submit" - кнопка отправки формы (вызывает handleSubmit)
              className={styles.saveButton} - стили для кнопки сохранения (акцентный цвет)
              Внутри: иконка сохранения и текст */}
          <Button
            type="submit"
            className={styles.saveButton}
          >
            <SaveIcon width={16} height={16} />
            Сохранить изменения
          </Button>
        </Flex>
      </form>
    </Box>
  )
}

/**
 * SaveIcon - SVG иконка сохранения
 * 
 * Назначение: Отображение иконки сохранения на кнопке "Сохранить изменения"
 * 
 * Параметры:
 * - width: ширина иконки (по умолчанию 16)
 * - height: высота иконки (по умолчанию 16)
 * 
 * Использование: Используется в кнопке сохранения формы редактирования профиля
 */
const SaveIcon = ({ width = 16, height = 16 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 2.5C3 2.22386 3.22386 2 3.5 2H9.08579C9.351 2 9.60536 2.10536 9.79289 2.29289L12.7071 5.20711C12.8946 5.39464 13 5.649 13 5.91421V12.5C13 12.7761 12.7761 13 12.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5ZM4 3V12H12V5.91421L9.08579 3H4ZM5.5 3H8.5V5H5.5V3ZM5.5 6.5H9.5V7.5H5.5V6.5ZM5.5 9H9.5V10H5.5V9Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
)
