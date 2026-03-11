import { Box, Flex, Text, Grid, Button } from '@radix-ui/themes'
import { PersonIcon, EnvelopeClosedIcon, Pencil1Icon, ChevronLeftIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { FloatingLabelInput } from '@/shared/components/forms/FloatingLabelInput'
import { SocialLinksManager } from './SocialLinksManager'
import type { SocialLink } from '@/shared/lib/types/social-links'
import styles from './ProfileEditForm.module.css'

const SaveIcon = ({ width = 16, height = 16 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 2.5C3 2.22386 3.22386 2 3.5 2H9.08579C9.351 2 9.60536 2.10536 9.79289 2.29289L12.7071 5.20711C12.8946 5.39464 13 5.649 13 5.91421V12.5C13 12.7761 12.7761 13 12.5 13H3.5C3.22386 13 3 12.7761 3 12.5V2.5ZM4 3V12H12V5.91421L9.08579 3H4ZM5.5 3H8.5V5H5.5V3ZM5.5 6.5H9.5V7.5H5.5V6.5ZM5.5 9H9.5V10H5.5V9Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
  </svg>
)

interface ProfileEditFormProps {
  initialData: {
    firstName: string
    lastName: string
    email: string
    socialLinks?: SocialLink[]
  }
  onCancel: () => void
  onSave: (data: ProfileEditFormProps['initialData']) => void
}

export function ProfileEditForm({ initialData, onCancel, onSave }: ProfileEditFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialData.socialLinks ?? [])

  const handleChange = (f: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [f]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, socialLinks })
    onCancel()
  }

  return (
    <Box className={styles.editBlock}>
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <Pencil1Icon width={20} height={20} />
          <Text size="4" weight="bold">Редактирование профиля</Text>
        </Flex>
      </Box>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Box className={styles.content}>
          <Grid columns="2" gap="4" width="100%" className={styles.grid}>
            <Box>
              <FloatingLabelInput id="firstName" label="Имя" value={formData.firstName} onChange={handleChange('firstName')} required disabled icon={<PersonIcon width={16} height={16} />} />
            </Box>
            <Box>
              <FloatingLabelInput id="lastName" label="Фамилия" value={formData.lastName} onChange={handleChange('lastName')} required disabled icon={<PersonIcon width={16} height={16} />} />
            </Box>
          </Grid>
          <Box style={{ marginTop: '16px' }}>
            <FloatingLabelInput id="email" label="Email" type="email" value={formData.email} onChange={handleChange('email')} required disabled icon={<EnvelopeClosedIcon width={16} height={16} />} />
          </Box>
          <Box style={{ marginTop: '16px' }}>
            <Text size="2" weight="medium" mb="2" as="div">Социальные сети и мессенджеры</Text>
            <SocialLinksManager links={socialLinks} onUpdate={setSocialLinks} />
          </Box>
        </Box>
        <Flex justify="between" align="center" className={styles.actions}>
          <Button type="button" variant="soft" onClick={onCancel}>
            <ChevronLeftIcon width={16} height={16} />
            Отмена
          </Button>
          <Button type="submit" className={styles.saveButton}>
            <SaveIcon width={16} height={16} />
            Сохранить изменения
          </Button>
        </Flex>
      </form>
    </Box>
  )
}
