'use client'

import { useEffect } from 'react'

interface BookCounterProps {
  booksCount: number
  childName?: string
  onBookFinished: () => void
  onAllBooksComplete: () => void
}

export default function BookCounter({
  booksCount,
  childName,
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
      <div className="animate-pop">
        <div className="bg-white/95 backdrop-blur rounded-[3rem] p-12 md:p-16 shadow-2xl max-w-3xl mx-auto border-8 border-blue-400">
          <div className="text-[12rem] text-center mb-8 animate-bounce-gentle">😴</div>
          <h2 className="text-6xl md:text-8xl font-black text-center text-purple-900 mb-8">
            {childName ? `All Done, ${childName}!` : 'All Done!'}
          </h2>
          <p className="text-4xl md:text-5xl text-center text-gray-800 font-bold">
            Time to sleep! Sweet dreams{childName ? `, ${childName}` : ''}! 💤
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4">
      {/* Book icons - BIGGER and more animated */}
      <div className="flex justify-center gap-8 md:gap-12 mb-12">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`text-[8rem] md:text-[10rem] transition-all duration-700 ${
              i < booksCount
                ? 'opacity-100 scale-110 animate-bounce-gentle drop-shadow-2xl'
                : 'opacity-20 scale-75 grayscale'
            }`}
          >
            📚
          </div>
        ))}
      </div>

      {/* Counter - MORE PLAYFUL */}
      <div className="bg-white/95 backdrop-blur rounded-[3rem] p-10 md:p-16 shadow-2xl text-center border-8 border-purple-400">
        <h3 className="text-5xl md:text-6xl font-black text-purple-900 mb-8">
          Books Read!
        </h3>
        <div className="text-[8rem] md:text-[10rem] font-black text-purple-600 mb-12 animate-pulse-gentle">
          {booksCount} / {totalBooks}
        </div>

        {/* Encouragement */}
        {booksCount === 0 && (
          <p className="text-3xl md:text-4xl font-bold text-gray-700 mb-8">
            Read your first book! 📖
          </p>
        )}
        {booksCount === 1 && (
          <p className="text-3xl md:text-4xl font-bold text-purple-700 mb-8 animate-wiggle">
            Great job! Two more! 🌟
          </p>
        )}
        {booksCount === 2 && (
          <p className="text-3xl md:text-4xl font-bold text-purple-700 mb-8 animate-bounce-gentle">
            Almost done! One more! 🎉
          </p>
        )}

        {/* Button - BIGGER */}
        <button
          onClick={onBookFinished}
          disabled={booksCount >= totalBooks}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-5xl md:text-6xl font-black py-10 md:py-12 rounded-3xl transition-all active:scale-95 shadow-2xl transform hover:scale-105 border-4 border-white"
        >
          Finished a Book! 📖
        </button>
      </div>
    </div>
  )
}

