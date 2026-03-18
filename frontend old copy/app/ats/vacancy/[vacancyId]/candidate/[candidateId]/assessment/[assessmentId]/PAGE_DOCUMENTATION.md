# Документация страницы: Просмотр оценки (recr-chat/.../assessment/[assessmentId]/page.tsx)

## Общее описание

Страница просмотра сохранённого результата оценки кандидата. Отображает баллы по компетенциям и прикреплённые скриншоты (после интеграции с API). Есть переход к карточке кандидата и к редактированию оценки.

## Параметры маршрута

- `vacancyId`, `candidateId`, `assessmentId`

## Связи

- Редактирование: `/recr-chat/.../assessment/[assessmentId]/edit`
- Карточка кандидата: `/recr-chat/vacancy/[vacancyId]/candidate/[candidateId]`

## TODO

- Подгрузка списка компетенций с баллами и вложениями по `assessment_id` из API.
