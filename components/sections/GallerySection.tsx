"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { folioContainerClass, folioSectionXPad } from "@/components/sections/folioLayout"
import { cn } from "@/lib/utils"

export interface GalleryPicture {
  src: string
  alt: string
  caption?: string
}

function blockSaveIntent(e: React.SyntheticEvent) {
  e.preventDefault()
}

function preloadImage(src: string) {
  const img = new Image()
  img.src = src
}

function GalleryPhoto({
  src,
  alt,
  className,
  onClick,
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  onClick?: () => void
  priority?: boolean
}) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [src])

  const image = (
    <>
      {!loaded ? (
        <div
          className="absolute inset-0 animate-pulse rounded-lg bg-folio-surface-high/60 dark:bg-zinc-900/60"
          aria-hidden
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt={alt}
        className={cn(
          "select-none object-contain transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
        draggable={false}
        onLoad={() => setLoaded(true)}
        onContextMenu={blockSaveIntent}
      />
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="picture-protected group relative flex h-full w-full cursor-zoom-in items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-folio-primary"
        aria-label={`View ${alt} full screen`}
      >
        {image}
      </button>
    )
  }

  return (
    <div className="picture-protected relative flex h-full w-full items-center justify-center">
      {image}
    </div>
  )
}

export default function GallerySection({
  pictures,
}: {
  pictures: GalleryPicture[]
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const touchStartX = useRef(0)

  const total = pictures.length
  const hasMany = total > 1
  const current = pictures[selectedIndex]

  const goTo = useCallback(
    (index: number) => {
      setSelectedIndex((index + total) % total)
    },
    [total],
  )

  const goPrev = useCallback(() => {
    goTo(selectedIndex - 1)
  }, [goTo, selectedIndex])

  const goNext = useCallback(() => {
    goTo(selectedIndex + 1)
  }, [goTo, selectedIndex])

  const openLightbox = useCallback(() => {
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (lightboxOpen && !dialog.open) {
      dialog.showModal()
      document.body.style.overflow = "hidden"
    } else if (!lightboxOpen && dialog.open) {
      dialog.close()
      document.body.style.overflow = ""
    }
  }, [lightboxOpen])

  useEffect(() => {
    if (total <= 1) return

    const prev = (selectedIndex - 1 + total) % total
    const next = (selectedIndex + 1) % total
    preloadImage(pictures[prev].src)
    preloadImage(pictures[next].src)
  }, [selectedIndex, pictures, total])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "Escape") closeLightbox()
        if (e.key === "ArrowLeft") goPrev()
        if (e.key === "ArrowRight") goNext()
        return
      }

      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [lightboxOpen, closeLightbox, goPrev, goNext])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!hasMany) return
    const endX = e.changedTouches[0]?.clientX ?? 0
    const delta = endX - touchStartX.current
    if (delta > 48) goPrev()
    if (delta < -48) goNext()
  }

  if (total === 0) {
    return null
  }

  const counter = `${String(selectedIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`

  return (
    <>
      <section
        className={cn(
          "min-h-svh bg-transparent pb-8 pt-24 sm:pt-28 lg:pb-12",
          folioSectionXPad,
        )}
        aria-labelledby="gallery-heading"
      >
        <div className={cn(folioContainerClass, "flex min-h-[calc(100svh-7rem)] flex-col")}>
          <header className="mb-6 flex shrink-0 flex-wrap items-end justify-between gap-4 md:mb-8">
            <div>
              <h2
                id="gallery-heading"
                className="kinetic-monolith text-3xl font-black uppercase text-folio-on-surface sm:text-4xl lg:text-5xl"
              >
                Gallery
              </h2>
            </div>
            <p className="technical-label text-xs uppercase tracking-[0.35em] text-folio-on-surface-variant">
              {counter}
            </p>
          </header>

          <div className="gallery-stage relative flex min-h-0 flex-1 flex-col">
            <div
              className="gallery-viewer relative flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-folio-on-surface/10 bg-folio-surface-low/40 p-3 shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-zinc-950/40 sm:p-4 md:p-6 lg:rounded-3xl"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {hasMany ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="gallery-nav-btn absolute left-2 top-1/2 z-10 -translate-y-1/2 sm:left-4"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="gallery-nav-btn absolute right-2 top-1/2 z-10 -translate-y-1/2 sm:right-4"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                </>
              ) : null}

              <GalleryPhoto
                src={current.src}
                alt={current.alt}
                priority={selectedIndex === 0}
                className="max-h-[min(72vh,56rem)] w-full transition-transform duration-300 group-hover:scale-[1.01]"
                onClick={openLightbox}
              />
            </div>

            {current.caption ? (
              <p className="technical-label mt-3 shrink-0 text-center text-[11px] uppercase tracking-wider text-folio-on-surface-variant sm:mt-4">
                {current.caption}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        className="picture-lightbox gallery-lightbox fixed inset-0 z-[100] m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-black/95"
        onClose={closeLightbox}
        onCancel={(e) => {
          e.preventDefault()
          closeLightbox()
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeLightbox()
        }}
        onContextMenu={blockSaveIntent}
      >
        {lightboxOpen && current ? (
          <div
            className="picture-protected relative flex h-full min-h-0 flex-col"
            onContextMenu={blockSaveIntent}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <p className="technical-label truncate text-xs uppercase tracking-widest text-white/80">
                  {current.caption ?? current.alt}
                </p>
                <p className="technical-label mt-1 text-[10px] uppercase tracking-[0.3em] text-white/45">
                  {counter}
                </p>
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Close full screen"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-2 sm:px-8">
              {hasMany ? (
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white transition-colors hover:bg-black/70 sm:left-4"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden />
                </button>
              ) : null}

              <GalleryPhoto
                src={current.src}
                alt={current.alt}
                className="max-h-[calc(100svh-6rem)] w-full sm:max-h-[calc(100svh-7rem)]"
              />

              {hasMany ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white transition-colors hover:bg-black/70 sm:right-4"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  )
}
