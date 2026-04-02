import { Flex, Text, Button, Box, Separator } from '@radix-ui/themes'
import { SunIcon, MoonIcon, PersonIcon, LockClosedIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { useRouter } from '@/router-adapter'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { useTheme } from '@/components/ThemeProvider'
import FloatingLabelInput from '@/components/FloatingLabelInput'
import { LogoRobot } from '@/components/logo'
import styles from '@/app/pages/styles/LoginPage.module.css'

export function LoginPage() {
  useDocumentTitle('Вход — HR Helper')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { theme, toggleTheme, lightThemeAccentColor, darkThemeAccentColor } = useTheme()
  const accentColor = theme === 'light' ? lightThemeAccentColor : darkThemeAccentColor
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log('Email login:', { email, password })
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleGoogleLogin = () => {
    console.log('Google login')
    window.location.href = '/api/auth/google'
  }

  return (
    <Flex
      width="100vw"
      height="100vh"
      align="center"
      justify="center"
      style={{
        backgroundColor: 'var(--color-background)',
        position: 'relative',
        padding: '20px',
      }}
    >
      <Box style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        <Box
          style={{ position: 'absolute', top: '0', right: '-56px', zIndex: 10 }}
          className={styles.themeButtonDesktop}
        >
          <Button
            variant="ghost"
            size="2"
            onClick={toggleTheme}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-panel)',
              border: '1px solid var(--gray-a6)',
            }}
            title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
          >
            {theme === 'light' ? (
              <MoonIcon width={18} height={18} style={{ color: 'var(--gray-12)' }} />
            ) : (
              <SunIcon width={18} height={18} style={{ color: 'var(--gray-12)' }} />
            )}
          </Button>
        </Box>

        <Box
          style={{
            width: '100%',
            padding: '32px',
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--gray-a6)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            position: 'relative',
          }}
        >
          <Box
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
            className={styles.themeButtonMobile}
          >
            <Button
              variant="ghost"
              size="2"
              onClick={toggleTheme}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: '1px solid var(--gray-a6)',
              }}
              title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
            >
              {theme === 'light' ? (
                <MoonIcon width={18} height={18} style={{ color: 'var(--gray-12)' }} />
              ) : (
                <SunIcon width={18} height={18} style={{ color: 'var(--gray-12)' }} />
              )}
            </Button>
          </Box>

          <Flex direction="column" gap="6" align="center">
            <Flex direction="column" gap="2" align="center">
              <Flex align="center" gap="3" style={{ marginBottom: 4 }}>
                <LogoRobot theme={theme} accentColor={accentColor} size={48} />
                <Text size="7" weight="bold">
                  HR Helper
                </Text>
              </Flex>
              <Text size="3" color="gray">
                Войдите в свой аккаунт
              </Text>
            </Flex>

            <Flex direction="column" gap="4" width="100%">
              <form onSubmit={handleEmailLogin} style={{ width: '100%' }}>
                <Flex direction="column" gap="4" width="100%">
                  <FloatingLabelInput
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    icon={<PersonIcon width={16} height={16} />}
                  />
                  <FloatingLabelInput
                    id="password"
                    label="Пароль"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    required
                    icon={<LockClosedIcon width={16} height={16} />}
                  />
                  <Button type="submit" size="3" style={{ width: '100%' }} disabled={isLoading}>
                    {isLoading ? 'Вход...' : 'Войти'}
                  </Button>
                </Flex>
              </form>

              <Flex align="center" gap="3" width="100%">
                <Separator size="4" style={{ flex: 1 }} />
                <Text size="2" color="gray">
                  или
                </Text>
                <Separator size="4" style={{ flex: 1 }} />
              </Flex>

              <Button size="3" variant="outline" style={{ width: '100%' }} onClick={handleGoogleLogin}>
                <Flex align="center" gap="2" justify="center">
                  <Box
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background:
                        'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: 'white',
                    }}
                  >
                    G
                  </Box>
                  <Text>Войти через Google</Text>
                </Flex>
              </Button>
            </Flex>

            <Flex direction="column" gap="2" align="center" width="100%">
              <Button
                variant="ghost"
                size="2"
                style={{ cursor: 'pointer' }}
                onClick={() => router.push('/account/forgot-password')}
              >
                <Text size="2" color="gray">
                  Забыли пароль?
                </Text>
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}
