import type { QuestTemplate } from '../domain/types'

export const questLibrary: QuestTemplate[] = [
  { id: 'str-pushups', title: 'Push-ups x30', description: 'Do 30 push-ups.', stat: 'STR', baseEXP: 40, baseStatXP: 20, durationMinutes: 120 },
  { id: 'str-squats', title: 'Bodyweight squats x40', description: 'Do 40 squats.', stat: 'STR', baseEXP: 40, baseStatXP: 20, durationMinutes: 120 },
  { id: 'str-plank', title: 'Plank 2 min', description: 'Hold a plank for 2 minutes.', stat: 'STR', baseEXP: 35, baseStatXP: 18, durationMinutes: 120 },
  { id: 'vit-water', title: 'Drink 2L water', description: 'Hydrate through the day.', stat: 'VIT', baseEXP: 30, baseStatXP: 15, durationMinutes: 720 },
  { id: 'vit-sleep', title: 'Sleep 7+ hours', description: 'Log a full night of sleep.', stat: 'VIT', baseEXP: 50, baseStatXP: 25, durationMinutes: 1440 },
  { id: 'vit-walk', title: 'Walk 6000 steps', description: 'Get moving.', stat: 'VIT', baseEXP: 40, baseStatXP: 20, durationMinutes: 720 },
  { id: 'agi-earlyrise', title: 'Wake before 7am', description: 'Out of bed early.', stat: 'AGI', baseEXP: 45, baseStatXP: 22, durationMinutes: 60 },
  { id: 'agi-tidy', title: 'Tidy your space 10 min', description: 'Quick reset of your room/desk.', stat: 'AGI', baseEXP: 30, baseStatXP: 15, durationMinutes: 240 },
  { id: 'agi-nosnooze', title: 'No procrastination block', description: 'One 25-min focused task, no delay.', stat: 'AGI', baseEXP: 40, baseStatXP: 20, durationMinutes: 240 },
  { id: 'int-read', title: 'Read 10 pages', description: 'Read 10 pages of a book.', stat: 'INT', baseEXP: 40, baseStatXP: 20, durationMinutes: 360 },
  { id: 'int-study', title: 'Study 30 min', description: 'Focused study/learning.', stat: 'INT', baseEXP: 50, baseStatXP: 25, durationMinutes: 360 },
  { id: 'int-skill', title: 'Practice a skill 20 min', description: 'Deliberate practice.', stat: 'INT', baseEXP: 45, baseStatXP: 22, durationMinutes: 360 },
  { id: 'per-meditate', title: 'Meditate 10 min', description: 'Sit and breathe.', stat: 'PER', baseEXP: 40, baseStatXP: 20, durationMinutes: 480 },
  { id: 'per-journal', title: 'Journal 5 min', description: 'Write a short reflection.', stat: 'PER', baseEXP: 35, baseStatXP: 18, durationMinutes: 480 },
  { id: 'per-nodoom', title: 'No doomscroll first hour', description: 'No social feeds for the first waking hour.', stat: 'PER', baseEXP: 45, baseStatXP: 22, durationMinutes: 120 },
]
