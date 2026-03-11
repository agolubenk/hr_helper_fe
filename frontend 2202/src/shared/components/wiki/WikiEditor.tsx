/**
 * WYSIWYG-редактор вики в стиле Summernote/Jira.
 * TipTap + панель форматирования.
 */
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { BackgroundColor } from '@tiptap/extension-text-style/background-color'
import Image from '@tiptap/extension-image'
import {
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
  ListBulletIcon,
  CodeIcon,
  QuoteIcon,
  Link2Icon,
  UnderlineIcon,
  ImageIcon,
} from '@radix-ui/react-icons'
import { Flex, IconButton, Separator, Tooltip, Text, Popover } from '@radix-ui/themes'
import { useCallback, useEffect, useState } from 'react'
import styles from './WikiEditor.module.css'

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
]

const BG_COLORS = [
  '#ffffff', '#f3f3f3', '#efefef', '#d9d9d9', '#cccccc', '#b7b7b7', '#999999', '#666666', '#434343', '#000000',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc', '#e6b8af',
]

interface WikiEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  editable?: boolean
}

export function WikiEditor({
  content,
  onChange,
  placeholder = 'Введите содержание страницы. Можно форматировать текст, вставлять списки, таблицы и ссылки.',
  minHeight = 280,
  editable = true,
}: WikiEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextStyle,
      Color,
      BackgroundColor,
      Image.configure({ allowBase64: true }),
    ],
    content: content || '',
    editable,
    editorProps: {
      attributes: {
        class: styles.editorBody,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  }, [editable])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', { emitUpdate: false })
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL ссылки:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const setImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL изображения:')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={styles.wrapper} style={{ minHeight }}>
      {editable && (
        <Flex gap="1" align="center" className={styles.toolbar} p="1">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Жирный (Ctrl+B)">
            <FontBoldIcon />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Курсив (Ctrl+I)">
            <FontItalicIcon />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Зачёркнутый">
            <StrikethroughIcon />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Подчёркивание (Ctrl+U)">
            <UnderlineIcon />
          </ToolbarButton>
          <Separator orientation="vertical" size="1" />
          <ColorPicker editor={editor} colors={TEXT_COLORS} type="color" />
          <ColorPicker editor={editor} colors={BG_COLORS} type="backgroundColor" />
          <Separator orientation="vertical" size="1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Заголовок 1">
            <Text size="1" weight="bold">H1</Text>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Заголовок 2">
            <Text size="1" weight="bold">H2</Text>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Заголовок 3">
            <Text size="1" weight="bold">H3</Text>
          </ToolbarButton>
          <Separator orientation="vertical" size="1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Маркированный список">
            <ListBulletIcon />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Нумерованный список">
            <Text size="1" weight="bold">1.</Text>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Цитата">
            <QuoteIcon />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Код">
            <CodeIcon />
          </ToolbarButton>
          <Separator orientation="vertical" size="1" />
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive('link')}
            title="Ссылка"
          >
            <Link2Icon />
          </ToolbarButton>
          <ToolbarButton
            onClick={setImage}
            active={false}
            title="Вставить изображение"
          >
            <ImageIcon />
          </ToolbarButton>
        </Flex>
      )}
      <div className={styles.editorWrap}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ColorPicker({
  editor,
  colors,
  type,
}: {
  editor: ReturnType<typeof useEditor>
  colors: string[]
  type: 'color' | 'backgroundColor'
}) {
  const [open, setOpen] = useState(false)
  const isColor = type === 'color'
  const current = isColor
    ? editor?.getAttributes('textStyle').color
    : editor?.getAttributes('textStyle').backgroundColor
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <Tooltip content={isColor ? 'Цвет текста' : 'Цвет фона'}>
          <IconButton
            type="button"
            size="1"
            variant="soft"
            onPointerDown={(e) => e.preventDefault()}
            className={styles.toolbarBtn}
            style={{
              ...(isColor && current ? { color: current } : {}),
              ...(!isColor && current ? { backgroundColor: current } : {}),
            }}
          >
            <Text size="1">A</Text>
          </IconButton>
        </Tooltip>
      </Popover.Trigger>
      <Popover.Content size="1" className={styles.colorPopover} onOpenAutoFocus={(e) => e.preventDefault()}>
        <Flex gap="1" wrap="wrap" style={{ width: 160 }}>
          <button
            type="button"
            className={styles.colorSwatch}
            style={{ border: '1px solid var(--gray-6)' }}
            onPointerDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault()
              if (isColor) editor?.chain().focus().unsetColor().run()
              else editor?.chain().focus().unsetBackgroundColor().run()
              setOpen(false)
            }}
            title="Сбросить"
          >
            ✕
          </button>
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={styles.colorSwatch}
              style={{ backgroundColor: c }}
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault()
                if (isColor) editor?.chain().focus().setColor(c).run()
                else editor?.chain().focus().setBackgroundColor(c).run()
                setOpen(false)
              }}
            />
          ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <Tooltip content={title}>
      <IconButton
        type="button"
        size="1"
        variant={active ? 'solid' : 'soft'}
        onPointerDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault()
          onClick()
        }}
        className={styles.toolbarBtn}
      >
        {children}
      </IconButton>
    </Tooltip>
  )
}

