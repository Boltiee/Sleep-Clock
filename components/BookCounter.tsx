'use client'

import { useEffect } from 'react'

interface BookCounterProps {
  booksCount: number
  onBookFinished: () => void
  onAllBooksComplete: () => void
}

export default function BookCounter({
  booksCount,
  onBookFinished,
  onAllBooksComplete,
}: BookCounterProps) {
  const totalBooks = 3

  useEffect(() => {
    if (booksCount >= totalBooks) {
      onAllBooksComplete()
    }
  }, [booksCount, totalBooks, onAllBooksComplete])

  if (booksCount >= totalBooks) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white/95 backdrop-blur rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto">
          <div className="text-8xl text-center mb-6">😴</div>
          <h2 className="text-5xl font-bold text-center mb-8" style={{ color: '#4A8484' }}>
            Ready for Sleep!
          </h2>
          <p className="text-3xl text-center text-gray-700">
            All books read. Sweet dreams! 💤
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Book icons */}
      <div className="flex justify-center gap-8 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`text-9xl transition-all duration-500 ${
              i < booksCount
                ? 'opacity-100 scale-110 animate-bounce-gentle'
                : 'opacity-30 scale-90'
            }`}
          >
            📚
          </div>
        ))}
      </div>

      {/* Counter */}
      <div className="bg-white/95 backdrop-blur rounded-3xl p-12 shadow-2xl text-center">
        <h3 className="text-4xl font-bold mb-6" style={{ color: '#4A8484' }}>
          Books Read
        </h3>
        <div className="text-9xl font-bold mb-8" style={{ color: '#6FB8B8' }}>
          {booksCount} / {totalBooks}
        </div>

        {/* Button */}
        <button
          onClick={onBookFinished}
          disabled={booksCount >= totalBooks}
          className="w-full bg-gradient-to-r from-[#6FB8B8] to-[#78B8D8] hover:from-[#5CA5A5] hover:to-[#6CA7C7] disabled:opacity-50 disabled:cursor-not-allowed text-white text-4xl font-bold py-8 rounded-2xl transition-all active:scale-95 shadow-lg"
        >
          Finished a Book! 📖
        </button>
      </div>
    </div>
  )
}

