'use client'

import Link from 'next/link'

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-12">
        <h1 className="text-5xl font-bold text-center mb-8 text-gray-800">
          iPad Setup Instructions
        </h1>

        <div className="space-y-8">
          {/* Add to Home Screen */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-purple-700">
              1. Add to Home Screen
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-lg text-gray-700">
              <li>Open this app in Safari</li>
              <li>Tap the Share button (square with arrow up)</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right</li>
            </ol>
          </section>

          {/* Auto-Lock Never */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-purple-700">
              2. Disable Auto-Lock
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-lg text-gray-700">
              <li>Open Settings app</li>
              <li>Go to "Display & Brightness"</li>
              <li>Tap "Auto-Lock"</li>
              <li>Select "Never"</li>
            </ol>
            <p className="mt-4 text-sm text-gray-600">
              ⚠️ Keep iPad plugged in 24/7 to prevent battery drain
            </p>
          </section>

          {/* Guided Access */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-purple-700">
              3. Enable Guided Access (Optional)
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Guided Access locks the iPad to a single app, preventing accidental exits.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-lg text-gray-700">
              <li>Open Settings → Accessibility → Guided Access</li>
              <li>Turn on Guided Access</li>
              <li>Set a passcode (different from your PIN)</li>
              <li>Open the Sleep Clock app</li>
              <li>Triple-click the side button</li>
              <li>Tap "Start" in the top right</li>
            </ol>
            <p className="mt-4 text-sm text-gray-600">
              To exit Guided Access: Triple-click side button, enter passcode
            </p>
          </section>

          {/* Brightness */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-purple-700">
              4. Brightness & Night Mode
            </h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
              <li>
                Use the app's built-in dim overlay feature (adjust in settings)
              </li>
              <li>
                Set iPad brightness to 50-70% and use dim overlay for night-safe display
              </li>
              <li>
                Enable "Night Dim" toggle in app settings for extra dimming
              </li>
            </ul>
          </section>

          {/* Multi-device */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-purple-700">
              5. Parent Phone Access
            </h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
              <li>Install the same PWA on your phone (Add to Home Screen)</li>
              <li>Sign in with the same account</li>
              <li>Changes made on phone will sync to iPad in real-time</li>
              <li>Use the Settings panel to adjust schedules, chores, colors, etc.</li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-purple-700">
              Troubleshooting
            </h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
              <li>
                <strong>Sounds not playing:</strong> Tap "Enable Sounds" button after unlocking
              </li>
              <li>
                <strong>Settings not syncing:</strong> Check internet connection and last sync time
              </li>
              <li>
                <strong>App not updating mode:</strong> Close and reopen app, check schedule times
              </li>
              <li>
                <strong>Forgot PIN:</strong> Contact support or reinstall app (loses data in local mode)
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl px-12 py-4 rounded-xl transition-colors"
          >
            Back to App
          </Link>
        </div>
      </div>
    </div>
  )
}

