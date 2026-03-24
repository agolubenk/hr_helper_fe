# Интеграции на вкладке профиля (фаза 3.3)

**Источник в коде:** `src/components/profile/IntegrationsPage.tsx`.

## Список сущностей на экране

1. **Расширение Chrome «HR Helper»** — отдельная карточка, `ExtensionSettingsModal`.
2. Карточки интеграций (сетка, `IntegrationSettingsModal` по `handleConfigure`):
   - Gemini AI  
   - Huntflow (статус из `getHuntflowUserSettings`, prod/sandbox, токены)  
   - ClickUp  
   - Notion  
   - Telegram  
   - Google  
   - hh.ru / rabota.by  
   - OpenAI  
   - Cloud AI  
   - n8n  

## Примечание для приёмки

Паритет с `frontend old/components/profile/IntegrationsPage.tsx` по **набору имён и блоков** сохранён на уровне перечисленных интеграций + расширение. Детальный построчный diff при расхождениях UI — в `MIGRATION_DIVERGENCES.md` §9.
