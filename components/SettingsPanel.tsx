'use client'

import { useState } from 'react'
import { Settings, Chore, Tonie, ScheduleBlock, DEFAULT_COLORS } from '@/types'
import { validateSchedule } from '@/lib/schedule'
import TimelineSchedule from './TimelineSchedule'

interface SettingsPanelProps {
  settings: Settings
  onSave: (settings: Settings) => void
  onClose: () => void
}

export default function SettingsPanel({ settings, onSave, onClose }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings)
  const [activeTab, setActiveTab] = useState<'schedule' | 'colors' | 'dim' | 'chores' | 'tonies' | 'sounds'>('schedule')
  const [errors, setErrors] = useState<string[]>([])

  const handleSave = () => {
    // Validate schedule
    const scheduleValidation = validateSchedule(localSettings.schedule)
    if (!scheduleValidation.valid) {
      setErrors(scheduleValidation.errors)
      return
    }

    setErrors([])
    onSave(localSettings)
    onClose()
  }

  const updateScheduleBlock = (index: number, updates: Partial<ScheduleBlock>) => {
    const newSchedule = [...localSettings.schedule]
    newSchedule[index] = { ...newSchedule[index], ...updates }
    setLocalSettings({ ...localSettings, schedule: newSchedule })
  }

  const updateColor = (mode: keyof typeof localSettings.colors, color: string) => {
    setLocalSettings({
      ...localSettings,
      colors: { ...localSettings.colors, [mode]: color },
    })
  }

  const updateDim = (mode: keyof typeof localSettings.dim, value: number) => {
    setLocalSettings({
      ...localSettings,
      dim: { ...localSettings.dim, [mode]: value },
    })
  }

  const addChore = () => {
    const newChore: Chore = {
      id: `chore-${Date.now()}`,
      text: 'New chore',
      emoji: '✓',
    }
    setLocalSettings({
      ...localSettings,
      chores: [...localSettings.chores, newChore],
    })
  }

  const updateChore = (index: number, updates: Partial<Chore>) => {
    const newChores = [...localSettings.chores]
    newChores[index] = { ...newChores[index], ...updates }
    setLocalSettings({ ...localSettings, chores: newChores })
  }

  const removeChore = (index: number) => {
    const newChores = localSettings.chores.filter((_, i) => i !== index)
    setLocalSettings({ ...localSettings, chores: newChores })
  }

  const addTonie = () => {
    const newTonie: Tonie = {
      id: `tonie-${Date.now()}`,
      name: 'New Tonie',
      emoji: '🎵',
    }
    setLocalSettings({
      ...localSettings,
      tonieList: [...localSettings.tonieList, newTonie],
    })
  }

  const updateTonie = (index: number, updates: Partial<Tonie>) => {
    const newTonies = [...localSettings.tonieList]
    newTonies[index] = { ...newTonies[index], ...updates }
    setLocalSettings({ ...localSettings, tonieList: newTonies })
  }

  const removeTonie = (index: number) => {
    const newTonies = localSettings.tonieList.filter((_, i) => i !== index)
    setLocalSettings({ ...localSettings, tonieList: newTonies })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <h2 className="text-3xl font-bold">Settings</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b overflow-x-auto">
          {(['schedule', 'colors', 'dim', 'chores', 'tonies', 'sounds'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
            <ul className="list-disc list-inside">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto smooth-scroll p-4 md:p-6">
          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <TimelineSchedule
              schedule={localSettings.schedule}
              colors={localSettings.colors}
              onChange={(newSchedule) =>
                setLocalSettings({ ...localSettings, schedule: newSchedule })
              }
            />
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-4">Mode Colors</h3>
              {Object.entries(localSettings.colors).map(([mode, color]) => (
                <div key={mode} className="flex items-center gap-4">
                  <label className="w-40 font-medium">{mode.replace('_', ' ')}</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(mode as any, e.target.value)}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{color}</span>
                </div>
              ))}
            </div>
          )}

          {/* Dim Tab */}
          {activeTab === 'dim' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-4">Brightness / Dim Overlay</h3>
              
              {/* Per-mode dim sliders */}
              {Object.entries(localSettings.dim).filter(([key]) => 
                ['GET_READY', 'SLEEP', 'ALMOST_WAKE', 'WAKE'].includes(key)
              ).map(([mode, value]) => (
                <div key={mode}>
                  <label className="block font-medium mb-2">
                    {mode.replace('_', ' ')} Dim: {value}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={value}
                    onChange={(e) => updateDim(mode as any, parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}

              {/* Night dim toggle */}
              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  checked={localSettings.dim.nightDimEnabled}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      dim: { ...localSettings.dim, nightDimEnabled: e.target.checked },
                    })
                  }
                  className="w-6 h-6"
                />
                <label className="font-medium">Enable Night Dim (adds 20%)</label>
              </div>

              {/* Auto-dim after routine */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localSettings.dim.autoDimAfterRoutine}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      dim: { ...localSettings.dim, autoDimAfterRoutine: e.target.checked },
                    })
                  }
                  className="w-6 h-6"
                />
                <label className="font-medium">Auto-dim deeper after chores/books complete</label>
              </div>
            </div>
          )}

          {/* Chores Tab */}
          {activeTab === 'chores' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Chores</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.choresEnabled}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        choresEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <span className="font-medium">Enable Chores</span>
                </label>
              </div>

              {localSettings.choresEnabled && (
                <>
                  <div className="mb-4">
                    <label className="block font-medium mb-2">Reward Text</label>
                    <input
                      type="text"
                      value={localSettings.rewardText}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          rewardText: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="e.g., Nice block!"
                    />
                  </div>

                  {localSettings.chores.map((chore, index) => (
                    <div key={chore.id} className="bg-gray-100 rounded-lg p-4">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={chore.emoji}
                          onChange={(e) => updateChore(index, { emoji: e.target.value })}
                          className="w-16 px-2 py-2 border rounded text-center text-2xl"
                          placeholder="emoji"
                        />
                        <input
                          type="text"
                          value={chore.text}
                          onChange={(e) => updateChore(index, { text: e.target.value })}
                          className="flex-1 px-4 py-2 border rounded-lg"
                          placeholder="Chore description"
                        />
                        <button
                          onClick={() => removeChore(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addChore}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
                  >
                    Add Chore
                  </button>
                </>
              )}
            </div>
          )}

          {/* Tonies Tab */}
          {activeTab === 'tonies' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Tonies</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.tonieEnabled}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        tonieEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <span className="font-medium">Enable Tonie Chooser</span>
                </label>
              </div>

              {localSettings.tonieEnabled && (
                <>
                  <div className="mb-4">
                    <label className="block font-medium mb-2">
                      Chooser Duration (seconds, 0 = wait until chosen)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={localSettings.tonieChooserDuration}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          tonieChooserDuration: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  {localSettings.tonieList.map((tonie, index) => (
                    <div key={tonie.id} className="bg-gray-100 rounded-lg p-4">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          value={tonie.emoji}
                          onChange={(e) => updateTonie(index, { emoji: e.target.value })}
                          className="w-16 px-2 py-2 border rounded text-center text-2xl"
                          placeholder="emoji"
                        />
                        <input
                          type="text"
                          value={tonie.name}
                          onChange={(e) => updateTonie(index, { name: e.target.value })}
                          className="flex-1 px-4 py-2 border rounded-lg"
                          placeholder="Tonie name"
                        />
                        <button
                          onClick={() => removeTonie(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addTonie}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
                  >
                    Add Tonie
                  </button>
                </>
              )}
            </div>
          )}

          {/* Sounds Tab */}
          {activeTab === 'sounds' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-4">Sounds</h3>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      soundEnabled: e.target.checked,
                    })
                  }
                  className="w-6 h-6"
                />
                <label className="font-medium">Enable Chimes</label>
              </div>

              {localSettings.soundEnabled && (
                <div>
                  <label className="block font-medium mb-2">
                    Volume: {localSettings.soundVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localSettings.soundVolume}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        soundVolume: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localSettings.showClock}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      showClock: e.target.checked,
                    })
                  }
                  className="w-6 h-6"
                />
                <label className="font-medium">Show Clock on Mode Screen</label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

