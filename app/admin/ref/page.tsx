"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { getReferentSettings, updatReferentSettings } from "@/services/api/ReferentSettings"
import { getReferentLevelRewards, updateReferentLevelRewards } from "@/services/api/ReferentLevelRewards"

interface ReferralLevel {
  level: number
  percentage: number
}

interface ReferentSettings {
  rs_id: number
  rs_ref_level: number
}

interface ReferentLevelReward {
  rlr_id: number
  rlr_level: number
  rlr_percentage: string
  rlr_is_active: boolean
}

export default function ReferralSettings() {
  const { data: referentSettings, refetch: refetchReferentSettings } = useQuery<ReferentSettings>({
    queryKey: ["referent-settings"],
    queryFn: getReferentSettings,
  })

  const { data: referentLevelRewards, refetch: refetchReferentLevelRewards } = useQuery<ReferentLevelReward[]>({
    queryKey: ["referent-level-rewards"],
    queryFn: getReferentLevelRewards,
  })

  const [maxLevel, setMaxLevel] = useState<number>(0)
  const [levels, setLevels] = useState<ReferralLevel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update maxLevel when referentSettings changes
  useEffect(() => {
    if (referentSettings?.rs_ref_level) {
      setMaxLevel(referentSettings.rs_ref_level)
    }
  }, [referentSettings])

  // Update levels when referentLevelRewards changes
  useEffect(() => {
    if (referentLevelRewards) {
      const activeLevels = referentLevelRewards
        .filter(reward => reward.rlr_is_active)
        .map(reward => ({
          level: reward.rlr_level,
          percentage: parseFloat(reward.rlr_percentage)
        }))
        .sort((a, b) => a.level - b.level)
      
      setLevels(activeLevels)
    }
  }, [referentLevelRewards])

  // Get max available level from referentLevelRewards
  const maxAvailableLevel = referentLevelRewards?.filter(reward => reward.rlr_is_active).length || 0

  const updateReferralLevel = async (newLevel: number) => {
    const temp = await updatReferentSettings({ rs_ref_level: newLevel })
    if (!temp) throw new Error('Failed to update')
    return temp
  }

  const handleMaxLevelChange = async (value: string) => {
    const newMaxLevel = parseInt(value)
    if (newMaxLevel < 1 || newMaxLevel > maxAvailableLevel) {
      toast.error(`Level must be between 1 and ${maxAvailableLevel}`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await updateReferralLevel(newMaxLevel)
      setMaxLevel(newMaxLevel)
      await refetchReferentSettings()
      toast.success('Level updated successfully')
    } catch (err) {
      setError('Failed to update level')
      toast.error('Failed to update level')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePercentageChange = async (levelId: number, value: string, currentLevel: number) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      toast.error('Percentage must be between 0 and 100')
      return
    }

    // Find the current level's data
    const currentLevelData = referentLevelRewards?.find(r => r.rlr_level === currentLevel)
    if (!currentLevelData) return

    // Check if the new value is greater than the previous level's percentage
    const previousLevel = referentLevelRewards?.find(r => r.rlr_level === currentLevel - 1)
    if (previousLevel && numValue > parseFloat(previousLevel.rlr_percentage)) {
      toast.error(`Level ${currentLevel} percentage cannot be greater than Level ${currentLevel - 1}`)
      return
    }

    // Check if the new value is less than the next level's percentage
    const nextLevel = referentLevelRewards?.find(r => r.rlr_level === currentLevel + 1)
    if (nextLevel && numValue < parseFloat(nextLevel.rlr_percentage)) {
      toast.error(`Level ${currentLevel} percentage cannot be less than Level ${currentLevel + 1}`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await updateReferentLevelRewards(levelId, { rlr_percentage: numValue })
      await refetchReferentLevelRewards()
      toast.success('Percentage updated successfully')
    } catch (err) {
      setError('Failed to update percentage')
      toast.error('Failed to update percentage')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Referral Settings</h2>
        <p className="text-muted-foreground">
          Configure referral levels and their corresponding reward percentages.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Referral Levels</CardTitle>
          <CardDescription>
            Set the maximum number of referral levels and their corresponding reward percentages.
            {referentSettings && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Current setting: {referentSettings.rs_ref_level} levels)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Label className="w-48">Maximum Number of Levels</Label>
              <Select
                value={maxLevel.toString()}
                onValueChange={handleMaxLevelChange}
                disabled={isLoading || !maxAvailableLevel}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select max level" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxAvailableLevel }, (_, i) => i + 1).map((level) => (
                    <SelectItem 
                      key={level} 
                      value={level.toString()}
                      className={level === referentSettings?.rs_ref_level ? "bg-accent" : ""}
                    >
                      {level} {level === 1 ? 'Level' : 'Levels'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {levels.slice(0, maxLevel).map((level) => {
                const rewardData = referentLevelRewards?.find(r => r.rlr_level === level.level)
                const handleUpdate = (value: string) => {
                  if (rewardData) {
                    handlePercentageChange(rewardData.rlr_id, value, level.level)
                  }
                }
                return (
                  <div key={level.level} className="flex items-center space-x-4">
                    <Label className="w-24">Level {level.level}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        defaultValue={level.percentage}
                        onBlur={(e) => handleUpdate(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdate(e.currentTarget.value)
                          }
                        }}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-32"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 