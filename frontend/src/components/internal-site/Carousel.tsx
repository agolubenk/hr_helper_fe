import { useRef, useState } from 'react'
import { Flex, Box, Text, IconButton } from '@radix-ui/themes'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import styles from './Carousel.module.css'

export interface CarouselSlide {
  id: string
  title: string
  description?: string
  href?: string
  image?: string
}

interface CarouselProps {
  slides: CarouselSlide[]
}

export function Carousel({ slides }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(slides.length > 1)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const step = el.clientWidth * 0.9
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' })
    setTimeout(updateScrollState, 300)
  }

  if (slides.length === 0) return null

  return (
    <Box className={styles.wrapper}>
      <div ref={scrollRef} className={styles.track} onScroll={updateScrollState}>
        {slides.map((slide) => (
          <div key={slide.id} className={styles.slide}>
            {slide.href ? (
              <a href={slide.href} className={styles.slideLink}>
                <SlideContent slide={slide} />
              </a>
            ) : (
              <SlideContent slide={slide} />
            )}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <Flex gap="1" justify="end" mt="2">
          <IconButton
            size="1"
            variant="soft"
            disabled={!canScrollLeft}
            onClick={() => scroll('left')}
            aria-label="Назад"
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            size="1"
            variant="soft"
            disabled={!canScrollRight}
            onClick={() => scroll('right')}
            aria-label="Вперёд"
          >
            <ChevronRightIcon />
          </IconButton>
        </Flex>
      )}
    </Box>
  )
}

function SlideContent({ slide }: { slide: CarouselSlide }) {
  return (
    <Flex direction="column" gap="2" className={styles.slideContent}>
      {slide.image && (
        <div className={styles.slideImage} style={{ backgroundImage: `url(${slide.image})` }} />
      )}
      <Text size="3" weight="bold">
        {slide.title}
      </Text>
      {slide.description && (
        <Text size="2" color="gray">
          {slide.description}
        </Text>
      )}
    </Flex>
  )
}

