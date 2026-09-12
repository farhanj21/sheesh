'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ImageGallery } from '@/components/events/ImageGallery'
import Link from 'next/link'
import { Event } from '@/types'
import { Button } from '@/components/ui/Button'

interface EventsPageContentProps {
  events: Event[]
}

export function EventsPageContent({ events }: EventsPageContentProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const openGallery = (eventId: string) => {
    setSelectedEventId(eventId)
    setIsGalleryOpen(true)
  }

  const closeGallery = () => {
    setIsGalleryOpen(false)
    setSelectedEventId(null)
  }

  const currentEvent = events.find(e => e.id === selectedEventId)
  
  // Helper to parse dates reliably
  const parseEventDate = (dateStr: string): Date => {
    // Trim whitespace and parse date
    const trimmed = dateStr.trim()
    const parsed = new Date(trimmed)
    return parsed
  }

  // Split events into upcoming and past
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Reset to start of day for accurate comparison

  const upcomingEvents = events
    .filter(e => {
      const eventDate = parseEventDate(e.endDate || e.date)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate >= now
    })
    .sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime())

  const pastEvents = events
    .filter(e => {
      const eventDate = parseEventDate(e.endDate || e.date)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate < now
    })
    .sort((a, b) => {
      const dateA = parseEventDate(a.endDate || a.date).getTime()
      const dateB = parseEventDate(b.endDate || b.date).getTime()
      return dateB - dateA // newest first (most recent at top)
    })

  return (
    <div className="relative min-h-screen pt-32 pb-16 bg-white dark:bg-black">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-black dark:to-black -z-10" />
      <div className="absolute inset-0 opacity-30 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/15 dark:via-gray-600/15 to-transparent animate-shimmer bg-[length:200%_100%]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-12">
        
        {/* Upcoming Events Section */}
        <div className="mb-20 max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-display font-bold text-black dark:text-white mb-8" data-text="Upcoming Events"
          >
            Upcoming Events
          </motion.h2>
          
          {upcomingEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-2xl p-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600/50 dark:text-gray-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-display font-bold text-black dark:text-white mb-2">No Upcoming Events</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 italic">
                  Stay tuned! We&apos;ll announce new events soon.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-16">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  onClick={() => openGallery(event.id)}
                  className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-glow-dark hover:shadow-glow-dark-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="grid md:grid-cols-[300px_1fr] gap-6">
                    <div className="relative h-64 md:h-auto group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/40 dark:from-black/40 to-transparent" />
                      <div className="absolute bottom-2 right-2 px-3 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full text-black dark:text-white border border-gray-300 dark:border-gray-700 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {event.gallery.length}
                      </div>
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <h2 className="text-3xl font-display font-bold text-black dark:text-white mb-3" data-text={event.title}>
                        {event.title}
                      </h2>
                      <div className="flex flex-col gap-2 mb-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{event.date}{event.endDate ? ` – ${event.endDate}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mb-20"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
            <div className="relative flex justify-center">
            <span className="bg-white dark:bg-black px-6 text-gray-600 dark:text-gray-400 text-lg">
              Past Events
            </span>
          </div>
        </motion.div>

        {/* Past Events Section */}
        <div className="space-y-16 max-w-5xl mx-auto">
          {pastEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              onClick={() => openGallery(event.id)}
              className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-glow-dark hover:shadow-glow-dark-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="grid md:grid-cols-[300px_1fr] gap-6">
                {/* Event Image */}
                <div className="relative h-64 md:h-auto group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 dark:from-black/40 to-transparent" />
                  {/* Gallery indicator */}
                  <div className="absolute bottom-2 right-2 px-3 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full text-black dark:text-white border border-gray-300 dark:border-gray-700 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.gallery.length}
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-8 flex flex-col justify-center">
                  <h2 className="text-3xl font-display font-bold text-black dark:text-white mb-3" data-text={event.title}>
                    {event.title}
                  </h2>
                  <div className="flex flex-col gap-2 mb-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{event.date}{event.endDate ? ` – ${event.endDate}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-20"
        >
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Want to see us at your next event?
          </p>
          <Link href="/contact">
            <Button
              size="md"
              className="text-sm sm:text-md tracking-wide text-black dark:text-black bg-gradient-to-br from-gray-300 via-gray-100 to-gray-300 hover:from-gray-400 hover:via-gray-200 hover:to-gray-400 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full w-full sm:w-auto"
            >
              Get in Touch
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Image Gallery Modal */}
      {currentEvent && (
        <ImageGallery
          images={currentEvent.gallery}
          isOpen={isGalleryOpen}
          onClose={closeGallery}
        />
      )}
    </div>
  )
}
