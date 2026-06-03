import { Zap, Waves, BarChart2, Building2, Filter, CheckSquare, Target } from 'lucide-react';
import Lesson1 from '../lessons/Lesson1_MarketStructure';
import Lesson2 from '../lessons/Lesson2_OrderFlow';
import Lesson3 from '../lessons/Lesson3_OrderBlocks';
import Lesson4 from '../lessons/Lesson4_LiquiditySweeps';
import Lesson5 from '../lessons/Lesson5_VolumeVSA';
import Lesson6 from '../lessons/Lesson6_ConfirmationsRejections';
import Lesson7 from '../lessons/Lesson7_FinalExam';

export const LESSONS_META = [
  { id: 'lesson-1', module: 'Market Structure', icon: Building2,   title: 'Lesson 1 — Market Structure & BOS/CHoCH',       subtitle: 'Read the trend, identify breaks and character changes', difficulty: 'Beginner'     },
  { id: 'lesson-2', module: 'Order Flow',        icon: Zap,         title: 'Lesson 2 — Order Flow & Fair Value Gaps',       subtitle: 'Imbalances, FVGs, and where price is drawn',            difficulty: 'Beginner'     },
  { id: 'lesson-3', module: 'Order Blocks',      icon: Filter,      title: 'Lesson 3 — Order Blocks',                       subtitle: 'Where smart money enters and defends',                   difficulty: 'Intermediate' },
  { id: 'lesson-4', module: 'Liquidity',         icon: Waves,       title: 'Lesson 4 — Liquidity Sweeps & Stop Hunts',      subtitle: 'How institutions hunt stops and reverse',               difficulty: 'Intermediate' },
  { id: 'lesson-5', module: 'Volume & VSA',      icon: BarChart2,   title: 'Lesson 5 — Volume Profile & VSA',               subtitle: 'Volume effort vs. result — climax and continuation',    difficulty: 'Intermediate' },
  { id: 'lesson-6', module: 'Confirmations',     icon: CheckSquare, title: 'Lesson 6 — Confirmations vs. Rejections',       subtitle: 'Valid setups vs. traps — what confirms and what kills', difficulty: 'Advanced'     },
  { id: 'lesson-7', module: 'Final Exam',        icon: Target,      title: 'Final Lesson — Live Mock Setups',               subtitle: 'Apply the full strategy across 10 real-world setups',   difficulty: 'Advanced'     },
];

export const LESSONS_MAP = {
  'lesson-1': Lesson1,
  'lesson-2': Lesson2,
  'lesson-3': Lesson3,
  'lesson-4': Lesson4,
  'lesson-5': Lesson5,
  'lesson-6': Lesson6,
  'lesson-7': Lesson7,
};
