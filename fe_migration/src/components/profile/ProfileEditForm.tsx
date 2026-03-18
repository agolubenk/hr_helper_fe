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
import { Box, Text, Flex, Button, Grid } from "@radix-ui/themes"
import { PersonIcon, EnvelopeClosedIcon, Pencil1Icon, ChevronLeftIcon } from "@radix-ui/react-icons"
// Импорт кастомного компонента поля ввода с плавающей меткой
import FloatingLabelInput from "@/components/FloatingLabelInput"
// Импорты хуков React для управления состоянием
import { useState } from "react"
// Импорт компонента управления социальными сетями
import SocialLinksManager from "./SocialLinksManager"
// Импорт типов
import type { SocialLink } from "@/lib/types/social-links"
import styles from './ProfileEditForm.module.css'

interface ProfileEditFormProps {
  initialData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
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
  const [formData, setFormData] = useState(initialData)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialData.socialLinks ?? [])

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, socialLinks })
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
            <FloatingLabelInput
              id="phone"
              label="Телефон"
              type="tel"
              value={formData.phone ?? ''}
              onChange={handleChange('phone')}
              placeholder="+7 (999) 000-00-00"
            />
          </Box>

          <Box style={{ marginTop: '16px' }}>
            <Text size="2" weight="medium" mb="2" as="div">
              Социальные сети и мессенджеры
            </Text>
            <SocialLinksManager links={socialLinks} onUpdate={setSocialLinks} />
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
