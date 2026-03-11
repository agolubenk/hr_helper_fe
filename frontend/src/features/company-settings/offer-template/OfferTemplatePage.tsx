import { useState, useEffect, useRef } from 'react'
import {
  Flex,
  Text,
  Button,
  Box,
  TextField,
  Card,
  Separator,
  Select,
  Dialog,
} from '@radix-ui/themes'
import { UploadIcon, FileTextIcon, DownloadIcon } from '@radix-ui/react-icons'
import { useToast } from '@/shared/components/feedback/Toast'
import type { Variable } from './types'
import { AVAILABLE_VARIABLES } from './types'
import { processDocxPreview, processPptxPreview } from './previewProcessor'

const INITIAL_VARIABLES: Variable[] = [
  { key: '{company_name}', value: 'ООО "Компания"', category: 'Компания и вакансия', label: 'Название компании' },
  { key: '{vacancy_name}', value: 'Frontend Developer', category: 'Компания и вакансия', label: 'Название вакансии' },
  { key: '{candidate_name}', value: 'Иван Иванов', category: 'Кандидат', label: 'ФИО кандидата' },
  { key: '{salary_before_tax}', value: '200,000', category: 'Условия оффера', label: 'Сумма на ИС' },
  { key: '{currency}', value: 'RUB', category: 'Условия оффера', label: 'Валюта' },
  { key: '{start_date}', value: '01.02.2026', category: 'Кандидат', label: 'Дата старта' },
  { key: '{generation_date}', value: new Date().toLocaleDateString('ru-RU'), category: 'Системные', label: 'Дата формирования' },
]

function getVariablesByCategory(variables: Variable[]): Record<string, Variable[]> {
  const grouped: Record<string, Variable[]> = {}
  variables.forEach((v) => {
    if (!grouped[v.category]) grouped[v.category] = []
    grouped[v.category].push(v)
  })
  return grouped
}

export function OfferTemplatePage() {
  const toast = useToast()
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewContent, setPreviewContent] = useState<string>('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [variables, setVariables] = useState<Variable[]>(INITIAL_VARIABLES)
  const [selectedVariableKey, setSelectedVariableKey] = useState<string>('')
  const [newVariableValue, setNewVariableValue] = useState('')
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)
  const [fileType, setFileType] = useState<'docx' | 'pptx' | 'figma' | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const processFilePreview = async (file: File) => {
    setPreviewLoading(true)
    setPreviewError(null)
    setPreviewContent('')
    const ext = ('.' + file.name.split('.').pop()?.toLowerCase()) as '.docx' | '.pptx' | '.figma'
    try {
      if (ext === '.docx') {
        const html = await processDocxPreview(file, variables)
        setPreviewContent(html)
        setFileType('docx')
      } else if (ext === '.pptx') {
        const html = await processPptxPreview(file, variables)
        setPreviewContent(html)
        setFileType('pptx')
      } else if (ext === '.figma') {
        setPreviewError('Для предпросмотра Figma файлов требуется обработка на сервере.')
        setFileType('figma')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setPreviewError(`Ошибка при обработке файла: ${message}`)
    } finally {
      setPreviewLoading(false)
    }
  }

  useEffect(() => {
    if (templateFile && previewContent && !previewError && fileType !== 'figma') {
      if (fileType === 'docx') {
        processDocxPreview(templateFile, variables).then(setPreviewContent).catch(() => {})
      } else if (fileType === 'pptx') {
        processPptxPreview(templateFile, variables).then(setPreviewContent).catch(() => {})
      }
    }
  }, [variables])

  const validateAndSetFile = async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (['.docx', '.pptx', '.figma'].includes(ext)) {
      setTemplateFile(file)
      setFileType(ext.replace('.', '') as 'docx' | 'pptx' | 'figma')
      await processFilePreview(file)
      if (isMobile) setIsMobilePreviewOpen(true)
    } else {
      toast.showWarning('Формат не поддерживается', 'Поддерживаются только файлы: .docx, .pptx, .figma')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
      e.target.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files?.length) validateAndSetFile(files[0])
  }

  const handleAddVariable = () => {
    if (!selectedVariableKey || !newVariableValue.trim()) return
    const option = AVAILABLE_VARIABLES.find((v) => v.key === selectedVariableKey)
    if (!option) return
    if (variables.some((v) => v.key === selectedVariableKey)) {
      toast.showWarning('Переменная уже добавлена', 'Эта переменная уже есть в списке.')
      return
    }
    setVariables([
      ...variables,
      { key: selectedVariableKey, value: newVariableValue.trim(), category: option.category, label: option.label },
    ])
    setSelectedVariableKey('')
    setNewVariableValue('')
  }

  const handleDeleteVariable = (index: number) => {
    toast.showWarning('Удалить переменную?', 'Вы уверены, что хотите удалить эту переменную?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => setVariables((prev) => prev.filter((_, i) => i !== index)),
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const handleVariableChange = (index: number, newValue: string) => {
    setVariables((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], value: newValue }
      return next
    })
  }

  const getAvailableForSelect = () => AVAILABLE_VARIABLES.filter((v) => !variables.some((x) => x.key === v.key))
  const variablesByCategory = getVariablesByCategory(variables)

  return (
    <Box style={{ padding: '0 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Шаблон оффера
      </Text>

      <Flex direction="column" gap="4">
        <Card>
          <Flex direction="column" gap="3">
            <Text size="4" weight="bold">
              Загрузка шаблона
            </Text>
            <Separator size="4" />
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Файл шаблона (docx, pptx, figma)
              </Text>
              <Box
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '2px dashed var(--accent-9)' : '2px dashed var(--gray-a6)',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  backgroundColor: isDragging ? 'var(--accent-2)' : 'var(--gray-2)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => document.getElementById('offer-file-input')?.click()}
              >
                <input
                  id="offer-file-input"
                  type="file"
                  accept=".docx,.pptx,.figma"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                {templateFile ? (
                  <Flex direction="column" gap="2" align="center">
                    <FileTextIcon width={48} height={48} style={{ color: 'var(--accent-9)' }} />
                    <Text size="3" weight="medium">
                      {templateFile.name}
                    </Text>
                    <Text size="1" color="gray">
                      {(templateFile.size / 1024).toFixed(2)} KB
                    </Text>
                    <Button
                      size="2"
                      variant="soft"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation()
                        toast.showWarning('Удалить файл?', 'Вы уверены, что хотите удалить загруженный файл?', {
                          actions: [
                            { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
                            { label: 'Удалить', onClick: () => { setTemplateFile(null); setPreviewContent(''); setPreviewError(null); setFileType(null) }, variant: 'solid', color: 'red' },
                          ],
                        })
                      }}
                      mt="2"
                    >
                      Удалить файл
                    </Button>
                    <Text size="1" color="gray" mt="2">
                      Нажмите или перетащите другой файл для замены
                    </Text>
                  </Flex>
                ) : (
                  <Flex direction="column" gap="2" align="center">
                    <UploadIcon width={48} height={48} style={{ color: 'var(--gray-9)' }} />
                    <Text size="3" weight="medium">
                      Перетащите файл сюда или нажмите для выбора
                    </Text>
                    <Text size="2" color="gray">
                      Поддерживаются форматы: .docx, .pptx, .figma
                    </Text>
                  </Flex>
                )}
              </Box>
              <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>
                В файле используйте переменные в фигурных скобках, например: {'{company_name}'}, {'{candidate_name}'}, {'{salary_before_tax}'}, {'{start_date}'}
              </Text>
            </Box>
          </Flex>
        </Card>

        <Flex direction={isMobile ? 'column' : 'row'} gap="4" style={{ alignItems: 'flex-start' }}>
          <Card style={{ flex: isMobile ? '1' : '2.5', minWidth: isMobile ? '100%' : '60%', maxWidth: isMobile ? '100%' : 'none' }}>
            <Flex direction="column" gap="3">
              <Flex align="center" justify="between">
                <Text size="4" weight="bold">
                  Предпросмотр
                </Text>
                {isMobile && templateFile && previewContent && (
                  <Button variant="soft" size="2" onClick={() => setIsMobilePreviewOpen(true)}>
                    Открыть в полном экране
                  </Button>
                )}
              </Flex>
              <Separator size="4" />
              {templateFile ? (
                <Box
                  ref={previewContainerRef}
                  style={{
                    minHeight: '400px',
                    border: '1px solid var(--gray-a6)',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: fileType === 'docx' ? 'white' : 'var(--gray-2)',
                    overflow: 'auto',
                  }}
                >
                  {previewLoading ? (
                    <Flex direction="column" gap="2" align="center" justify="center" style={{ minHeight: '400px' }}>
                      <Text size="3" color="gray">
                        Загрузка предпросмотра...
                      </Text>
                    </Flex>
                  ) : previewError ? (
                    <Flex direction="column" gap="2" align="center" justify="center" style={{ minHeight: '400px' }}>
                      <FileTextIcon width={48} height={48} style={{ color: 'var(--gray-9)' }} />
                      <Text size="3" color="gray" weight="medium">
                        {templateFile.name}
                      </Text>
                      <Text size="2" color="orange" style={{ textAlign: 'center', maxWidth: '400px' }}>
                        {previewError}
                      </Text>
                      <Button
                        variant="soft"
                        onClick={() => {
                          const url = URL.createObjectURL(templateFile)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = templateFile.name
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <DownloadIcon width={16} height={16} />
                        Скачать файл
                      </Button>
                    </Flex>
                  ) : previewContent ? (
                    <Box
                      style={{
                        backgroundColor: fileType === 'docx' ? 'white' : '#f0f0f0',
                        overflow: 'auto',
                        borderRadius: '4px',
                        padding: '20px',
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: previewContent }}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: fileType === 'pptx' ? 'flex-start' : 'center', flexDirection: 'column' }}
                      />
                    </Box>
                  ) : (
                    <Flex direction="column" gap="2" align="center" justify="center" style={{ minHeight: '400px' }}>
                      <Text size="2" color="gray">
                        Предпросмотр загружается...
                      </Text>
                    </Flex>
                  )}
                </Box>
              ) : (
                <Box
                  style={{
                    minHeight: '400px',
                    border: '1px dashed var(--gray-a6)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--gray-2)',
                  }}
                >
                  <Text size="2" color="gray">
                    Загрузите файл шаблона для предпросмотра
                  </Text>
                </Box>
              )}
            </Flex>
          </Card>

          <Card style={{ flex: isMobile ? '1' : '1', minWidth: isMobile ? '100%' : '350px', maxWidth: isMobile ? '100%' : '400px' }}>
            <Flex direction="column" gap="3">
              <Text size="4" weight="bold">
                Настройка переменных
              </Text>
              <Separator size="4" />
              <Text size="2" color="gray" mb="2">
                Настройте примеры значений для переменных в шаблоне. Эти значения будут использоваться для предпросмотра.
              </Text>
              <Flex direction="column" gap="3">
                {Object.entries(variablesByCategory).map(([category, categoryVariables]) => (
                  <Box key={category}>
                    <Text size="2" weight="bold" mb="2" style={{ display: 'block', color: 'var(--gray-11)' }}>
                      {category}
                    </Text>
                    <Flex direction="column" gap="2">
                      {categoryVariables.map((variable) => {
                        const globalIndex = variables.findIndex((v) => v.key === variable.key)
                        return (
                          <Box
                            key={variable.key}
                            style={{
                              padding: '12px',
                              border: '1px solid var(--gray-a6)',
                              borderRadius: '6px',
                              backgroundColor: 'var(--gray-2)',
                            }}
                          >
                            <Flex direction="column" gap="2">
                              <Flex align="center" justify="between">
                                <Flex direction="column" gap="1" style={{ flex: 1 }}>
                                  <Text size="1" style={{ fontFamily: 'monospace' }}>
                                    {variable.key}
                                  </Text>
                                  <Text size="1" color="gray">
                                    {variable.label}
                                  </Text>
                                </Flex>
                                <Button
                                  size="1"
                                  variant="soft"
                                  color="red"
                                  onClick={() => handleDeleteVariable(globalIndex)}
                                  ml="2"
                                >
                                  Удалить
                                </Button>
                              </Flex>
                              <TextField.Root
                                size="2"
                                value={variable.value}
                                onChange={(e) => handleVariableChange(globalIndex, e.target.value)}
                                placeholder="Значение переменной"
                              />
                            </Flex>
                          </Box>
                        )
                      })}
                    </Flex>
                  </Box>
                ))}
                {variables.length === 0 && (
                  <Text size="2" color="gray" style={{ textAlign: 'center', padding: '20px' }}>
                    Нет добавленных переменных. Добавьте переменные из списка ниже.
                  </Text>
                )}
              </Flex>
              <Separator size="4" />
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Добавить переменную
                </Text>
                <Flex direction="column" gap="2">
                  <Box>
                    <Text size="1" weight="medium" mb="1" style={{ display: 'block' }}>
                      Выберите переменную
                    </Text>
                    <Select.Root
                      value={selectedVariableKey}
                      onValueChange={(value) => {
                        setSelectedVariableKey(value)
                        const option = AVAILABLE_VARIABLES.find((v) => v.key === value)
                        if (option) setNewVariableValue(option.defaultValue)
                      }}
                    >
                      <Select.Trigger placeholder="Выберите переменную..." />
                      <Select.Content>
                        {Object.entries(
                          getAvailableForSelect().reduce<Record<string, typeof AVAILABLE_VARIABLES>>((acc, v) => {
                            if (!acc[v.category]) acc[v.category] = []
                            acc[v.category].push(v)
                            return acc
                          }, {})
                        ).map(([category, options]) => (
                          <Select.Group key={category}>
                            <Select.Label>{category}</Select.Label>
                            {options.map((option) => (
                              <Select.Item key={option.key} value={option.key}>
                                {option.label} ({option.key})
                              </Select.Item>
                            ))}
                          </Select.Group>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>
                  <Box>
                    <Text size="1" weight="medium" mb="1" style={{ display: 'block' }}>
                      Пример значения
                    </Text>
                    <TextField.Root
                      size="2"
                      value={newVariableValue}
                      onChange={(e) => setNewVariableValue(e.target.value)}
                      placeholder="Введите пример значения"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && selectedVariableKey && newVariableValue.trim()) handleAddVariable()
                      }}
                    />
                  </Box>
                  <Button
                    variant="soft"
                    onClick={handleAddVariable}
                    disabled={!selectedVariableKey || !newVariableValue.trim()}
                  >
                    Добавить переменную
                  </Button>
                </Flex>
              </Box>
            </Flex>
          </Card>
        </Flex>

        <Flex gap="3" justify="end">
          <Button variant="soft">Отмена</Button>
          <Button variant="solid" disabled={!templateFile}>
            Сохранить шаблон
          </Button>
        </Flex>
      </Flex>

      <Dialog.Root open={isMobilePreviewOpen} onOpenChange={setIsMobilePreviewOpen}>
        <Dialog.Content style={{ maxWidth: '100vw', maxHeight: '100vh', width: '100%', height: '100%', padding: '0' }}>
          <Dialog.Title style={{ padding: '16px', borderBottom: '1px solid var(--gray-a6)' }}>
            <Flex align="center" justify="between">
              <Text>Предпросмотр</Text>
              <Button variant="ghost" size="2" onClick={() => setIsMobilePreviewOpen(false)}>
                Закрыть
              </Button>
            </Flex>
          </Dialog.Title>
          <Box
            style={{
              padding: '16px',
              height: 'calc(100vh - 120px)',
              overflow: 'auto',
              backgroundColor: fileType === 'docx' ? 'white' : '#f0f0f0',
            }}
          >
            {previewContent ? (
              <div dangerouslySetInnerHTML={{ __html: previewContent }} style={{ width: '100%' }} />
            ) : (
              <Text size="2" color="gray">Загрузка...</Text>
            )}
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
