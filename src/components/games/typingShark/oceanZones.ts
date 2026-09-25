import { OceanZone } from '../../../types/typingShark';

export const OCEAN_ZONES: OceanZone[] = [
  {
    id: 1,
    name: 'Vùng Nước Nông Rạn San Hô',
    title: 'Zone 1: Coral Shallows (0 - 5 phút)',
    depthStr: 'Độ sâu: 0m - 500m',
    bgGradTop: '#0369a1',
    bgGradMid: '#075985',
    bgGradBottom: '#0c4a6e',
    causticColor: '#38bdf8',
    causticAlpha: 0.12,
    bubbleColor: 'rgba(186, 230, 253, 0.35)',
  },
  {
    id: 2,
    name: 'Phế Tích Biển Chạng Vạng',
    title: 'Zone 2: Twilight Sunken Ruins (5 - 10 phút)',
    depthStr: 'Độ sâu: 500m - 1,500m',
    bgGradTop: '#3b0764',
    bgGradMid: '#1e1b4b',
    bgGradBottom: '#0f172a',
    causticColor: '#c084fc',
    causticAlpha: 0.08,
    bubbleColor: 'rgba(233, 213, 255, 0.35)',
  },
  {
    id: 3,
    name: 'Rãnh Biển Băng Cổ Đới',
    title: 'Zone 3: Glacial Hadal Trench (10 - 15 phút)',
    depthStr: 'Độ sâu: 1,500m - 4,000m',
    bgGradTop: '#083344',
    bgGradMid: '#022c22',
    bgGradBottom: '#020617',
    causticColor: '#22d3ee',
    causticAlpha: 0.06,
    bubbleColor: 'rgba(165, 243, 252, 0.4)',
  },
  {
    id: 4,
    name: 'Vực Lửa Nham Thạch Núi Lửa',
    title: 'Zone 4: Subsea Volcanic Magma (15 - 20 phút)',
    depthStr: 'Độ sâu: 4,000m - 7,500m',
    bgGradTop: '#450a0a',
    bgGradMid: '#2e1065',
    bgGradBottom: '#030712',
    causticColor: '#f97316',
    causticAlpha: 0.1,
    bubbleColor: 'rgba(254, 215, 170, 0.35)',
  },
  {
    id: 5,
    name: 'Hư Không Vực Thẳm Nguyên Thủy',
    title: 'Zone 5: Void Singularity Nexus (20 - 25+ phút)',
    depthStr: 'Độ sâu: 7,500m - Vô Tận',
    bgGradTop: '#18181b',
    bgGradMid: '#09090b',
    bgGradBottom: '#000000',
    causticColor: '#a855f7',
    causticAlpha: 0.14,
    bubbleColor: 'rgba(192, 132, 252, 0.45)',
  },
];

export function getZoneByTime(seconds: number): OceanZone {
  if (seconds < 300) return OCEAN_ZONES[0];
  if (seconds < 600) return OCEAN_ZONES[1];
  if (seconds < 900) return OCEAN_ZONES[2];
  if (seconds < 1200) return OCEAN_ZONES[3];
  return OCEAN_ZONES[4];
}
