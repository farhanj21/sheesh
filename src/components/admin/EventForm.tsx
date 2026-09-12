'use client'

import { useState, useEffect, useRef } from 'react'
import { Event } from '@/types'
import { X, Plus, Trash2, Upload } from 'lucide-react'

interface EventFormProps {
  event: Event | null
  onSave: (event: Event) => void
  onCancel: () => void
}

export function EventForm({ event, onSave, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<Event>({
    id: '',
    title: '',
    date: '',
    endDate: '',
    location: '',
    description: '',
    image: '',
    gallery: [],
    createdAt: new Date().toISOString().split('T')[0],
  })

  const [uploading, setUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (event) {
      // Convert date from "Month DD, YYYY" to YYYY-MM-DD for date picker
      let dateForPicker = event.date
      if (event.date && !event.date.includes('-')) {
        const dateObj = new Date(event.date)
        if (!isNaN(dateObj.getTime())) {
          dateForPicker = dateObj.toISOString().split('T')[0]
        }
      }

      let endDateForPicker = event.endDate || ''
      if (event.endDate && !event.endDate.includes('-')) {
        const dateObj = new Date(event.endDate)
        if (!isNaN(dateObj.getTime())) {
          endDateForPicker = dateObj.toISOString().split('T')[0]
        }
      }

      setFormData({
        ...event,
        date: dateForPicker,
        endDate: endDateForPicker
      })
    }
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const id = formData.id || `event-${Date.now()}`

    // Convert date from YYYY-MM-DD to "Month DD, YYYY" format
    let formattedDate = formData.date
    if (formData.date && formData.date.includes('-')) {
      const dateObj = new Date(formData.date + 'T00:00:00')
      formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    let formattedEndDate = formData.endDate
    if (formData.endDate && formData.endDate.includes('-')) {
      const dateObj = new Date(formData.endDate + 'T00:00:00')
      formattedEndDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onSave({
      ...formData,
      id,
      date: formattedDate,
      endDate: formattedEndDate || undefined,
    })
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Max dimensions
          const MAX_WIDTH = 1920
          const MAX_HEIGHT = 1920
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas to Blob failed'))
                return
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            },
            'image/jpeg',
            0.85 // Compression quality
          )
        }
        img.onerror = () => reject(new Error('Image load failed'))
      }
      reader.onerror = () => reject(new Error('FileReader failed'))
    })
  }

  const handleFileUpload = async (files: FileList | null, isGallery: boolean) => {
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        // Compress image before upload
        const compressedFile = await compressImage(file)
        
        // Check size
        if (compressedFile.size > 4 * 1024 * 1024) {
          alert(`Image ${file.name} is too large even after compression. Please use a smaller image.`)
          continue
        }

        const formDataUpload = new FormData()
        formDataUpload.append('file', compressedFile)
        formDataUpload.append('folder', 'sheesh-events')
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })
        
        if (!response.ok) {
          throw new Error('Upload failed')
        }
        
        const { url } = await response.json()
        
        if (isGallery) {
          setFormData((prev) => ({
            ...prev,
            gallery: [...prev.gallery, url],
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            image: url,
          }))
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">
          {event ? 'Edit Event' : 'Add New Event'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-black transition"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Event Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-gray-400"
              placeholder="Enter event title here"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Start Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-gray-400 [color-scheme:light]"
              placeholder="Enter start date here"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              End Date <span className="text-gray-500 font-normal text-xs">(Optional, for multi-day events)</span>
            </label>
            <input
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-gray-400 [color-scheme:light]"
              placeholder="Enter end date here"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Location <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-gray-400"
              placeholder="Enter location here"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-gray-400"
            placeholder="Enter description here"
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-black mb-4">Cover Image</h3>
          <div className="flex items-center gap-4">
             {formData.image && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={formData.image}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            <div>
                 <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files, false)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-gray-100 text-black rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={20} className="inline mr-2" />
                {uploading ? 'Uploading...' : 'Upload Cover'}
              </button>
            </div>
           
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-black mb-4">Gallery Images</h3>
          <div className="mb-4">
             <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files, true)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-gray-100 text-black rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={20} className="inline mr-2" />
                {uploading ? 'Uploading...' : 'Upload Gallery Images'}
              </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {formData.gallery.map((imgSrc, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-gray-300 h-24"
              >
                <img
                  src={imgSrc}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    gallery: formData.gallery.filter((_, i) => i !== index)
                  })}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-black rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            {event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  )
}
