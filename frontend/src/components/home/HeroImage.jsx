export default function HeroImage({ className = '' }) {
  return (
    <picture>
      <source
        type="image/avif"
        srcSet="/public/images/hero/farm-786.avif 786w, /public/images/hero/farm-1280.avif 1280w"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <source
        type="image/webp"
        srcSet="/public/images/hero/farm-768.webp 768w, /public/images/hero/farm-1280.webp 1280w"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <img
        src="/images/hero/farm-1280.webp"
        alt="Farmers harvesting in Bangladesh"
        width="1280" height="960"
        loading="eager"
        fetchpriority="high"
        decoding="async"
        className={`w-full h-auto rounded-2xl shadow-2xl ${className}`}
      />
    </picture>
  );
}