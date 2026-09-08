import { Challenge } from '../types';

export const dailyChallenges: Challenge[] = [
  {
    id: 'morning-adhkar',
    title: 'Morning Adhkar',
    description: 'Complete all morning Adhkar',
    points: 50,
    type: 'adhkar',
    target: 1,
  },
  {
    id: 'evening-adhkar',
    title: 'Evening Adhkar',
    description: 'Complete all evening Adhkar',
    points: 50,
    type: 'adhkar',
    target: 1,
  },
  {
    id: 'quran-5-pages',
    title: 'Quran Reader',
    description: 'Recite 5 pages of the Quran',
    points: 100,
    type: 'quran',
    target: 5,
  },
  {
    id: 'tasbih-100',
    title: 'Tasbih Master',
    description: 'Perform 100 Tasbeehs',
    points: 75,
    type: 'tasbih',
    target: 100,
  },
];
