import { Box, Flex, Text, Button, Card, Badge, Avatar, Separator, Dialog } from '@radix-ui/themes'
import { EnvelopeClosedIcon } from '@radix-ui/react-icons'
import type { AtsCandidate } from './mocks'
import { getCandidateInitials } from './mocks'
import { useToast } from '@/components/Toast/ToastContext'
import { getPlatformInfo, getSocialUrl, RECR_CHAT_SOCIAL_PLATFORMS } from '@/lib/socialPlatforms'
import {
  calculateDuplicateProbability,
  duplicateFieldIsMatch,
  getCandidateEmailsForCompare,
  getCandidatePhonesForCompare,
  getSocialContactsForDuplicateCompare,
  hasMatchingDuplicateContacts,
  isDuplicateContactMatch,
  MOCK_DUPLICATE_CANDIDATE_FOR_COMPARE,
} from './duplicateSuspicionUtils'

const duplicatePartner = MOCK_DUPLICATE_CANDIDATE_FOR_COMPARE

interface DuplicateSuspicionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: AtsCandidate
  candidateAvatarSrc?: string
}

export function DuplicateSuspicionModal({
  open,
  onOpenChange,
  candidate,
  candidateAvatarSrc,
}: DuplicateSuspicionModalProps) {
  const toast = useToast()
  const c1 = candidate as unknown as Record<string, unknown>
  const prob = calculateDuplicateProbability(c1, duplicatePartner)

  const primaryEmails = getCandidateEmailsForCompare(c1)
  const primaryPhones = getCandidatePhonesForCompare(c1)

  const socialRowsPrimary = RECR_CHAT_SOCIAL_PLATFORMS.map((platform) => {
    const contacts = getSocialContactsForDuplicateCompare(c1, platform)
    const hasContact = contacts.length > 0
    return {
      platform,
      contacts,
      hasContact,
      ...getPlatformInfo(platform),
    }
  }).filter((row) => row.hasContact)

  const dupEmails = getCandidateEmailsForCompare(duplicatePartner)
  const dupPhones = getCandidatePhonesForCompare(duplicatePartner)

  const probColor =
    prob >= 70 ? { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#ef4444' } : prob >= 50
      ? { bg: 'rgba(251, 146, 60, 0.15)', border: '#fb923c', text: '#fb923c' }
      : { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#3b82f6' }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: '1200px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <Box style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-a6)', flexShrink: 0 }}>
          <Flex align="center" justify="between" style={{ position: 'relative' }}>
            <Box style={{ flex: 1 }}>
              <Dialog.Title>Подозрение на дубликат</Dialog.Title>
              <Dialog.Description size="2" color="gray" mt="1">
                Сравните карточки похожих кандидатов. Совпадающие элементы выделены красными метками.
              </Dialog.Description>
            </Box>
            <Box
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: probColor.bg,
                border: `2px solid ${probColor.border}`,
              }}
            >
              <Text size="3" weight="bold" style={{ color: probColor.text }}>
                Вероятность: {prob}%
              </Text>
            </Box>
          </Flex>
        </Box>

        <Box style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Flex direction="row" gap="4" style={{ alignItems: 'flex-start' }}>
            <Card style={{ flex: 1, minWidth: 0 }}>
              <Flex direction="column" gap="4">
                <Flex align="center" gap="3" style={{ position: 'relative' }}>
                  <Avatar
                    size="5"
                    src={candidateAvatarSrc}
                    fallback={getCandidateInitials(candidate)}
                    style={{ backgroundColor: candidate.statusColor ?? 'var(--accent-9)' }}
                  />
                  <Flex
                    direction="column"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      position: 'relative',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: duplicateFieldIsMatch(candidate.name, duplicatePartner.name)
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'transparent',
                    }}
                  >
                    <Text size="4" weight="bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {candidate.name}
                    </Text>
                    <Flex
                      align="center"
                      gap="2"
                      style={{
                        position: 'relative',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        backgroundColor: duplicateFieldIsMatch(candidate.position, duplicatePartner.position)
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Text size="2" color="gray">
                        {candidate.position}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>

                <Separator />

                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    Контакты
                  </Text>
                  {primaryEmails.length > 0 && (
                    <Box mb="3">
                      <Flex direction="column" gap="1">
                        {primaryEmails.map((email, index) => {
                          const isEmailMatch = isDuplicateContactMatch(email, dupEmails)
                          return (
                            <Flex
                              key={index}
                              align="center"
                              gap="2"
                              style={{
                                flexWrap: 'nowrap',
                                minWidth: 0,
                                position: 'relative',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: isEmailMatch ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                              }}
                            >
                              <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                              <Text size="2" weight="medium" style={{ flexShrink: 0 }}>
                                Email:
                              </Text>
                              <Text size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                {email}
                              </Text>
                            </Flex>
                          )
                        })}
                      </Flex>
                    </Box>
                  )}
                  {primaryPhones.length > 0 && (
                    <Box mb="3">
                      <Flex direction="column" gap="1">
                        {primaryPhones.map((phone, index) => {
                          const isPhoneMatch = isDuplicateContactMatch(phone, dupPhones)
                          return (
                            <Flex
                              key={index}
                              align="center"
                              gap="2"
                              style={{
                                flexWrap: 'nowrap',
                                position: 'relative',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: isPhoneMatch ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                              }}
                            >
                              <Text size="2" weight="medium" style={{ flexShrink: 0 }}>
                                📞 Телефон:
                              </Text>
                              <Text size="2">{phone}</Text>
                            </Flex>
                          )
                        })}
                      </Flex>
                    </Box>
                  )}
                </Box>

                <Separator />

                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    Социальные сети
                  </Text>
                  <Flex direction="column" gap="3">
                    {socialRowsPrimary.map((social) => {
                      const duplicateContacts = getSocialContactsForDuplicateCompare(duplicatePartner, social.platform)
                      const hasPlatformMatch = hasMatchingDuplicateContacts(social.contacts, duplicateContacts)
                      return (
                        <Box
                          key={social.platform}
                          style={{
                            position: 'relative',
                            padding: '8px',
                            borderRadius: '4px',
                            backgroundColor: hasPlatformMatch ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                          }}
                        >
                          <Flex align="center" gap="2" mb="2">
                            <Box style={{ color: social.color, display: 'flex', alignItems: 'center' }}>{social.icon}</Box>
                            <Text size="2" weight="medium">
                              {social.name}:
                            </Text>
                          </Flex>
                          <Flex direction="column" gap="1" style={{ marginLeft: '24px' }}>
                            {social.contacts.map((contact, index) => {
                              const contactMatches = isDuplicateContactMatch(contact, duplicateContacts)
                              const url = getSocialUrl(social.platform, contact)
                              return (
                                <Flex
                                  key={`${social.platform}-${index}`}
                                  align="center"
                                  gap="2"
                                  style={{
                                    position: 'relative',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: contactMatches ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                  }}
                                >
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      textDecoration: 'none',
                                      color: 'var(--accent-11)',
                                      fontSize: '14px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      flex: 1,
                                      minWidth: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.textDecoration = 'underline'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.textDecoration = 'none'
                                    }}
                                  >
                                    {contact}
                                  </a>
                                </Flex>
                              )
                            })}
                          </Flex>
                        </Box>
                      )
                    })}
                  </Flex>
                </Box>

                <Separator />

                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    Дополнительно
                  </Text>
                  <Flex direction="column" gap="2">
                    <Flex
                      align="center"
                      gap="2"
                      style={{
                        position: 'relative',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: duplicateFieldIsMatch(candidate.vacancy, duplicatePartner.vacancy)
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Text size="2">
                        <strong>Вакансия:</strong> {candidate.vacancy}
                      </Text>
                    </Flex>
                    <Flex
                      align="center"
                      gap="2"
                      style={{
                        position: 'relative',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: duplicateFieldIsMatch(candidate.status, duplicatePartner.status)
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Text size="2">
                        <strong>Статус:</strong> {candidate.status}
                      </Text>
                    </Flex>
                    <Flex
                      align="center"
                      gap="2"
                      style={{
                        position: 'relative',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: duplicateFieldIsMatch(candidate.source, duplicatePartner.source)
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Text size="2">
                        <strong>Источник:</strong> {candidate.source}
                      </Text>
                    </Flex>
                    {candidate.location && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(candidate.location, duplicatePartner.location)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Локация:</strong> {candidate.location}
                        </Text>
                      </Flex>
                    )}
                    {candidate.applied && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(candidate.applied, duplicatePartner.applied)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Дата подачи:</strong> {candidate.applied}
                        </Text>
                      </Flex>
                    )}
                    {candidate.level && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(candidate.level, duplicatePartner.level)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Уровень:</strong> {candidate.level}
                        </Text>
                      </Flex>
                    )}
                    {candidate.tags && candidate.tags.length > 0 && (
                      <Flex
                        align="center"
                        gap="2"
                        wrap="wrap"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(candidate.tags, duplicatePartner.tags)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2" weight="medium">
                          Теги:
                        </Text>
                        {candidate.tags.map((tag, index) => (
                          <Badge key={index} size="1" color="blue">
                            {tag}
                          </Badge>
                        ))}
                      </Flex>
                    )}
                    {candidate.age != null && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(candidate.age, duplicatePartner.age)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Возраст:</strong> {candidate.age}
                        </Text>
                      </Flex>
                    )}
                    {candidate.gender && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(candidate.gender, duplicatePartner.gender)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Пол:</strong> {candidate.gender}
                        </Text>
                      </Flex>
                    )}
                    {candidate.salaryExpectations && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(
                            candidate.salaryExpectations,
                            duplicatePartner.salaryExpectations
                          )
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Ожидания по зарплате:</strong> {candidate.salaryExpectations}
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                </Box>
              </Flex>
            </Card>

            <Card style={{ flex: 1, minWidth: 0 }}>
              <Flex direction="column" gap="4">
                <Flex align="center" gap="3" style={{ position: 'relative' }}>
                  <Avatar
                    size="5"
                    fallback={String(duplicatePartner.avatar ?? '?')}
                    style={{ backgroundColor: 'var(--gray-5)' }}
                  />
                  <Flex
                    direction="column"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      position: 'relative',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: duplicateFieldIsMatch(duplicatePartner.name, candidate.name)
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'transparent',
                    }}
                  >
                    <Text size="4" weight="bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(duplicatePartner.name)} (дубликат?)
                    </Text>
                    <Flex
                      align="center"
                      gap="2"
                      style={{
                        position: 'relative',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        backgroundColor: duplicateFieldIsMatch(duplicatePartner.position, candidate.position)
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Text size="2" color="gray">
                        {String(duplicatePartner.position ?? '')}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>

                <Separator />

                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    Контакты
                  </Text>
                  {dupEmails.length > 0 && (
                    <Box mb="3">
                      <Flex direction="column" gap="1">
                        {dupEmails.map((email, index) => {
                          const isEmailMatch = isDuplicateContactMatch(email, primaryEmails)
                          return (
                            <Flex
                              key={index}
                              align="center"
                              gap="2"
                              style={{
                                flexWrap: 'nowrap',
                                minWidth: 0,
                                position: 'relative',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: isEmailMatch ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                              }}
                            >
                              <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                              <Text size="2" weight="medium" style={{ flexShrink: 0 }}>
                                Email:
                              </Text>
                              <Text size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                {email}
                              </Text>
                            </Flex>
                          )
                        })}
                      </Flex>
                    </Box>
                  )}
                  {dupPhones.length > 0 && (
                    <Box mb="3">
                      <Flex direction="column" gap="1">
                        {dupPhones.map((phone, index) => {
                          const isPhoneMatch = isDuplicateContactMatch(phone, primaryPhones)
                          return (
                            <Flex
                              key={index}
                              align="center"
                              gap="2"
                              style={{
                                flexWrap: 'nowrap',
                                position: 'relative',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: isPhoneMatch ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                              }}
                            >
                              <Text size="2" weight="medium" style={{ flexShrink: 0 }}>
                                📞 Телефон:
                              </Text>
                              <Text size="2">{phone}</Text>
                            </Flex>
                          )
                        })}
                      </Flex>
                    </Box>
                  )}
                </Box>

                <Separator />

                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    Социальные сети
                  </Text>
                  <Flex direction="column" gap="3">
                    {RECR_CHAT_SOCIAL_PLATFORMS.map((platform) => {
                      const contacts = getSocialContactsForDuplicateCompare(duplicatePartner, platform)
                      if (contacts.length === 0) return null
                      const platformInfo = getPlatformInfo(platform)
                      const currentContacts = getSocialContactsForDuplicateCompare(c1, platform)
                      const hasPlatformMatch = hasMatchingDuplicateContacts(contacts, currentContacts)
                      return (
                        <Box
                          key={platform}
                          style={{
                            position: 'relative',
                            padding: '8px',
                            borderRadius: '4px',
                            backgroundColor: hasPlatformMatch ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                          }}
                        >
                          <Flex align="center" gap="2" mb="2">
                            <Box style={{ color: platformInfo.color, display: 'flex', alignItems: 'center' }}>
                              {platformInfo.icon}
                            </Box>
                            <Text size="2" weight="medium">
                              {platformInfo.name}:
                            </Text>
                          </Flex>
                          <Flex direction="column" gap="1" style={{ marginLeft: '24px' }}>
                            {contacts.map((contact, index) => {
                              const contactMatches = isDuplicateContactMatch(contact, currentContacts)
                              const url = getSocialUrl(platform, contact)
                              return (
                                <Flex
                                  key={`${platform}-${index}`}
                                  align="center"
                                  gap="2"
                                  style={{
                                    position: 'relative',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: contactMatches ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                  }}
                                >
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      textDecoration: 'none',
                                      color: 'var(--accent-11)',
                                      fontSize: '14px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      flex: 1,
                                      minWidth: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.textDecoration = 'underline'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.textDecoration = 'none'
                                    }}
                                  >
                                    {contact}
                                  </a>
                                </Flex>
                              )
                            })}
                          </Flex>
                        </Box>
                      )
                    })}
                  </Flex>
                </Box>

                <Separator />

                <Box>
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    Дополнительно
                  </Text>
                  <Flex direction="column" gap="2">
                    <Flex
                      align="center"
                      gap="2"
                      style={{
                        position: 'relative',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: duplicateFieldIsMatch(duplicatePartner.vacancy, candidate.vacancy)
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Text size="2">
                        <strong>Вакансия:</strong> {String(duplicatePartner.vacancy ?? '')}
                      </Text>
                    </Flex>
                    <Flex
                      align="center"
                      gap="2"
                      style={{
                        position: 'relative',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: duplicateFieldIsMatch(duplicatePartner.status, candidate.status)
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Text size="2">
                        <strong>Статус:</strong> {String(duplicatePartner.status ?? '')}
                      </Text>
                    </Flex>
                    <Flex
                      align="center"
                      gap="2"
                      style={{
                        position: 'relative',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: duplicateFieldIsMatch(duplicatePartner.source, candidate.source)
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Text size="2">
                        <strong>Источник:</strong> {String(duplicatePartner.source ?? '')}
                      </Text>
                    </Flex>
                    {typeof duplicatePartner.location === 'string' && duplicatePartner.location.trim() !== '' && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(duplicatePartner.location, candidate.location)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Локация:</strong> {duplicatePartner.location}
                        </Text>
                      </Flex>
                    )}
                    {typeof duplicatePartner.applied === 'string' && duplicatePartner.applied.trim() !== '' && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(duplicatePartner.applied, candidate.applied)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Дата подачи:</strong> {duplicatePartner.applied}
                        </Text>
                      </Flex>
                    )}
                    {typeof duplicatePartner.level === 'string' && duplicatePartner.level.trim() !== '' && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(duplicatePartner.level, candidate.level)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Уровень:</strong> {duplicatePartner.level}
                        </Text>
                      </Flex>
                    )}
                    {Array.isArray(duplicatePartner.tags) && duplicatePartner.tags.length > 0 && (
                      <Flex
                        align="center"
                        gap="2"
                        wrap="wrap"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(duplicatePartner.tags, candidate.tags)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2" weight="medium">
                          Теги:
                        </Text>
                        {(duplicatePartner.tags as string[]).map((tag, index) => (
                          <Badge key={index} size="1" color="blue">
                            {tag}
                          </Badge>
                        ))}
                      </Flex>
                    )}
                    {duplicatePartner.age != null && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(duplicatePartner.age, candidate.age)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Возраст:</strong> {String(duplicatePartner.age)}
                        </Text>
                      </Flex>
                    )}
                    {typeof duplicatePartner.gender === 'string' && duplicatePartner.gender.trim() !== '' && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(duplicatePartner.gender, candidate.gender)
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Пол:</strong> {duplicatePartner.gender}
                        </Text>
                      </Flex>
                    )}
                    {typeof duplicatePartner.salaryExpectations === 'string' &&
                      duplicatePartner.salaryExpectations.trim() !== '' && (
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          position: 'relative',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: duplicateFieldIsMatch(
                            duplicatePartner.salaryExpectations,
                            candidate.salaryExpectations
                          )
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'transparent',
                        }}
                      >
                        <Text size="2">
                          <strong>Ожидания по зарплате:</strong> {duplicatePartner.salaryExpectations}
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                </Box>
              </Flex>
            </Card>
          </Flex>
        </Box>

        <Box
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--gray-a6)',
            flexShrink: 0,
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <Flex gap="3" style={{ width: '100%' }}>
            <Button variant="soft" onClick={() => onOpenChange(false)} style={{ flex: 1, width: '100%' }}>
              Это разные кандидаты
            </Button>
            <Button
              variant="solid"
              color="red"
              onClick={() => {
                toast.showInfo('Скоро', 'Объединение кандидатов будет доступно после подключения API.')
                onOpenChange(false)
              }}
              style={{ flex: 1, width: '100%' }}
            >
              Объединить кандидатов
            </Button>
          </Flex>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  )
}
