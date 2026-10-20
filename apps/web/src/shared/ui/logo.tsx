import { cn } from '@/shared/lib';
import globeIcon from '@/shared/assets/logo/globe.webp';

const vectorModules = import.meta.glob<string>('../assets/logo/vector-*.svg', {
  eager: true,
  import: 'default',
});

const VECTOR_INSETS = [
  '25.44% 32.21% 43.13% 59.1%',
  '25.44% 36.4% 45.97% 59.1%',
  '55.03% 32.21% 43.13% 65.79%',
  '56.24% 39.09% 43.17% 59.34%',
  '38.52% 35.5% 59.19% 60.94%',
  '33.71% 11.11% 43.14% 81.34%',
  '46.16% 11.18% 53.22% 83.77%',
  '46.43% 15.52% 49.54% 82.94%',
  '41.85% 12.83% 56.33% 82.99%',
  '25.34% 0.95% 42.82% 89.69%',
  '40.42% 0.95% 42.82% 90.29%',
  '33.58% 8.78% 47.27% 89.69%',
  '31.44% 6.84% 54.7% 91.5%',
  '29.84% 2.73% 67.5% 93.56%',
  '33.84% 24.71% 42.92% 68.47%',
  '25.81% 46.27% 43.03% 43.93%',
  '54.17% 50% 43.03% 47.8%',
  '25.84% 17.35% 43.5% 74.99%',
  '26.36% 21.84% 68.95% 74.99%',
  '30.29% 17.44% 68.94% 79.57%',
  '30.99% 21.84% 60.13% 77.98%',
  '25.87% 42.99% 43.7% 55.15%',
  '25.87% 44.19% 43.88% 55.15%',
] as const;

const LOGO_VECTORS = VECTOR_INSETS.map((inset, index) => ({
  inset,
  src: vectorModules[`../assets/logo/vector-${index}.svg`],
}));

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn('relative block aspect-[252/85]', className)} aria-hidden="true">
      <span className="absolute top-[-17.65%] left-[1.98%] h-[96.47%] w-[32.14%] overflow-hidden">
        <img
          src={globeIcon}
          alt=""
          className="absolute top-[-5%] left-[-5%] h-[125%] w-[250%] max-w-none"
        />
      </span>
      {LOGO_VECTORS.map(({ inset, src }) => (
        <span key={inset} className="absolute" style={{ inset }}>
          <img src={src} alt="" className="absolute inset-0 block size-full max-w-none" />
        </span>
      ))}
    </span>
  );
}
